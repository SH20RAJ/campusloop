import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { conversationParticipants, conversations, messages, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const conversationId = resolved.id;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Verify participation
    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, profile.id)
      ),
    });

    if (!participation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conv = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        community: true,
        participants: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isCommunity = conv.type === "COMMUNITY";
    const isGroup = conv.type !== "DIRECT" && !isCommunity;
    const otherUser = conv.participants.find((p) => p.userId !== profile.id)?.user;
    const comm = conv.community;

    const otherParticipant = isCommunity
      ? {
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
        }
      : isGroup
        ? {
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
          }
        : otherUser;

    return NextResponse.json({
      id: conv.id,
      type: conv.type,
      title: conv.title,
      isGroup,
      isCommunity,
      otherParticipant,
      isArchived: Boolean(participation.isArchived),
      isMuted: Boolean(participation.isMuted),
      isPinned: Boolean(participation.isPinned),
    });
  } catch (error) {
    console.error("GET /api/chat/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const conversationId = resolved.id;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const body = (await req.json()) as { action?: string };
    const action = body.action;

    const participation = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, profile.id)
      ),
    });

    if (!participation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    switch (action) {
      case "archive":
        await db
          .update(conversationParticipants)
          .set({ isArchived: true })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "unarchive":
        await db
          .update(conversationParticipants)
          .set({ isArchived: false })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "mute":
        await db
          .update(conversationParticipants)
          .set({ isMuted: true })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "unmute":
        await db
          .update(conversationParticipants)
          .set({ isMuted: false })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "pin":
        await db
          .update(conversationParticipants)
          .set({ isPinned: true })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "unpin":
        await db
          .update(conversationParticipants)
          .set({ isPinned: false })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "clear":
        await db
          .update(conversationParticipants)
          .set({ lastClearedAt: new Date() })
          .where(eq(conversationParticipants.id, participation.id));
        break;

      case "mark_read":
        await db
          .update(messages)
          .set({ readAt: new Date() })
          .where(
            and(
              eq(messages.conversationId, conversationId)
              // sender is NOT the current user
            )
          );
        break;

      case "mark_unread": {
        // Reset readAt for the last received message
        const lastReceived = await db.query.messages.findFirst({
          where: eq(messages.conversationId, conversationId),
          orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        });
        if (lastReceived && lastReceived.senderId !== profile.id) {
          await db.update(messages).set({ readAt: null }).where(eq(messages.id, lastReceived.id));
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("PATCH /api/chat/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const conversationId = resolved.id;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Delete user's participation record
    await db
      .delete(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, profile.id)
        )
      );

    // Check if any participants remain
    const remaining = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.conversationId, conversationId),
    });

    // If no participants remain, delete the conversation and messages completely
    if (remaining.length === 0) {
      await db.delete(conversations).where(eq(conversations.id, conversationId));
    }

    return NextResponse.json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("DELETE /api/chat/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
