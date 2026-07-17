import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { comments, userProfiles, posts, notifications } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, asc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const postComments = await db.query.comments.findMany({
      where: and(
        eq(comments.postId, id),
        eq(comments.status, "PUBLISHED")
      ),
      orderBy: [asc(comments.createdAt)],
      with: {
        author: true,
      },
    });

    return NextResponse.json(postComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { body, isAnonymous, parentId } = (await req.json()) as { body: string; isAnonymous?: boolean; parentId?: string };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const [newComment] = await db.insert(comments).values({
      postId: id,
      authorId: profile.id,
      parentId: parentId || null,
      body,
      isAnonymous: isAnonymous || false,
      status: "PUBLISHED",
    }).returning();

    // Trigger notification
    if (parentId) {
      // Notify parent comment author
      const parentComment = await db.query.comments.findFirst({
        where: eq(comments.id, parentId),
      });
      if (parentComment && parentComment.authorId !== profile.id) {
        await db.insert(notifications).values({
          userId: parentComment.authorId,
          type: "REPLY",
          actorId: profile.id,
          referenceId: id,
        });
      }
    } else {
      // Notify post author
      const targetPost = await db.query.posts.findFirst({
        where: eq(posts.id, id),
      });
      if (targetPost && targetPost.authorId !== profile.id) {
        await db.insert(notifications).values({
          userId: targetPost.authorId,
          type: "COMMENT",
          actorId: profile.id,
          referenceId: id,
        });
      }
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
