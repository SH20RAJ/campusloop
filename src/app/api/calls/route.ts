import { and, desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { blocks, callSessions, conversationParticipants } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRedis } from "@/lib/redis";
import { trackUserBehavior } from "@/lib/user-behavior";

export const dynamic = "force-dynamic";

// POST /api/calls — Create or initiate a call session
export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      receiverId?: string;
      conversationId?: string;
      type?: "audio" | "video";
      context?: "chat" | "random_loop";
      callerPeerId?: string;
    };

    const { receiverId, conversationId, type = "video", context = "chat", callerPeerId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, user.id),
      columns: { id: true, displayName: true, avatarUrl: true, username: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 1. Verify block relationship
    const isBlocked = await db.query.blocks.findFirst({
      where: or(
        and(eq(blocks.blockerId, profile.id), eq(blocks.blockedUserId, receiverId)),
        and(eq(blocks.blockerId, receiverId), eq(blocks.blockedUserId, profile.id))
      ),
    });

    if (isBlocked) {
      return NextResponse.json({ error: "Cannot connect call due to block restrictions." }, { status: 403 });
    }

    // 2. If in chat context, verify conversation membership
    if (context === "chat" && conversationId) {
      const isParticipant = await db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, profile.id)
        ),
      });

      if (!isParticipant) {
        return NextResponse.json(
          { error: "You are not a participant in this conversation." },
          { status: 403 }
        );
      }
    }

    // 3. Create call session in DB
    const [newCall] = await db
      .insert(callSessions)
      .values({
        callerId: profile.id,
        receiverId,
        conversationId: conversationId || null,
        type,
        context,
        status: "CALLING",
        callerPeerId: callerPeerId || null,
      })
      .returning();

    // 4. Publish real-time signaling event to Upstash Redis
    const redis = getRedis();
    if (redis) {
      const signalPayload = {
        callId: newCall.id,
        caller: {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          username: profile.username,
        },
        type,
        context,
        conversationId,
        callerPeerId,
        status: "CALLING",
        createdAt: new Date().toISOString(),
      };

      // Set active call key for receiver (expires in 45 seconds if unaccepted)
      await redis.set(`user:${receiverId}:incoming_call`, JSON.stringify(signalPayload), { ex: 45 });
    }

    // Track user calling event for behavior recommendations
    await trackUserBehavior({
      userId: profile.id,
      eventType: "CHAT_CALL",
      targetType: "USER",
      targetId: receiverId,
      metadata: { type, context },
      weight: 5,
    });

    return NextResponse.json({
      success: true,
      call: newCall,
    });
  } catch (error) {
    console.error("POST /api/calls error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/calls — Poll incoming calls or active call state
export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fast check via Upstash Redis
    const redis = getRedis();
    if (redis) {
      const incomingRaw = await redis.get(`user:${profile.id}:incoming_call`);
      if (incomingRaw) {
        const parsed = typeof incomingRaw === "string" ? JSON.parse(incomingRaw) : incomingRaw;
        return NextResponse.json({ incomingCall: parsed });
      }
    }

    // Database fallback: find any recent calling session
    let activeCall: any = null;
    try {
      activeCall = await db.query.callSessions.findFirst({
        where: and(eq(callSessions.receiverId, profile.id), eq(callSessions.status, "CALLING")),
        with: {
          caller: {
            columns: { id: true, displayName: true, avatarUrl: true, username: true },
          },
        },
        orderBy: [desc(callSessions.createdAt)],
      });
    } catch (dbErr) {
      console.warn("DB call fallback lookup error:", dbErr);
    }

    return NextResponse.json({
      incomingCall: activeCall
        ? {
            callId: activeCall.id,
            caller: activeCall.caller,
            type: activeCall.type,
            context: activeCall.context,
            conversationId: activeCall.conversationId,
            callerPeerId: activeCall.callerPeerId,
            status: activeCall.status,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/calls error:", error);
    return NextResponse.json({ incomingCall: null });
  }
}
