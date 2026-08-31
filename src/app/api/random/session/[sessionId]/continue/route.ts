import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { conversationParticipants, conversations, messages, randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = await db.query.randomSessions.findFirst({
      where: and(
        eq(randomSessions.id, sessionId),
        or(eq(randomSessions.userAId, profile.id), eq(randomSessions.userBId, profile.id))
      ),
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isUserA = session.userAId === profile.id;
    const partnerId = isUserA ? session.userBId : session.userAId;

    const updatePayload: Record<string, any> = isUserA ? { userAContinued: true } : { userBContinued: true };

    const otherUserContinued = isUserA ? session.userBContinued : session.userAContinued;

    let linkedConversationId = session.conversationId;

    // If both agreed to keep talking, establish a persistent Direct Message conversation in Messaging!
    if (otherUserContinued && !linkedConversationId) {
      // Find or create direct conversation
      const [newConv] = await db
        .insert(conversations)
        .values({
          type: "DIRECT",
        })
        .returning();

      linkedConversationId = newConv.id;
      updatePayload.conversationId = linkedConversationId;
      updatePayload.status = "CONTINUED";

      // Add both participants
      await db.insert(conversationParticipants).values([
        { conversationId: newConv.id, userId: profile.id },
        { conversationId: newConv.id, userId: partnerId },
      ]);

      // System greeting message
      await db.insert(messages).values({
        conversationId: newConv.id,
        senderId: profile.id,
        body: "👋 Hey! We connected via Random Loop and chose to keep talking.",
      });
    }

    const [updated] = await db
      .update(randomSessions)
      .set(updatePayload)
      .where(eq(randomSessions.id, sessionId))
      .returning();

    const bothContinued = updated.userAContinued && updated.userBContinued;

    return NextResponse.json({
      success: true,
      myContinue: true,
      partnerContinue: isUserA ? updated.userBContinued : updated.userAContinued,
      bothContinued,
      conversationId: updated.conversationId,
    });
  } catch (error) {
    console.error("Error in POST continue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
