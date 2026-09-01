import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { anonIdentityVault, posts, userProfiles, votes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { openSealedIdentity } from "@/lib/anonymity";
import { createNotification } from "@/lib/notifications";
import { rejectViewerWrite } from "@/lib/viewer";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function sendLikeNotification(postId: string, actorProfileId: string) {
  try {
    const db = getDb();
    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!targetPost) return;

    let targetAuthorId = targetPost.authorId;

    // If anonymous, resolve the recipient's real profile ID from identity vault
    if (!targetAuthorId && targetPost.isAnonymous && targetPost.pseudonym) {
      try {
        const vault = await db.query.anonIdentityVault.findFirst({
          where: eq(anonIdentityVault.handle, targetPost.pseudonym),
        });
        if (vault?.sealedIdentity) {
          targetAuthorId = openSealedIdentity(vault.sealedIdentity);
        }
      } catch (err) {
        console.warn("Could not unseal anonymous author for like notification:", err);
      }
    }

    if (targetAuthorId && targetAuthorId !== actorProfileId) {
      await createNotification({
        userId: targetAuthorId,
        type: "LIKE",
        actorId: actorProfileId,
        referenceId: postId,
        previewText: targetPost.body || targetPost.title || "Liked your post",
      });
    }
  } catch (error) {
    console.warn("Failed to dispatch like notification:", error);
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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const { value } = (await req.json()) as { value: number };

    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    // Check if vote already exists
    const existingVote = await db.query.votes.findFirst({
      where: and(eq(votes.postId, id), eq(votes.userId, profile.id)),
    });

    if (existingVote) {
      if (value === 0) {
        // Explicitly remove vote
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        return NextResponse.json({ message: "Vote removed", userVote: 0 });
      } else if (existingVote.value !== value) {
        // Update vote value
        await db.update(votes).set({ value }).where(eq(votes.id, existingVote.id));

        // Trigger notification if updated to an upvote
        if (value === 1) {
          sendLikeNotification(id, profile.id).catch(() => {});
        }

        return NextResponse.json({ message: "Vote updated", userVote: value });
      } else {
        // Vote already set to desired value
        return NextResponse.json({ message: "Vote confirmed", userVote: value });
      }
    } else {
      if (value !== 0) {
        // Insert new vote
        await db.insert(votes).values({
          postId: id,
          userId: profile.id,
          value,
        });

        // Trigger notification if it's an upvote
        if (value === 1) {
          sendLikeNotification(id, profile.id).catch(() => {});
        }

        return NextResponse.json({ message: "Vote cast", userVote: value });
      }
    }

    return NextResponse.json({ userVote: 0 });
  } catch (error) {
    console.error("Error casting vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
