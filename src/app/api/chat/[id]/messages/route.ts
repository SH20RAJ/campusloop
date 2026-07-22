import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { messages, userProfiles, conversations } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, asc } from "drizzle-orm";

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
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, id),
      orderBy: [asc(messages.createdAt)],
      with: {
        sender: true,
      }
    });

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

    const { body } = (await req.json()) as { body: string };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    // Insert message
    const [newMessage] = await db.insert(messages).values({
      conversationId: id,
      senderId: profile.id,
      body,
    }).returning();

    // Update conversation updatedAt to trigger re-sorting in conversation list
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));

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
