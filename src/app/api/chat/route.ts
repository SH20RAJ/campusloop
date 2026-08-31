import { and, desc, eq, inArray } from "drizzle-orm";
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
        const isGroup = conv.type !== "DIRECT" && !isCommunity;
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
              isGroup: true,
              membersCount: conv.participants.length,
            } as unknown as typeof otherUser)
          : isGroup
            ? ({
                id: conv.id,
                userId: conv.id,
                displayName: conv.title || "Campus Group",
                username: `grp_${conv.id.slice(0, 8)}`,
                avatarUrl: conv.avatarUrl || null,
                bio: `${conv.participants.length} campus members`,
                points: 0,
                isGroup: true,
                category: conv.type,
                membersCount: conv.participants.length,
                participants: conv.participants.map((p) => p.user).filter(Boolean),
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
          isGroup,
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
      participantIds?: string[];
      type?: string;
      title?: string;
      avatarUrl?: string;
      category?: string;
      content?: string;
      body?: string;
    };

    const messageContent = bodyData.content || bodyData.body;

    // ── Group Chat Creation Flow ──
    if (bodyData.type === "GROUP" || (bodyData.participantIds && bodyData.participantIds.length > 0)) {
      const title = bodyData.title?.trim() || "Campus Study Pod";
      const avatarUrl = bodyData.avatarUrl || null;
      const groupType = bodyData.category || bodyData.type || "GROUP";
      const participantIds = Array.isArray(bodyData.participantIds) ? bodyData.participantIds : [];

      const allParticipantIds = Array.from(new Set([profile.id, ...participantIds]));

      if (allParticipantIds.length < 2) {
        return NextResponse.json({ error: "A group must have at least 2 members" }, { status: 400 });
      }

      // Verify all participants exist
      const validUsers = await db.query.userProfiles.findMany({
        where: inArray(userProfiles.id, allParticipantIds),
      });

      if (validUsers.length < 2) {
        return NextResponse.json({ error: "Selected members could not be found" }, { status: 400 });
      }

      // Create group conversation
      const [newConv] = await db
        .insert(conversations)
        .values({
          type: groupType,
          title,
          avatarUrl,
        })
        .returning();

      // Add all participants
      await db.insert(conversationParticipants).values(
        validUsers.map((u) => ({
          conversationId: newConv.id,
          userId: u.id,
        }))
      );

      // Post initial welcoming system message
      const initialGreeting =
        messageContent?.trim() || `🎉 Welcome to "${title}"! Created by @${profile.username || "student"}.`;

      const [initMsg] = await db
        .insert(messages)
        .values({
          conversationId: newConv.id,
          senderId: profile.id,
          body: initialGreeting,
        })
        .returning();

      return NextResponse.json(
        {
          id: newConv.id,
          type: newConv.type,
          isCommunity: false,
          isGroup: true,
          title: newConv.title,
          createdAt: newConv.createdAt,
          updatedAt: newConv.updatedAt,
          unreadCount: 0,
          isArchived: false,
          isMuted: false,
          isPinned: false,
          lastClearedAt: null,
          otherParticipant: {
            id: newConv.id,
            userId: newConv.id,
            displayName: newConv.title || "Campus Group",
            username: `grp_${newConv.id.slice(0, 8)}`,
            avatarUrl: newConv.avatarUrl || null,
            bio: `${validUsers.length} campus members`,
            points: 0,
            isGroup: true,
            category: newConv.type,
            membersCount: validUsers.length,
            participants: validUsers,
          },
          lastMessage: {
            id: initMsg.id,
            body: initMsg.body,
            senderId: initMsg.senderId,
            readAt: null,
            createdAt: initMsg.createdAt,
          },
        },
        { status: 201 }
      );
    }

    // ── Direct 1-on-1 Chat Flow ──
    const targetUserId = bodyData.participantId || bodyData.recipientId;

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

    // Check if a direct conversation already exists between these two users
    const myConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, profile.id),
    });
    const targetConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, targetUserId),
    });

    const directConvs = await db.query.conversations.findMany({
      where: and(
        inArray(
          conversations.id,
          myConvs.map((m) => m.conversationId)
        ),
        eq(conversations.type, "DIRECT")
      ),
    });

    const directConvIds = new Set(directConvs.map((c) => c.id));
    const commonConv = myConvs.find(
      (mc) =>
        directConvIds.has(mc.conversationId) &&
        targetConvs.some((tc) => tc.conversationId === mc.conversationId)
    );

    let conversationId = commonConv?.conversationId;

    if (!conversationId) {
      // Create a new direct conversation session
      const [newConv] = await db
        .insert(conversations)
        .values({
          type: "DIRECT",
        })
        .returning();
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
