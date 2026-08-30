import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  conversationParticipants,
  conversations,
  messages,
  notifications,
  swipes,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const body = (await req.json()) as {
      targetId?: string;
      targetUserId?: string;
      direction?: "LIKE" | "PASS";
      action?: "like" | "pass";
    };

    const targetId = body.targetId || body.targetUserId;
    const rawDir = body.direction || (body.action ? body.action.toUpperCase() : undefined);
    const direction = rawDir === "LIKE" ? "LIKE" : "PASS";

    if (!targetId) {
      return NextResponse.json({ error: "Missing targetId parameter" }, { status: 400 });
    }

    // Upsert so changing your mind (e.g. like-back after an old pass) works
    await db
      .insert(swipes)
      .values({
        swiperId: profile.id,
        targetId,
        direction,
      })
      .onConflictDoUpdate({
        target: [swipes.swiperId, swipes.targetId],
        set: { direction },
      });

    // Check if it's a mutual LIKE
    if (direction === "LIKE") {
      const mutual = await db.query.swipes.findFirst({
        where: and(
          eq(swipes.swiperId, targetId),
          eq(swipes.targetId, profile.id),
          eq(swipes.direction, "LIKE")
        ),
      });

      if (mutual) {
        // Create conversation
        const [newConv] = await db.insert(conversations).values({}).returning();

        await db.insert(conversationParticipants).values([
          { conversationId: newConv.id, userId: profile.id },
          { conversationId: newConv.id, userId: targetId },
        ]);

        // Insert notifications
        await db.insert(notifications).values([
          {
            userId: profile.id,
            type: "MATCH",
            actorId: targetId,
            referenceId: newConv.id,
            previewText: "You matched with each other on Campus Match! 🎉 Say hello in chat.",
          },
          {
            userId: targetId,
            type: "MATCH",
            actorId: profile.id,
            referenceId: newConv.id,
            previewText: "You matched with each other on Campus Match! 🎉 Say hello in chat.",
          },
        ]);

        // Send match greeting
        await db.insert(messages).values({
          conversationId: newConv.id,
          senderId: profile.id,
          body: "🎉 Match made! You both swiped right on each other. Say hello!",
        });

        // Retrieve matched user's display details to return to client
        const matchedUser = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, targetId),
        });

        return NextResponse.json({
          matched: true,
          conversationId: newConv.id,
          matchedUser: matchedUser
            ? {
                displayName: matchedUser.displayName,
                avatarUrl: matchedUser.avatarUrl,
              }
            : null,
        });
      }
    }

    return NextResponse.json({ matched: false });
  } catch (error) {
    console.error("Error logging dating swipe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Undo / reset swipes.
 * With `?targetId=`: removes just that one swipe (the Rewind button).
 * Without: clears every swipe so the deck starts fresh.
 */
export async function DELETE(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");

    if (targetId) {
      await db.delete(swipes).where(and(eq(swipes.swiperId, profile.id), eq(swipes.targetId, targetId)));
      return NextResponse.json({ success: true, message: "Swipe undone" });
    }

    await db.delete(swipes).where(eq(swipes.swiperId, profile.id));

    return NextResponse.json({ success: true, message: "Swipes reset successfully" });
  } catch (error) {
    console.error("Error resetting swipes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
