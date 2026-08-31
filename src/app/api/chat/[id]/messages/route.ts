import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { conversations, messages, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { notifyNewMessage } from "@/lib/chat-notifications";
import { recordHeartbeat } from "@/lib/presence-server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

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
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 35), 100);
    const before = searchParams.get("before"); // ISO date string or timestamp cursor

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    recordHeartbeat(profile.id).catch(() => {});

    // Auto-mark peer's messages as read (Seen status)
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(eq(messages.conversationId, id), ne(messages.senderId, profile.id), isNull(messages.readAt))
      );

    const conditions = [eq(messages.conversationId, id)];
    if (before) {
      const beforeDate = new Date(before);
      if (!isNaN(beforeDate.getTime())) {
        conditions.push(sql`${messages.createdAt} < ${beforeDate}`);
      }
    }

    // Query messages in descending order to fetch the newest slice first
    const rawSlice = await db.query.messages.findMany({
      where: and(...conditions),
      orderBy: [desc(messages.createdAt)],
      limit,
      with: {
        sender: true,
      },
    });

    // Reverse to return in chronological ascending order for normal chat display
    const chatMessages = rawSlice.reverse();

    return NextResponse.json(chatMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

    recordHeartbeat(profile.id).catch(() => {});

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const { body } = (await req.json()) as { body: string };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    // Insert message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: id,
        senderId: profile.id,
        body,
      })
      .returning();

    // Update conversation updatedAt to trigger re-sorting in conversation list
    await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, id));

    // Ping the other participants' devices. Fire-and-forget: the sender's
    // request must not wait on push delivery, and a push failure must not
    // fail a message that is already stored.
    notifyNewMessage({ conversationId: id, senderId: profile.id, body }).catch(() => {});

    // Return message populated with sender
    const populatedMessage = {
      ...newMessage,
      sender: profile,
    };

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
