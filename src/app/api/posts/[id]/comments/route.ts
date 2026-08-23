import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { anonIdentityVault, comments, userProfiles, posts, notifications } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { runSafetyCheck } from "@/lib/moderation/rules";
import { deriveAnonHandle, sealIdentity } from "@/lib/anonymity";
import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "node:crypto";

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

    // Strip author identity for anonymous comments before it leaves the server.
    const sanitized = postComments.map((comment) => {
      if (!comment.isAnonymous) return comment;
      const rest = { ...comment } as Partial<Record<"author", unknown>>;
      delete rest.author;
      return { ...rest, author: null };
    });

    return NextResponse.json(sanitized);
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

    const { body, isAnonymous, parentId } = (await req.json()) as {
      body: string;
      isAnonymous?: boolean;
      parentId?: string;
    };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const safety = runSafetyCheck({ body });
    if (safety.blocked) {
      return NextResponse.json(
        { error: safety.messages.join(" "), messages: safety.messages, riskScore: safety.riskScore },
        { status: 400 },
      );
    }

    const anonymous = Boolean(isAnonymous);
    const commentId = randomUUID();
    let anonHandle: string | null = null;

    if (anonymous) {
      try {
        anonHandle = deriveAnonHandle(profile.id);
      } catch (err) {
        console.warn("Anonymity hashing fallback:", err);
        anonHandle = `anon_${profile.id.slice(0, 8)}`;
      }
    }

    // Direct sequential insert (no nested db.transaction which breaks in Neon HTTP driver)
    const [newComment] = await db
      .insert(comments)
      .values({
        id: commentId,
        postId: id,
        authorId: anonymous ? null : profile.id,
        pseudonym: anonHandle,
        parentId: parentId || null,
        body: body.trim(),
        isAnonymous: anonymous,
        status: safety.status,
      })
      .returning();

    if (anonymous && anonHandle) {
      try {
        await db
          .insert(anonIdentityVault)
          .values({
            handle: anonHandle,
            sealedIdentity: sealIdentity(profile.id),
          })
          .onConflictDoNothing({ target: anonIdentityVault.handle });
      } catch (err) {
        console.warn("Anon vault insert warning:", err);
      }
    }

    // Award +2 Loop Points safely
    try {
      await db
        .update(userProfiles)
        .set({ points: (profile.points || 0) + 2 })
        .where(eq(userProfiles.id, profile.id));
    } catch (err) {
      console.warn("Points update warning:", err);
    }

    // Trigger in-app notification safely without blocking the comment response
    try {
      if (parentId) {
        const parentComment = await db.query.comments.findFirst({
          where: eq(comments.id, parentId),
        });
        if (parentComment && parentComment.authorId && parentComment.authorId !== profile.id) {
          await db.insert(notifications).values({
            userId: parentComment.authorId,
            type: "REPLY",
            actorId: profile.id,
            referenceId: id,
          });
        }
      } else {
        const targetPost = await db.query.posts.findFirst({
          where: eq(posts.id, id),
        });
        if (targetPost && targetPost.authorId && targetPost.authorId !== profile.id) {
          await db.insert(notifications).values({
            userId: targetPost.authorId,
            type: "COMMENT",
            actorId: profile.id,
            referenceId: id,
          });
        }
      }
    } catch (notifErr) {
      console.warn("Notification insert warning:", notifErr);
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create comment" }, { status: 500 });
  }
}
