import { getDb } from "@/db";
import { posts, savedPosts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ saved: false });
    }

    const { id: postId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ saved: false });
    }

    const existing = await db.query.savedPosts.findFirst({
      where: and(eq(savedPosts.profileId, profile.id), eq(savedPosts.postId, postId)),
    });

    return NextResponse.json({ saved: Boolean(existing) });
  } catch (error) {
    console.error("GET /api/posts/[id]/save error:", error);
    return NextResponse.json({ saved: false });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verify post exists
    const postExists = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { id: true },
    });

    if (!postExists) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Insert into saved_posts
    await db
      .insert(savedPosts)
      .values({
        profileId: profile.id,
        postId,
      })
      .onConflictDoNothing({ target: [savedPosts.profileId, savedPosts.postId] });

    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error("POST /api/posts/[id]/save error:", error);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db
      .delete(savedPosts)
      .where(and(eq(savedPosts.profileId, profile.id), eq(savedPosts.postId, postId)));

    return NextResponse.json({ success: true, saved: false });
  } catch (error) {
    console.error("DELETE /api/posts/[id]/save error:", error);
    return NextResponse.json({ error: "Failed to remove saved post" }, { status: 500 });
  }
}
