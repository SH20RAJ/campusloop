import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
        institution: true,
        community: true,
        votes: true,
        comments: {
          with: { author: true },
        },
        pollOptions: {
          with: { votes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!targetPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAuthor = targetPost.authorId === profile.id;
    const isAdmin = profile.role === "ADMIN" || profile.role === "MODERATOR";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You can only delete your own posts." }, { status: 403 });
    }

    // Mark as DELETED to maintain referential integrity with reposts/comments or delete cleanly
    await db.update(posts).set({ status: "DELETED" }).where(eq(posts.id, id));

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
