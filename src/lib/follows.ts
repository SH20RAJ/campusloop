import { getDb } from "@/db";
import { follows,institutions,userProfiles } from "@/db/schema";
import { and,desc,eq,inArray,lt,or,sql } from "drizzle-orm";

export const FOLLOW_LIST_PAGE_SIZE = 20;

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
  isViewer: boolean;
}

export interface FollowListPage {
  items: FollowListUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Follower + following counts for a profile, in a single round trip.
 */
export async function getFollowCounts(profileId: string): Promise<{
  followersCount: number;
  followingCount: number;
}> {
  const db = getDb();
  const [row] = await db
    .select({
      followersCount: sql<number>`count(*) filter (where ${follows.followingId} = ${profileId})::int`,
      followingCount: sql<number>`count(*) filter (where ${follows.followerId} = ${profileId})::int`,
    })
    .from(follows)
    .where(or(eq(follows.followingId, profileId), eq(follows.followerId, profileId)));

  return {
    followersCount: row?.followersCount ?? 0,
    followingCount: row?.followingCount ?? 0,
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
 * Counts plus the viewer's follow state for a profile. Used by profile pages so
 * they don't fire three separate queries for one header row.
 */
export async function getFollowState(profileId: string, viewerId?: string | null) {
  const [counts, viewerFollows] = await Promise.all([
    getFollowCounts(profileId),
    viewerId && viewerId !== profileId ? isFollowing(viewerId, profileId) : Promise.resolve(false),
  ]);

  return { ...counts, isFollowedByViewer: viewerFollows };
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
 * One page of a profile's followers ("followers") or the people it follows
 * ("following"), newest first.
 *
 * Runs two indexed queries at most: the keyset page itself, and a batched
 * lookup of which of those users the viewer already follows — so the row-level
 * follow buttons never turn into N+1 requests.
 */
export async function getFollowListPage({
  profileId,
  direction,
  viewerId,
  cursor,
  limit = FOLLOW_LIST_PAGE_SIZE,
}: {
  profileId: string;
  direction: "followers" | "following";
  viewerId?: string | null;
  cursor?: string | null;
  limit?: number;
}): Promise<FollowListPage> {
  const db = getDb();
  const pageSize = Math.min(Math.max(limit, 1), 50);

  // "followers" walks rows pointing at this profile; "following" walks rows it owns.
  const anchorColumn = direction === "followers" ? follows.followingId : follows.followerId;
  const subjectColumn = direction === "followers" ? follows.followerId : follows.followingId;

  const decoded = decodeCursor(cursor);
  const conditions = [eq(anchorColumn, profileId)];
  if (decoded) {
    conditions.push(
      or(
        lt(follows.createdAt, decoded.createdAt),
        and(eq(follows.createdAt, decoded.createdAt), lt(follows.id, decoded.rowId)),
      )!,
    );
  }

  const rows = await db
    .select({
      rowId: follows.id,
      followedAt: follows.createdAt,
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

  // Batch the viewer's follow state for everyone on this page in one query.
  let followedByViewer = new Set<string>();
  const otherIds = pageRows.map((r) => r.id).filter((id) => id !== viewerId);
  if (viewerId && otherIds.length > 0) {
    const existing = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(and(eq(follows.followerId, viewerId), inArray(follows.followingId, otherIds)));
    followedByViewer = new Set(existing.map((r) => r.followingId));
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
    isFollowedByViewer: followedByViewer.has(row.id),
    isViewer: row.id === viewerId,
  }));

  const last = pageRows[pageRows.length - 1];

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(last.followedAt, last.rowId) : null,
    hasMore,
  };
}
