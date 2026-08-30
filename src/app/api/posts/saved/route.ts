import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, savedPosts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { sanitizeAnonRow } from "@/lib/anonymity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Query saved post records ordered by most recently saved
    const savedRecords = await db.query.savedPosts.findMany({
      where: eq(savedPosts.profileId, profile.id),
      orderBy: [desc(savedPosts.createdAt)],
      limit,
      offset,
    });

    if (savedRecords.length === 0) {
      return NextResponse.json({
        posts: [],
        total: 0,
        page,
        hasMore: false,
      });
    }

    const postIds = savedRecords.map((r) => r.postId);

    const postRows = await db.query.posts.findMany({
      where: inArray(posts.id, postIds),
      with: {
        author: true,
        institution: true,
        community: true,
        votes: true,
        comments: {
          with: {
            author: true,
          },
        },
        pollOptions: {
          with: {
            votes: true,
          },
        },
      },
    });

    // Reorder matching saved order
    const postMap = new Map(postRows.map((p) => [p.id, p]));
    const orderedPosts = postIds
      .map((id) => postMap.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((post) => {
        const sanitized = sanitizeAnonRow(post);
        return {
          ...sanitized,
          isSaved: true,
        };
      });

    return NextResponse.json({
      posts: orderedPosts,
      page,
      limit,
      hasMore: savedRecords.length === limit,
    });
  } catch (error) {
    console.error("GET /api/posts/saved error:", error);
    return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 });
  }
}
