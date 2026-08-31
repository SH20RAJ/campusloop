import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRedis } from "@/lib/redis";

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
    const body = (await req.json().catch(() => ({}))) as { peerId?: string };

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = await db.query.randomSessions.findFirst({
      where: and(
        eq(randomSessions.id, sessionId),
        eq(randomSessions.status, "ACTIVE"),
        or(eq(randomSessions.userAId, profile.id), eq(randomSessions.userBId, profile.id))
      ),
    });

    if (!session) {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const isUserA = session.userAId === profile.id;
    const updateData: Record<string, any> = isUserA
      ? { userAVideoRequested: true, ...(body.peerId ? { userAPeerId: body.peerId } : {}) }
      : { userBVideoRequested: true, ...(body.peerId ? { userBPeerId: body.peerId } : {}) };

    const [updated] = await db
      .update(randomSessions)
      .set(updateData)
      .where(eq(randomSessions.id, sessionId))
      .returning();

    const isBothVideoAccepted = updated.userAVideoRequested && updated.userBVideoRequested;

    // Upstash Redis fast state update
    const redis = getRedis();
    if (redis) {
      await redis.set(
        `random_session:${sessionId}:video`,
        JSON.stringify({
          isBothVideoAccepted,
          userAPeerId: updated.userAPeerId,
          userBPeerId: updated.userBPeerId,
        }),
        { ex: 120 }
      );
    }

    return NextResponse.json({
      success: true,
      myVideoRequested: true,
      isBothVideoAccepted,
      partnerPeerId: isUserA ? updated.userBPeerId : updated.userAPeerId,
    });
  } catch (error) {
    console.error("Error in POST /api/random/session/[sessionId]/video:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
