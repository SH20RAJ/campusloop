import { getDb } from "@/db";
import { conversationParticipants, messages, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; msgId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const conversationId = resolved.id;
    const messageId = resolved.msgId;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Verify user is a participant
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, profile.id)
      ),
    });

    if (!participation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const message = await db.query.messages.findFirst({
      where: and(
        eq(messages.id, messageId),
        eq(messages.conversationId, conversationId)
      ),
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const deleteFor = searchParams.get("deleteFor") || "everyone";

    if (deleteFor === "everyone") {
      // Only sender can delete for everyone
      if (message.senderId !== profile.id) {
        return NextResponse.json(
          { error: "You can only delete your own messages for everyone" },
          { status: 403 }
        );
      }

      await db
        .update(messages)
        .set({
          body: "🚫 This message was deleted",
          reactions: [],
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));
    } else {
      // Delete for self
      await db
        .update(messages)
        .set({
          body: "🚫 You deleted this message",
          reactions: [],
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));
    }

    return NextResponse.json({ success: true, messageId });
  } catch (error) {
    console.error("DELETE /api/chat/[id]/messages/[msgId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
