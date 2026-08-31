import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { blocks, randomReports, randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

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

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const action = body.action; // "NEXT", "LEAVE", "REPORT", "BLOCK", "RATE"
    const isUserA = session.userAId === profile.id;
    const partnerId = isUserA ? session.userBId : session.userAId;

    if (action === "NEXT" || action === "LEAVE") {
      // Mark session as ended
      await db
        .update(randomSessions)
        .set({
          status: "ENDED",
          endedReason: action,
          endedAt: new Date(),
        })
        .where(eq(randomSessions.id, sessionId));

      return NextResponse.json({ success: true, action });
    }

    if (action === "REPORT") {
      const reason = body.reason || "OTHER";
      const details = body.details || null;

      await db.insert(randomReports).values({
        sessionId,
        reporterId: profile.id,
        reportedUserId: partnerId,
        reason,
        details,
      });

      await db
        .update(randomSessions)
        .set({
          status: "REPORTED",
          endedReason: "REPORT",
          endedAt: new Date(),
        })
        .where(eq(randomSessions.id, sessionId));

      return NextResponse.json({ success: true, reported: true });
    }

    if (action === "BLOCK") {
      await db
        .insert(blocks)
        .values({
          blockerId: profile.id,
          blockedUserId: partnerId,
        })
        .onConflictDoNothing();

      await db
        .update(randomSessions)
        .set({
          status: "ENDED",
          endedReason: "BLOCK",
          endedAt: new Date(),
        })
        .where(eq(randomSessions.id, sessionId));

      return NextResponse.json({ success: true, blocked: true });
    }

    if (action === "RATE") {
      const rating = body.rating; // "FUN", "INTERESTING", "HELPFUL", "OKAY", "UNCOMFORTABLE"
      const updateData = isUserA ? { ratingA: rating } : { ratingB: rating };

      await db.update(randomSessions).set(updateData).where(eq(randomSessions.id, sessionId));

      return NextResponse.json({ success: true, rated: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST action to random session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
