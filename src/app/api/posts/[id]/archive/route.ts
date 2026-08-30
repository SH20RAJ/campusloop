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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, id),
    });

    if (!targetPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isAuthor = targetPost.authorId === profile.id;
    const isAdmin = profile.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You can only archive your own posts." }, { status: 403 });
    }

    const isCurrentlyArchived = targetPost.status === "ARCHIVED";
    const newStatus = isCurrentlyArchived ? "PUBLISHED" : "ARCHIVED";

    await db.update(posts).set({ status: newStatus }).where(eq(posts.id, id));

    return NextResponse.json({
      success: true,
      isArchived: newStatus === "ARCHIVED",
      status: newStatus,
      message:
        newStatus === "ARCHIVED"
          ? "Post archived to your private archive."
          : "Post restored and published to feeds.",
    });
  } catch (error) {
    console.error("Error toggling post archive:", error);
    return NextResponse.json({ error: "Failed to update archive status" }, { status: 500 });
  }
}
