import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { aiFeedback, aiMessages, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, rating, reason } = (await req.json()) as {
      messageId: string;
      rating: "helpful" | "unhelpful";
      reason?: string;
    };

    if (!messageId || !rating) {
      return NextResponse.json({ error: "messageId and rating are required" }, { status: 400 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Verify message exists
    const message = await db.query.aiMessages.findFirst({
      where: eq(aiMessages.id, messageId),
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const feedbackId = `aifb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(aiFeedback).values({
      id: feedbackId,
      userId: profile.id,
      messageId,
      rating,
      reason,
    });

    return NextResponse.json({ success: true, id: feedbackId });
  } catch (error) {
    console.error("AI Feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
