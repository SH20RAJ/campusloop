import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { conversationParticipants, conversations, messages, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

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

    const conversationIds = userParticipations.map((p) => p.conversationId);

    if (conversationIds.length === 0) {
      return NextResponse.json([]);
    }

    const participationMap = new Map(userParticipations.map((p) => [p.conversationId, p]));

    // Query conversations with participants and recent messages
    const rawConversations = await db.query.conversations.findMany({
      where: inArray(conversations.id, conversationIds),
      with: {
        community: true,
        participants: {
          with: {
            user: true,
          },
        },
        messages: {
          orderBy: [desc(messages.createdAt)],
          limit: 15,
        },
      },
    });

    // Format the response payload with WhatsApp style unread counting and action flags
    const formatted = rawConversations
      .map((conv) => {
        const isCommunity = conv.type === "COMMUNITY";
        const otherUser = conv.participants.find((p) => p.userId !== profile.id)?.user;
        const comm = conv.community;

        const otherParticipant = isCommunity
          ? ({
              id: conv.communityId || conv.id,
              userId: conv.communityId || conv.id,
              displayName: conv.title || (comm ? `c/${comm.name}` : "Community Group"),
              username: comm?.slug || comm?.id || "community",
              avatarUrl: conv.avatarUrl || comm?.avatarUrl || null,
              bio: comm?.description || "Official Community Group Chat",
              points: comm?.points || 0,
              isCommunity: true,
              membersCount: conv.participants.length,
            } as unknown as typeof otherUser)
          : otherUser;

        const participation = participationMap.get(conv.id);

        if (!otherParticipant) return null;

        const lastClearedAt = participation?.lastClearedAt ? new Date(participation.lastClearedAt) : null;
        const validMessages = lastClearedAt
          ? conv.messages.filter((m) => new Date(m.createdAt) > lastClearedAt)
          : conv.messages;

        const lastMessage = validMessages[0] || null;

        const unreadCount = validMessages.filter((m) => m.senderId !== profile.id && !m.readAt).length;

        return {
          id: conv.id,
          type: conv.type,
          isCommunity,
          title: conv.title,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherParticipant,
          unreadCount,
          isArchived: Boolean(participation?.isArchived),
          isMuted: Boolean(participation?.isMuted),
          isPinned: Boolean(participation?.isPinned),
          lastClearedAt: participation?.lastClearedAt || null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                body: lastMessage.body,
                senderId: lastMessage.senderId,
                readAt: lastMessage.readAt,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Sort by pinned status first, then by last message date (or creation date)
    formatted.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
      }
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : new Date(a.createdAt).getTime();
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : new Date(b.createdAt).getTime();
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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

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

    const commonConv = myConvs.find((mc) =>
      targetConvs.some((tc) => tc.conversationId === mc.conversationId)
    );

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
    if (messageContent?.trim()) {
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
