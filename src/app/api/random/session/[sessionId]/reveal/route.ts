import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { randomSessions, userProfiles } from "@/db/schema";
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

    if (!session || session.status !== "ACTIVE") {
      return NextResponse.json({ error: "Session is not active" }, { status: 400 });
    }

    const isUserA = session.userAId === profile.id;
    const updatePayload = isUserA ? { userARevealed: true } : { userBRevealed: true };

    const [updated] = await db
      .update(randomSessions)
      .set(updatePayload)
      .where(eq(randomSessions.id, sessionId))
      .returning();

    const isBothRevealed = updated.userARevealed && updated.userBRevealed;

    return NextResponse.json({
      success: true,
      myReveal: true,
      partnerReveal: isUserA ? updated.userBRevealed : updated.userARevealed,
      isBothRevealed,
    });
  } catch (error) {
    console.error("Error in POST /api/random/session/[sessionId]/reveal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
