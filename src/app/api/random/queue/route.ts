import { and, desc, eq, ne, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { blocks, randomQueue, randomSessions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

// POST /api/random/queue — Join Queue and auto-match if compatible student exists
export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      with: { institution: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if user is already in an ACTIVE session
    const existingSession = await db.query.randomSessions.findFirst({
      where: and(
        eq(randomSessions.status, "ACTIVE"),
        or(eq(randomSessions.userAId, profile.id), eq(randomSessions.userBId, profile.id))
      ),
    });

    if (existingSession) {
      return NextResponse.json({
        status: "MATCHED",
        sessionId: existingSession.id,
      });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const mode = body.mode === "ANY_CAMPUS" ? "ANY_CAMPUS" : "MY_CAMPUS";
    const interests = Array.isArray(body.interests) ? body.interests.slice(0, 3) : [];
    const year = body.year || null;
    const department = body.department || null;

    // 1. Fetch user's blocked IDs to never pair with them
    const userBlocks = await db.query.blocks.findMany({
      where: or(eq(blocks.blockerId, profile.id), eq(blocks.blockedUserId, profile.id)),
    });
    const blockedUserIds = new Set<string>();
    userBlocks.forEach((b) => {
      blockedUserIds.add(b.blockerId);
      blockedUserIds.add(b.blockedUserId);
    });

    // 2. Fetch candidates currently waiting in randomQueue
    const queryConditions = [ne(randomQueue.userId, profile.id)];
    if (mode === "MY_CAMPUS") {
      queryConditions.push(eq(randomQueue.institutionId, profile.institutionId));
    }

    const candidates = await db.query.randomQueue.findMany({
      where: and(...queryConditions),
      orderBy: [desc(randomQueue.createdAt)],
      limit: 20,
    });

    // Filter out blocked users
    const validCandidates = candidates.filter((c) => !blockedUserIds.has(c.userId));

    if (validCandidates.length > 0) {
      // Pick best candidate: Prefer common interests, else first in line
      let matchedCandidate = validCandidates[0];
      let sharedInterests: string[] = [];

      for (const candidate of validCandidates) {
        const candidateInterests = Array.isArray(candidate.interests) ? candidate.interests : [];
        const overlap = interests.filter((item: string) => candidateInterests.includes(item));
        if (overlap.length > sharedInterests.length) {
          sharedInterests = overlap;
          matchedCandidate = candidate;
        }
      }

      if (sharedInterests.length === 0 && interests.length > 0) {
        sharedInterests = interests;
      }

      // Remove candidate and current user from queue
      await db.delete(randomQueue).where(eq(randomQueue.userId, matchedCandidate.userId));
      await db.delete(randomQueue).where(eq(randomQueue.userId, profile.id));

      // Create new active session
      const [newSession] = await db
        .insert(randomSessions)
        .values({
          userAId: matchedCandidate.userId,
          userBId: profile.id,
          mode,
          institutionId: mode === "MY_CAMPUS" ? profile.institutionId : null,
          matchedInterests: sharedInterests,
          status: "ACTIVE",
        })
        .returning();

      return NextResponse.json({
        status: "MATCHED",
        sessionId: newSession.id,
      });
    }

    // 3. No candidate available immediately -> Upsert in randomQueue
    await db
      .insert(randomQueue)
      .values({
        userId: profile.id,
        institutionId: profile.institutionId,
        mode,
        interests,
        year,
        department,
        lastHeartbeat: new Date(),
      })
      .onConflictDoUpdate({
        target: randomQueue.userId,
        set: {
          mode,
          interests,
          year,
          department,
          lastHeartbeat: new Date(),
        },
      });

    return NextResponse.json({
      status: "QUEUED",
      mode,
    });
  } catch (error) {
    console.error("Error in POST /api/random/queue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/random/queue — Poll queue status or active session
export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if matched into an active session
    const activeSession = await db.query.randomSessions.findFirst({
      where: and(
        eq(randomSessions.status, "ACTIVE"),
        or(eq(randomSessions.userAId, profile.id), eq(randomSessions.userBId, profile.id))
      ),
    });

    if (activeSession) {
      return NextResponse.json({
        status: "MATCHED",
        sessionId: activeSession.id,
      });
    }

    // Check if waiting in queue
    const queueEntry = await db.query.randomQueue.findFirst({
      where: eq(randomQueue.userId, profile.id),
    });

    if (queueEntry) {
      return NextResponse.json({
        status: "QUEUED",
        mode: queueEntry.mode,
        queuedAt: queueEntry.createdAt,
      });
    }

    return NextResponse.json({ status: "IDLE" });
  } catch (error) {
    console.error("Error in GET /api/random/queue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/random/queue — Leave Queue
export async function DELETE() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (profile) {
      await db.delete(randomQueue).where(eq(randomQueue.userId, profile.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/random/queue:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
