import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { callSessions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ callId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { callId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, user.id),
      columns: { id: true },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const call = await db.query.callSessions.findFirst({
      where: and(
        eq(callSessions.id, callId),
        or(eq(callSessions.callerId, profile.id), eq(callSessions.receiverId, profile.id))
      ),
      with: {
        caller: { columns: { id: true, displayName: true, avatarUrl: true, username: true } },
        receiver: { columns: { id: true, displayName: true, avatarUrl: true, username: true } },
      },
    });

    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

    return NextResponse.json({ call });
  } catch (error) {
    console.error("GET /api/calls/[callId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/calls/[callId] — Accept, Decline, or End a Call
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { callId } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, user.id),
      columns: { id: true },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const call = await db.query.callSessions.findFirst({
      where: and(
        eq(callSessions.id, callId),
        or(eq(callSessions.callerId, profile.id), eq(callSessions.receiverId, profile.id))
      ),
    });

    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

    const body = (await req.json().catch(() => ({}))) as {
      action: "ACCEPT" | "DECLINE" | "END" | "UPDATE_PEER";
      receiverPeerId?: string;
      reason?: string;
    };

    const redis = getRedis();

    if (body.action === "ACCEPT") {
      const updateData: Record<string, any> = {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      };
      if (body.receiverPeerId) {
        updateData.receiverPeerId = body.receiverPeerId;
      }

      const [updated] = await db
        .update(callSessions)
        .set(updateData)
        .where(eq(callSessions.id, callId))
        .returning();

      if (redis) {
        // Broadcast accepted state and receiverPeerId to caller
        await redis.set(
          `call:${callId}:accepted`,
          JSON.stringify({ status: "ACCEPTED", receiverPeerId: body.receiverPeerId }),
          { ex: 120 }
        );
        // Clear incoming call notification for receiver
        await redis.del(`user:${call.receiverId}:incoming_call`);
      }

      return NextResponse.json({ success: true, call: updated });
    }

    if (body.action === "DECLINE" || body.action === "END") {
      const endedStatus = body.action === "DECLINE" ? "DECLINED" : "ENDED";
      const [updated] = await db
        .update(callSessions)
        .set({
          status: endedStatus,
          endedReason: body.reason || endedStatus,
          endedAt: new Date(),
        })
        .where(eq(callSessions.id, callId))
        .returning();

      if (redis) {
        await redis.set(`call:${callId}:ended`, JSON.stringify({ status: endedStatus }), { ex: 60 });
        await redis.del(`user:${call.receiverId}:incoming_call`);
      }

      return NextResponse.json({ success: true, call: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/calls/[callId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
