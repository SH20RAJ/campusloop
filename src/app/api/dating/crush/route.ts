import { and, count, eq, gte } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  conversationParticipants,
  conversations,
  messages,
  notifications,
  secretCrushAttempts,
  secretCrushes,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

const MAX_ACTIVE_SLOTS = 5;
const MAX_ATTEMPTS_7_DAYS = 5;
const COOLDOWN_DAYS = 7;

// GET /api/dating/crush — Fetch user's active secret crushes and count of received crushes
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

    // 1. Get sent active secret crushes with target profile
    const sentCrushes = await db.query.secretCrushes.findMany({
      where: eq(secretCrushes.senderId, profile.id),
      with: {
        target: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            branch: true,
            year: true,
          },
        },
      },
      orderBy: (sc, { desc }) => [desc(sc.createdAt)],
    });

    // 2. Count attempts in rolling 7 days
    const sevenDaysAgo = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const [attemptsCountRow] = await db
      .select({ count: count() })
      .from(secretCrushAttempts)
      .where(
        and(eq(secretCrushAttempts.senderId, profile.id), gte(secretCrushAttempts.createdAt, sevenDaysAgo))
      );

    const attemptsUsed = Number(attemptsCountRow?.count || 0);

    // 3. Get count of anonymous incoming secret crushes (Intent hidden!)
    const [receivedCountRow] = await db
      .select({ count: count() })
      .from(secretCrushes)
      .where(and(eq(secretCrushes.targetId, profile.id), eq(secretCrushes.isMutual, false)));

    const receivedCrushesCount = Number(receivedCountRow?.count || 0);

    return NextResponse.json({
      crushes: sentCrushes.map((c) => ({
        id: c.id,
        targetId: c.targetId,
        target: c.target,
        isMutual: c.isMutual,
        matchedAt: c.matchedAt,
        createdAt: c.createdAt,
      })),
      usedSlots: sentCrushes.length,
      maxSlots: MAX_ACTIVE_SLOTS,
      remainingSlots: Math.max(0, MAX_ACTIVE_SLOTS - sentCrushes.length),
      attemptsUsedIn7Days: attemptsUsed,
      maxAttemptsIn7Days: MAX_ATTEMPTS_7_DAYS,
      remainingAttemptsIn7Days: Math.max(0, MAX_ATTEMPTS_7_DAYS - attemptsUsed),
      receivedCrushesCount,
    });
  } catch (error) {
    console.error("GET /api/dating/crush error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/dating/crush — Send a Secret Crush
export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as { targetId?: string };
    const { targetId } = body;

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json({ error: "targetId is required" }, { status: 400 });
    }

    if (targetId === profile.id) {
      return NextResponse.json({ error: "You cannot crush on yourself" }, { status: 400 });
    }

    const targetProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, targetId),
    });

    if (!targetProfile) {
      return NextResponse.json({ error: "Target student not found" }, { status: 404 });
    }

    // 1. Check active slots limit (max 5)
    const [activeCountRow] = await db
      .select({ count: count() })
      .from(secretCrushes)
      .where(eq(secretCrushes.senderId, profile.id));

    const activeCount = Number(activeCountRow?.count || 0);
    if (activeCount >= MAX_ACTIVE_SLOTS) {
      return NextResponse.json(
        {
          error: `You have filled all ${MAX_ACTIVE_SLOTS} active Secret Crush slots. Remove one to free up an active slot.`,
        },
        { status: 400 }
      );
    }

    // 2. Check rolling 7-day attempts limit (max 5 new attempts)
    const sevenDaysAgo = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const [attemptsCountRow] = await db
      .select({ count: count() })
      .from(secretCrushAttempts)
      .where(
        and(eq(secretCrushAttempts.senderId, profile.id), gte(secretCrushAttempts.createdAt, sevenDaysAgo))
      );

    const attemptsInLast7Days = Number(attemptsCountRow?.count || 0);
    if (attemptsInLast7Days >= MAX_ATTEMPTS_7_DAYS) {
      return NextResponse.json(
        {
          error: `You have used all ${MAX_ATTEMPTS_7_DAYS} Secret Crush attempts for this rolling 7-day period. Removing a crush does not restore attempts.`,
        },
        { status: 400 }
      );
    }

    // 3. Check if currently active crush on this person
    const existingActive = await db.query.secretCrushes.findFirst({
      where: and(eq(secretCrushes.senderId, profile.id), eq(secretCrushes.targetId, targetId)),
    });

    if (existingActive) {
      return NextResponse.json({
        message: "You already have this student in your Secret Crush vault",
        isMutual: existingActive.isMutual,
      });
    }

    // 4. Check 7-day cooldown on this specific person
    const recentAttempt = await db.query.secretCrushAttempts.findFirst({
      where: and(
        eq(secretCrushAttempts.senderId, profile.id),
        eq(secretCrushAttempts.targetId, targetId),
        gte(secretCrushAttempts.createdAt, sevenDaysAgo)
      ),
      orderBy: (sca, { desc }) => [desc(sca.createdAt)],
    });

    if (recentAttempt) {
      return NextResponse.json(
        {
          error: `A 7-day cooldown applies before you can send a Secret Crush to ${targetProfile.displayName || "this person"} again.`,
        },
        { status: 400 }
      );
    }

    // 5. Check if target already has an active secret crush on sender (Mutual Match!)
    const reverseCrush = await db.query.secretCrushes.findFirst({
      where: and(eq(secretCrushes.senderId, targetId), eq(secretCrushes.targetId, profile.id)),
    });

    const isMutualMatch = !!reverseCrush;

    // Log the attempt
    await db.insert(secretCrushAttempts).values({
      senderId: profile.id,
      targetId,
    });

    // Insert new crush
    const [newCrush] = await db
      .insert(secretCrushes)
      .values({
        senderId: profile.id,
        targetId,
        isMutual: isMutualMatch,
        matchedAt: isMutualMatch ? new Date() : null,
      })
      .returning();

    if (isMutualMatch) {
      // 1. Update reverse crush record to mutual
      await db
        .update(secretCrushes)
        .set({ isMutual: true, matchedAt: new Date() })
        .where(eq(secretCrushes.id, reverseCrush.id));

      // 2. Find or create 1-on-1 chat conversation
      let conversationId: string | null = null;

      const userConvs = await db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, profile.id),
      });

      for (const uc of userConvs) {
        const peerMatch = await db.query.conversationParticipants.findFirst({
          where: and(
            eq(conversationParticipants.conversationId, uc.conversationId),
            eq(conversationParticipants.userId, targetId)
          ),
        });
        if (peerMatch) {
          conversationId = uc.conversationId;
          break;
        }
      }

      if (!conversationId) {
        const [newConv] = await db.insert(conversations).values({}).returning();
        conversationId = newConv.id;

        await db.insert(conversationParticipants).values([
          { conversationId, userId: profile.id },
          { conversationId, userId: targetId },
        ]);
      }

      // 3. Post mutual match greeting message
      await db.insert(messages).values({
        conversationId,
        senderId: profile.id,
        body: "💕 It's a Secret Crush Match! We both secretly liked each other.",
      });

      // 4. Send match notifications to both users
      if (conversationId) {
        await db.insert(notifications).values([
          {
            userId: targetId,
            actorId: profile.id,
            type: "MATCH",
            referenceId: conversationId,
            previewText: "💕 It's a Secret Crush Match! We both secretly liked each other.",
          },
          {
            userId: profile.id,
            actorId: targetId,
            type: "MATCH",
            referenceId: conversationId,
            previewText: "💕 It's a Secret Crush Match! We both secretly liked each other.",
          },
        ]);
      }

      return NextResponse.json({
        success: true,
        matched: true,
        conversationId,
        crush: newCrush,
        targetUser: {
          id: targetProfile.id,
          displayName: targetProfile.displayName,
          username: targetProfile.username,
          avatarUrl: targetProfile.avatarUrl,
        },
      });
    }

    // If not mutual yet: Send anonymous alert to target (intent strictly hidden!)
    await db.insert(notifications).values({
      userId: targetId,
      actorId: profile.id,
      type: "CRUSH_ALERT",
      referenceId: "/app/crush",
      previewText:
        "Someone from your campus added you to their Secret Crush vault! 🔒 Add your crushes to see if it's mutual.",
    });

    return NextResponse.json({
      success: true,
      matched: false,
      crush: newCrush,
      usedSlots: activeCount + 1,
      maxSlots: MAX_ACTIVE_SLOTS,
      remainingSlots: Math.max(0, MAX_ACTIVE_SLOTS - activeCount - 1),
      attemptsUsedIn7Days: attemptsInLast7Days + 1,
      maxAttemptsIn7Days: MAX_ATTEMPTS_7_DAYS,
      remainingAttemptsIn7Days: Math.max(0, MAX_ATTEMPTS_7_DAYS - attemptsInLast7Days - 1),
    });
  } catch (error) {
    console.error("POST /api/dating/crush error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/dating/crush — Remove a secret crush (does NOT restore rolling 7-day attempt)
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("targetId");
    const crushId = searchParams.get("id");

    if (!targetId && !crushId) {
      return NextResponse.json({ error: "targetId or id is required" }, { status: 400 });
    }

    if (crushId) {
      await db
        .delete(secretCrushes)
        .where(and(eq(secretCrushes.id, crushId), eq(secretCrushes.senderId, profile.id)));
    } else if (targetId) {
      await db
        .delete(secretCrushes)
        .where(and(eq(secretCrushes.senderId, profile.id), eq(secretCrushes.targetId, targetId)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dating/crush error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
