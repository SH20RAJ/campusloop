import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { follows, institutions, userProfiles } from "@/db/schema";

export const FOLLOW_LIST_PAGE_SIZE = 20;

/**
 * "followers"  — students who follow this profile
 * "following"  — students this profile follows
 * "friends"    — mutual follows (both directions exist)
 */
export type FollowDirection = "followers" | "following" | "friends";

export interface FollowListUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  points: number;
  institutionName: string | null;
  followedAt: Date;
  isFollowedByViewer: boolean;
  isFriendOfViewer: boolean;
  isMutualWithProfile: boolean;
  isViewer: boolean;
}

export interface FollowListPage {
  items: FollowListUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
  friendsCount: number;
}

/**
 * Follower / following / friend counts for a profile in a single round trip.
 * Every branch is served by an index on follows, so this stays cheap as the
 * graph grows.
 */
export async function getFollowCounts(profileId: string): Promise<FollowCounts> {
  const db = getDb();
  const [row] = await db
    .select({
      followersCount: sql<number>`count(*) filter (where ${follows.followingId} = ${profileId})::int`,
      followingCount: sql<number>`count(*) filter (where ${follows.followerId} = ${profileId})::int`,
      friendsCount: sql<number>`count(*) filter (where ${follows.followerId} = ${profileId} and ${follows.isMutual})::int`,
    })
    .from(follows)
    .where(or(eq(follows.followingId, profileId), eq(follows.followerId, profileId)));

  return {
    followersCount: row?.followersCount ?? 0,
    followingCount: row?.followingCount ?? 0,
    friendsCount: row?.friendsCount ?? 0,
  };
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;
  const db = getDb();
  const row = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    columns: { id: true },
  });
  return Boolean(row);
}

/**
 * Counts plus the viewer's relationship to a profile. Used by profile pages so
 * one header row costs two queries rather than four.
 */
export async function getFollowState(profileId: string, viewerId?: string | null) {
  const db = getDb();

  const [counts, edge] = await Promise.all([
    getFollowCounts(profileId),
    viewerId && viewerId !== profileId
      ? db.query.follows.findFirst({
          where: and(eq(follows.followerId, viewerId), eq(follows.followingId, profileId)),
          columns: { id: true, isMutual: true },
        })
      : Promise.resolve(undefined),
  ]);

  return {
    ...counts,
    isFollowedByViewer: Boolean(edge),
    isFriendOfViewer: Boolean(edge?.isMutual),
  };
}

export interface FollowMutationResult {
  isFollowing: boolean;
  /** True only when this call created a brand new edge — used to gate notifications. */
  created: boolean;
  isFriend: boolean;
}

/**
 * Create a follow edge and promote both edges to "friends" when the reverse
 * edge already exists. The unique (follower_id, following_id) index makes a
 * repeat call a no-op rather than a duplicate row.
 */
export async function followUser(followerId: string, followingId: string): Promise<FollowMutationResult> {
  const db = getDb();

  const inserted = await db
    .insert(follows)
    .values({ followerId, followingId })
    .onConflictDoNothing()
    .returning({ id: follows.id });

  // Flip both directions in one self-guarding statement: it only fires when
  // both edges are present, so a partial write can never mark a false friend.
  const promoted = await db.execute(sql`
    UPDATE ${follows} f
    SET is_mutual = TRUE
    WHERE (
        (f.follower_id = ${followerId} AND f.following_id = ${followingId})
        OR (f.follower_id = ${followingId} AND f.following_id = ${followerId})
      )
      AND NOT f.is_mutual
      AND EXISTS (
        SELECT 1 FROM follows r
        WHERE r.follower_id = ${followingId} AND r.following_id = ${followerId}
      )
      AND EXISTS (
        SELECT 1 FROM follows r
        WHERE r.follower_id = ${followerId} AND r.following_id = ${followingId}
      )
    RETURNING f.id
  `);

  const becameFriends = (promoted.rows?.length ?? 0) > 0;
  const isFriend = becameFriends || (!inserted.length && (await areFriends(followerId, followingId)));

  return { isFollowing: true, created: inserted.length > 0, isFriend };
}

/**
 * Remove a follow edge. The reverse edge survives but is demoted out of
 * "friends", since the relationship is no longer mutual.
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<FollowMutationResult> {
  const db = getDb();

  await db
    .delete(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));

  await db
    .update(follows)
    .set({ isMutual: false })
    .where(
      and(
        eq(follows.followerId, followingId),
        eq(follows.followingId, followerId),
        eq(follows.isMutual, true)
      )
    );

  return { isFollowing: false, created: false, isFriend: false };
}

export async function areFriends(a: string, b: string): Promise<boolean> {
  if (a === b) return false;
  const db = getDb();
  const row = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, a), eq(follows.followingId, b), eq(follows.isMutual, true)),
    columns: { id: true },
  });
  return Boolean(row);
}

/** Cursor is `<createdAt ISO>_<follow row id>`, keeping keyset pagination stable across ties. */
function encodeCursor(createdAt: Date, rowId: string): string {
  return `${createdAt.toISOString()}_${rowId}`;
}

function decodeCursor(cursor?: string | null): { createdAt: Date; rowId: string } | null {
  if (!cursor) return null;
  const separator = cursor.indexOf("_");
  if (separator === -1) return null;
  const createdAt = new Date(cursor.slice(0, separator));
  const rowId = cursor.slice(separator + 1);
  if (Number.isNaN(createdAt.getTime()) || !rowId) return null;
  return { createdAt, rowId };
}

/**
 * One page of a profile's followers, the people it follows, or its friends
 * (mutual follows) — newest first.
 *
 * Costs two indexed queries at most: the keyset page itself, and a batched
 * lookup of the viewer's own edges to those users, so the row-level follow
 * buttons never become N+1 requests.
 */
export async function getFollowListPage({
  profileId,
  direction,
  viewerId,
  cursor,
  limit = FOLLOW_LIST_PAGE_SIZE,
}: {
  profileId: string;
  direction: FollowDirection;
  viewerId?: string | null;
  cursor?: string | null;
  limit?: number;
}): Promise<FollowListPage> {
  const db = getDb();
  const pageSize = Math.min(Math.max(limit, 1), 50);

  // "followers" walks the rows pointing at this profile; "following" and
  // "friends" walk the rows it owns — friends additionally filtered to mutual
  // edges, which the follows_mutual_created_idx partial index serves directly.
  const anchorColumn = direction === "followers" ? follows.followingId : follows.followerId;
  const subjectColumn = direction === "followers" ? follows.followerId : follows.followingId;

  const decoded = decodeCursor(cursor);
  const conditions = [eq(anchorColumn, profileId)];
  if (direction === "friends") {
    conditions.push(eq(follows.isMutual, true));
  }
  if (decoded) {
    conditions.push(
      or(
        lt(follows.createdAt, decoded.createdAt),
        and(eq(follows.createdAt, decoded.createdAt), lt(follows.id, decoded.rowId))
      )!
    );
  }

  const rows = await db
    .select({
      rowId: follows.id,
      followedAt: follows.createdAt,
      isMutualWithProfile: follows.isMutual,
      id: userProfiles.id,
      username: userProfiles.username,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
      headline: userProfiles.headline,
      bio: userProfiles.bio,
      points: userProfiles.points,
      institutionName: institutions.name,
    })
    .from(follows)
    .innerJoin(userProfiles, eq(userProfiles.id, subjectColumn))
    .leftJoin(institutions, eq(institutions.id, userProfiles.institutionId))
    .where(and(...conditions))
    .orderBy(desc(follows.createdAt), desc(follows.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const pageRows = hasMore ? rows.slice(0, pageSize) : rows;

  // Batch the viewer's own edges to everyone on this page in one query.
  const viewerEdges = new Map<string, boolean>();
  const otherIds = pageRows.map((r) => r.id).filter((id) => id !== viewerId);
  if (viewerId && otherIds.length > 0) {
    const existing = await db
      .select({ followingId: follows.followingId, isMutual: follows.isMutual })
      .from(follows)
      .where(and(eq(follows.followerId, viewerId), inArray(follows.followingId, otherIds)));
    for (const edge of existing) {
      viewerEdges.set(edge.followingId, edge.isMutual);
    }
  }

  const items: FollowListUser[] = pageRows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    headline: row.headline,
    bio: row.bio,
    points: row.points ?? 0,
    institutionName: row.institutionName ?? null,
    followedAt: row.followedAt,
    isFollowedByViewer: viewerEdges.has(row.id),
    isFriendOfViewer: viewerEdges.get(row.id) === true,
    isMutualWithProfile: row.isMutualWithProfile,
    isViewer: row.id === viewerId,
  }));

  const last = pageRows[pageRows.length - 1];

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(last.followedAt, last.rowId) : null,
    hasMore,
  };
}
