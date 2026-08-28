import { getDb } from "@/db";
import {
  conversationParticipants,
  conversations,
  messages,
  notifications,
  secretCrushes,
  userProfiles,
} from "@/db/schema";
import {
  getSecretCrushSlotLimit,
  getSecretCrushSlotProgress,
  SECRET_CRUSH_EXPANSION_LP_THRESHOLD,
  SECRET_CRUSH_MAX_SLOTS,
} from "@/constants/gamification";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,count,eq } from "drizzle-orm";
import { NextRequest,NextResponse } from "next/server";


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

    // 1. Get sent secret crushes with target profile
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

    // 2. Get count of anonymous incoming secret crushes (Intent hidden!)
    const [receivedCountRow] = await db
      .select({ count: count() })
      .from(secretCrushes)
      .where(and(eq(secretCrushes.targetId, profile.id), eq(secretCrushes.isMutual, false)));

    const receivedCrushesCount = Number(receivedCountRow?.count || 0);

    const userPoints = profile.points || 0;
    const maxSlots = getSecretCrushSlotLimit(userPoints);
    const slotProgress = getSecretCrushSlotProgress(userPoints);

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
      maxSlots,
      remainingSlots: Math.max(0, maxSlots - sentCrushes.length),
      receivedCrushesCount,
      slotProgress,
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

    // Check active crush count
    const [sentCountRow] = await db
      .select({ count: count() })
      .from(secretCrushes)
      .where(eq(secretCrushes.senderId, profile.id));

    const currentCount = Number(sentCountRow?.count || 0);

    // Check if already crushed on this target
    const existing = await db.query.secretCrushes.findFirst({
      where: and(
        eq(secretCrushes.senderId, profile.id),
        eq(secretCrushes.targetId, targetId)
      ),
    });

    if (existing) {
      return NextResponse.json({
        message: "You already have this student in your Secret Crush vault",
        isMutual: existing.isMutual,
      });
    }

    const userPoints = profile.points || 0;
    const maxSlots = getSecretCrushSlotLimit(userPoints);

    if (currentCount >= maxSlots) {
      if (maxSlots < SECRET_CRUSH_MAX_SLOTS) {
        return NextResponse.json(
          {
            error: `You have filled all ${maxSlots} secret crush slots. Reach ${SECRET_CRUSH_EXPANSION_LP_THRESHOLD} Loop Points (LP) to unlock 50 slots! You currently have ${userPoints} LP.`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `You have reached the maximum limit of ${maxSlots} secret crushes. Remove an existing one to add a new crush.` },
        { status: 400 }
      );
    }

    // Check if target already has an active secret crush on sender
    const reverseCrush = await db.query.secretCrushes.findFirst({
      where: and(
        eq(secretCrushes.senderId, targetId),
        eq(secretCrushes.targetId, profile.id)
      ),
    });

    const isMutualMatch = !!reverseCrush;

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

      // Check if conversation already exists
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
        body: "💘 It's a Secret Crush Match! We both secretly liked each other.",
      });

      // 4. Send match notifications to both users
      if (conversationId) {
        await db.insert(notifications).values([
          {
            userId: targetId,
            actorId: profile.id,
            type: "MATCH",
            referenceId: conversationId,
            previewText: "It's a Mutual Secret Crush Match! 🎉 Say hello in chat.",
          },
          {
            userId: profile.id,
            actorId: targetId,
            type: "MATCH",
            referenceId: conversationId,
            previewText: "It's a Mutual Secret Crush Match! 🎉 Say hello in chat.",
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
      actorId: profile.id, // Stored safely in db for moderation/safety, but displayed as anonymous
      type: "CRUSH_ALERT",
      referenceId: "/app/crush",
      previewText: "Someone from your campus added you to their Secret Crush vault! 🔒 Add your crushes to see if it's mutual.",
    });


    return NextResponse.json({
      success: true,
      matched: false,
      crush: newCrush,
      usedSlots: currentCount + 1,
      maxSlots,
      remainingSlots: Math.max(0, maxSlots - currentCount - 1),
    });
  } catch (error) {
    console.error("POST /api/dating/crush error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/dating/crush — Remove a secret crush
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
        .where(
          and(
            eq(secretCrushes.id, crushId),
            eq(secretCrushes.senderId, profile.id)
          )
        );
    } else if (targetId) {
      await db
        .delete(secretCrushes)
        .where(
          and(
            eq(secretCrushes.senderId, profile.id),
            eq(secretCrushes.targetId, targetId)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dating/crush error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
