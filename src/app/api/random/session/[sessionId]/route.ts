import { and, asc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { randomMessages, randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
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
      with: {
        userA: {
          columns: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            year: true,
            branch: true,
          },
          with: { institution: { columns: { id: true, name: true } } },
        },
        userB: {
          columns: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            year: true,
            branch: true,
          },
          with: { institution: { columns: { id: true, name: true } } },
        },
        messages: {
          orderBy: [asc(randomMessages.createdAt)],
          limit: 100,
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isUserA = session.userAId === profile.id;
    const partner = isUserA ? session.userB : session.userA;
    const isBothRevealed = session.userARevealed && session.userBRevealed;
    const myReveal = isUserA ? session.userARevealed : session.userBRevealed;
    const partnerReveal = isUserA ? session.userBRevealed : session.userARevealed;
    const myContinue = isUserA ? session.userAContinued : session.userBContinued;
    const partnerContinue = isUserA ? session.userBContinued : session.userAContinued;

    // Sanitize partner information based on reveal state
    const partnerInfo = {
      id: partner.id,
      collegeName: partner.institution?.name || "CampusLoop Partner",
      year: partner.year ? `${partner.year} Year` : undefined,
      branch: partner.branch || undefined,
      isRevealed: isBothRevealed,
      displayName: isBothRevealed ? partner.displayName : "Anonymous Student",
      username: isBothRevealed ? partner.username : undefined,
      avatarUrl: isBothRevealed ? partner.avatarUrl : null,
    };

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        mode: session.mode,
        matchedInterests: session.matchedInterests,
        myReveal,
        partnerReveal,
        isBothRevealed,
        myContinue,
        partnerContinue,
        conversationId: session.conversationId,
        endedReason: session.endedReason,
      },
      partner: partnerInfo,
      messages: session.messages.map((m) => ({
        id: m.id,
        body: m.body,
        isMine: m.senderId === profile.id,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/random/session/[sessionId]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
