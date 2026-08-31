import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { randomMessages, randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { sanitizeRandomLoopMessage } from "@/lib/random-loop-safety";

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

    if (!session || session.status !== "ACTIVE") {
      return NextResponse.json({ error: "Session is not active" }, { status: 400 });
    }

    const body = (await req.json()) as { text?: string };
    const text = body.text || "";

    // Realtime Safety & PII check
    const safety = sanitizeRandomLoopMessage(text);
    if (!safety.allowed) {
      return NextResponse.json(
        {
          error: safety.warning || "Message could not be sent due to safety policies.",
          piiDetected: safety.piiDetected,
        },
        { status: 422 }
      );
    }

    const [newMsg] = await db
      .insert(randomMessages)
      .values({
        sessionId,
        senderId: profile.id,
        body: safety.sanitizedBody,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        body: newMsg.body,
        isMine: true,
        createdAt: newMsg.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in POST message to random session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
