import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { MAX_POST_CHARS } from "@/constants/feed";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { deriveAnonHandle } from "@/lib/anonymity";
import { runSafetyCheck } from "@/lib/moderation/rules";
import { indexPostVector } from "@/lib/qdrant/indexer";
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

export async function PATCH(req: Request, { params }: RouteParams) {
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

    if (targetPost.status === "DELETED") {
      return NextResponse.json({ error: "Cannot edit a deleted post" }, { status: 400 });
    }

    const userAnonHandle = profile.anonymousUsername || deriveAnonHandle(profile.id);
    const isAuthor = Boolean(targetPost.authorId && targetPost.authorId === profile.id);
    const isAnonAuthor = Boolean(targetPost.isAnonymous && targetPost.pseudonym === userAnonHandle);
    const isAdmin = profile.role === "ADMIN" || profile.role === "MODERATOR";

    if (!isAuthor && !isAnonAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You can only edit your own posts." }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const { body, title, scope } = payload as {
      body?: string;
      title?: string | null;
      scope?: "CAMPUS" | "GLOBAL";
    };

    if (typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json({ error: "Post body cannot be empty" }, { status: 400 });
    }

    if (body.length > MAX_POST_CHARS) {
      return NextResponse.json(
        { error: `Post body cannot exceed ${MAX_POST_CHARS} characters` },
        { status: 400 }
      );
    }

    const trimmedBody = body.trim();
    const trimmedTitle = typeof title === "string" ? (title.trim() ? title.trim() : null) : targetPost.title;

    // Run content safety & moderation check
    const safety = runSafetyCheck({ title: trimmedTitle || undefined, body: trimmedBody });
    if (safety.blocked) {
      return NextResponse.json(
        { error: safety.messages.join(" "), messages: safety.messages, riskScore: safety.riskScore },
        { status: 400 }
      );
    }

    const [updatedPost] = await db
      .update(posts)
      .set({
        body: trimmedBody,
        title: trimmedTitle,
        scope: scope || targetPost.scope,
        isEdited: true,
        updatedAt: new Date(),
        status: safety.status,
        riskScore: safety.riskScore,
      })
      .where(eq(posts.id, id))
      .returning();

    // Fire-and-forget vector re-indexing into Qdrant
    indexPostVector({
      id: updatedPost.id,
      title: updatedPost.title,
      body: updatedPost.body,
      type: updatedPost.type,
      scope: updatedPost.scope,
      isAnonymous: updatedPost.isAnonymous,
      institutionId: updatedPost.institutionId,
      authorId: updatedPost.authorId,
    }).catch((err) => console.warn("Vector update error:", err));

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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

    const userAnonHandle = profile.anonymousUsername || deriveAnonHandle(profile.id);
    const isAuthor = Boolean(targetPost.authorId && targetPost.authorId === profile.id);
    const isAnonAuthor = Boolean(targetPost.isAnonymous && targetPost.pseudonym === userAnonHandle);
    const isAdmin = profile.role === "ADMIN" || profile.role === "MODERATOR";

    if (!isAuthor && !isAnonAuthor && !isAdmin) {
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
