import { and, desc, eq, ilike, inArray, lt, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { follows, institutions, reelLikes, reels, userProfiles, votes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
    const cursor = url.searchParams.get("cursor");
    const search = url.searchParams.get("q")?.trim() || "";

    const db = getDb();

    // Authenticated viewer if present
    let viewerProfileId: string | null = null;
    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const vp = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
          columns: { id: true },
        });
        viewerProfileId = vp?.id || null;
      }
    } catch {}

    const conditions = [eq(votes.postId, id), eq(votes.value, 1)];

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!Number.isNaN(cursorDate.getTime())) {
        conditions.push(lt(votes.createdAt, cursorDate));
      }
    }

    if (search) {
      const qPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(userProfiles.displayName, qPattern),
          ilike(userProfiles.username, qPattern),
          ilike(userProfiles.branch, qPattern)
        )!
      );
    }

    const rows = await db
      .select({
        id: userProfiles.id,
        displayName: userProfiles.displayName,
        username: userProfiles.username,
        avatarUrl: userProfiles.avatarUrl,
        points: userProfiles.points,
        branch: userProfiles.branch,
        year: userProfiles.year,
        institutionName: institutions.name,
        likedAt: votes.createdAt,
      })
      .from(votes)
      .innerJoin(userProfiles, eq(votes.userId, userProfiles.id))
      .leftJoin(institutions, eq(userProfiles.institutionId, institutions.id))
      .where(and(...conditions))
      .orderBy(desc(votes.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const pagedRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor =
      hasMore && pagedRows.length > 0 ? pagedRows[pagedRows.length - 1].likedAt.toISOString() : null;

    if (rows.length === 0) {
      const reel = await db.query.reels.findFirst({
        where: eq(reels.id, id),
      });

      if (reel) {
        const reelConditions = [eq(reelLikes.reelId, id)];
        if (cursor) {
          const cursorDate = new Date(cursor);
          if (!Number.isNaN(cursorDate.getTime())) {
            reelConditions.push(lt(reelLikes.createdAt, cursorDate));
          }
        }

        if (search) {
          const qPattern = `%${search}%`;
          reelConditions.push(
            or(
              ilike(userProfiles.displayName, qPattern),
              ilike(userProfiles.username, qPattern),
              ilike(userProfiles.branch, qPattern)
            )!
          );
        }

        const reelLikeRows = await db
          .select({
            id: userProfiles.id,
            displayName: userProfiles.displayName,
            username: userProfiles.username,
            avatarUrl: userProfiles.avatarUrl,
            points: userProfiles.points,
            branch: userProfiles.branch,
            year: userProfiles.year,
            institutionName: institutions.name,
            likedAt: reelLikes.createdAt,
          })
          .from(reelLikes)
          .innerJoin(userProfiles, eq(reelLikes.userId, userProfiles.id))
          .leftJoin(institutions, eq(userProfiles.institutionId, institutions.id))
          .where(and(...reelConditions))
          .orderBy(desc(reelLikes.createdAt))
          .limit(limit + 1);

        const hasMoreReelLikes = reelLikeRows.length > limit;
        const pagedReelRows = hasMoreReelLikes ? reelLikeRows.slice(0, limit) : reelLikeRows;
        const nextReelCursor =
          hasMoreReelLikes && pagedReelRows.length > 0
            ? pagedReelRows[pagedReelRows.length - 1].likedAt.toISOString()
            : null;

        let reelFollowingSet = new Set<string>();
        if (viewerProfileId && pagedReelRows.length > 0) {
          const targetIds = pagedReelRows.map((r) => r.id);
          const followRows = await db
            .select({ followingId: follows.followingId })
            .from(follows)
            .where(and(eq(follows.followerId, viewerProfileId), inArray(follows.followingId, targetIds)));
          reelFollowingSet = new Set(followRows.map((f) => f.followingId));
        }

        const [reelCountResult] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(reelLikes)
          .where(eq(reelLikes.reelId, id));

        const reelUsers = pagedReelRows.map((v) => ({
          id: v.id,
          displayName: v.displayName,
          username: v.username,
          avatarUrl: v.avatarUrl,
          points: v.points,
          branch: v.branch,
          year: v.year,
          institutionName: v.institutionName?.split(",")[0] || "Campus",
          isVerified: Boolean((v.points || 0) >= 150),
          isFollowing: reelFollowingSet.has(v.id),
          isSelf: viewerProfileId === v.id,
          likedAt: v.likedAt,
        }));

        return NextResponse.json({
          likesCount: reelCountResult?.count ?? reelUsers.length,
          users: reelUsers,
          nextCursor: nextReelCursor,
          hasMore: hasMoreReelLikes,
        });
      }
    }

    // Check follows for viewer
    let followingSet = new Set<string>();
    if (viewerProfileId && pagedRows.length > 0) {
      const targetIds = pagedRows.map((r) => r.id);
      const followRows = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(and(eq(follows.followerId, viewerProfileId), inArray(follows.followingId, targetIds)));
      followingSet = new Set(followRows.map((f) => f.followingId));
    }

    // Total count of likes for this post
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(votes)
      .where(and(eq(votes.postId, id), eq(votes.value, 1)));

    const users = pagedRows.map((v) => ({
      id: v.id,
      displayName: v.displayName,
      username: v.username,
      avatarUrl: v.avatarUrl,
      points: v.points,
      branch: v.branch,
      year: v.year,
      institutionName: v.institutionName?.split(",")[0] || "Campus",
      isVerified: Boolean((v.points || 0) >= 150),
      isFollowing: followingSet.has(v.id),
      isSelf: viewerProfileId === v.id,
      likedAt: v.likedAt,
    }));

    return NextResponse.json({
      likesCount: countResult?.count ?? users.length,
      users,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching post likes:", error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}
