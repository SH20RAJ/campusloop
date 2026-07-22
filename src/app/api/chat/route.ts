import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { conversations, conversationParticipants, userProfiles, messages } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, desc, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
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

    // Find all conversation IDs where the current user is a participant
    const userParticipations = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, profile.id),
    });

    const conversationIds = userParticipations.map(p => p.conversationId);

    if (conversationIds.length === 0) {
      return NextResponse.json([]);
    }

    // Query those conversations including their participants and messages
    const rawConversations = await db.query.conversations.findMany({
      where: inArray(conversations.id, conversationIds),
      with: {
        participants: {
          with: {
            user: true,
          }
        },
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 1,
        }
      }
    });

    // Format the response payload
    const formatted = rawConversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== profile.id)?.user;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherParticipant,
        lastMessage,
      };
    });

    // Sort by last message date (or creation date)
    formatted.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const bodyData = (await req.json()) as {
      participantId?: string;
      recipientId?: string;
      content?: string;
      body?: string;
    };
    const targetUserId = bodyData.participantId || bodyData.recipientId;
    const messageContent = bodyData.content || bodyData.body;

    if (!targetUserId) {
      return NextResponse.json({ error: "participantId or recipientId is required" }, { status: 400 });
    }

    // Check if participant exists
    const targetUser = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, targetUserId),
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if a conversation already exists between these two users
    const myConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, profile.id),
    });
    const targetConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, targetUserId),
    });

    const commonConv = myConvs.find(mc => targetConvs.some(tc => tc.conversationId === mc.conversationId));

    let conversationId = commonConv?.conversationId;

    if (!conversationId) {
      // Create a new conversation session
      const [newConv] = await db.insert(conversations).values({}).returning();
      conversationId = newConv.id;

      // Add participants
      await db.insert(conversationParticipants).values([
        { conversationId, userId: profile.id },
        { conversationId, userId: targetUserId },
      ]);
    }

    // If message content was passed (e.g. story reply), insert message directly
    if (messageContent && messageContent.trim()) {
      await db.insert(messages).values({
        conversationId,
        senderId: profile.id,
        body: messageContent.trim(),
      });

      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    return NextResponse.json({ id: conversationId }, { status: 200 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
