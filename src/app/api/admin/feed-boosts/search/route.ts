import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Find something to boost.
 *
 * Returns both posts and students for one query string, so the admin types a
 * name or a phrase and picks from a single list rather than deciding up front
 * which kind of thing they are looking for.
 */
export async function GET(req: NextRequest) {
  try {
    await resolveAdminSession();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (q.length < 2) {
      return NextResponse.json({ posts: [], profiles: [] });
    }

    const db = getDb();
    const like = `%${q}%`;

    const [postRows, profileRows] = await Promise.all([
      db
        .select({
          id: posts.id,
          title: posts.title,
          body: posts.body,
          type: posts.type,
          isAnonymous: posts.isAnonymous,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
          votes: sql<number>`coalesce((select count(*)::int from votes where votes.post_id = ${posts.id}), 0)`,
        })
        .from(posts)
        // An exact id paste is the common case when an admin is looking at a
        // post already; the ILIKE covers browsing by phrase.
        .where(
          and(
            eq(posts.status, "PUBLISHED"),
            or(eq(posts.id, q), ilike(posts.body, like), ilike(posts.title, like))
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(12),

      db
        .select({
          id: userProfiles.id,
          username: userProfiles.username,
          displayName: userProfiles.displayName,
          avatarUrl: userProfiles.avatarUrl,
          points: userProfiles.points,
          institutionId: userProfiles.institutionId,
        })
        .from(userProfiles)
        .where(
          or(
            eq(userProfiles.id, q),
            ilike(userProfiles.username, like),
            ilike(userProfiles.displayName, like)
          )
        )
        .orderBy(desc(userProfiles.points))
        .limit(12),
    ]);

    return NextResponse.json({
      posts: postRows.map((post) => ({
        id: post.id,
        label: post.title || post.body.slice(0, 120),
        type: post.type,
        isAnonymous: post.isAnonymous,
        votes: post.votes,
        createdAt: post.createdAt,
      })),
      profiles: profileRows,
    });
  } catch (error) {
    console.error("GET /api/admin/feed-boosts/search error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
