import { type NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { reelComments, reels, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reelId } = await props.params;
    const db = getDb();

    const commentsList = await db
      .select({
        id: reelComments.id,
        body: reelComments.body,
        createdAt: reelComments.createdAt,
        author: {
          id: userProfiles.id,
          name: userProfiles.displayName,
          username: userProfiles.username,
          avatarUrl: userProfiles.avatarUrl,
        },
      })
      .from(reelComments)
      .leftJoin(userProfiles, eq(reelComments.authorId, userProfiles.id))
      .where(eq(reelComments.reelId, reelId))
      .orderBy(desc(reelComments.createdAt))
      .limit(50);

    return NextResponse.json({
      comments: commentsList.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        author: {
          id: c.author?.id || "anon",
          name: c.author?.name || "Student",
          username: c.author?.username || "student",
          avatarUrl: c.author?.avatarUrl,
        },
      })),
    });
  } catch (error) {
    console.error("[GET /api/reels/[id]/comments error]:", error);
    return NextResponse.json({ error: "Failed to fetch comments", comments: [] }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reelId } = await props.params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bodyJson = (await req.json()) as { body?: string };
    const commentBody = (bodyJson.body || "").trim();
    if (!commentBody) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [newComment] = await db
      .insert(reelComments)
      .values({
        reelId,
        authorId: profile.id,
        body: commentBody,
      })
      .returning();

    await db
      .update(reels)
      .set({
        commentsCount: sql`${reels.commentsCount} + 1`,
      })
      .where(eq(reels.id, reelId));

    return NextResponse.json({
      success: true,
      comment: {
        id: newComment.id,
        body: newComment.body,
        createdAt: newComment.createdAt.toISOString(),
        author: {
          id: profile.id,
          name: profile.displayName,
          username: profile.username,
          avatarUrl: profile.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/reels/[id]/comments error]:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
