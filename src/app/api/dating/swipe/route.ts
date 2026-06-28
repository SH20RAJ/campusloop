import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { 
  swipes, 
  userProfiles, 
  conversations, 
  conversationParticipants, 
  messages,
  notifications
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and } from "drizzle-orm";

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

    const { targetId, direction } = (await req.json()) as { 
      targetId: string; 
      direction: "LIKE" | "PASS"; 
    };

    if (!targetId || !direction) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Insert swipe choice
    await db.insert(swipes).values({
      swiperId: profile.id,
      targetId,
      direction,
    });

    // Check if it's a mutual LIKE
    if (direction === "LIKE") {
      const mutual = await db.query.swipes.findFirst({
        where: and(
          eq(swipes.swiperId, targetId),
          eq(swipes.targetId, profile.id),
          eq(swipes.direction, "LIKE")
        )
      });

      if (mutual) {
        // Create conversation
        const [newConv] = await db.insert(conversations).values({}).returning();
        
        await db.insert(conversationParticipants).values([
          { conversationId: newConv.id, userId: profile.id },
          { conversationId: newConv.id, userId: targetId }
        ]);

        // Insert notifications
        await db.insert(notifications).values([
          { userId: profile.id, type: "MATCH", actorId: targetId, referenceId: newConv.id },
          { userId: targetId, type: "MATCH", actorId: profile.id, referenceId: newConv.id }
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
          matchedUser
        });
      }
    }

    return NextResponse.json({ matched: false });
  } catch (error) {
    console.error("Error logging dating swipe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
