import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userBehaviorEvents, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

interface ReelTrackPayload {
  postId?: string;
  watchDurationMs?: number;
  videoDurationMs?: number;
  loopCount?: number;
  completed?: boolean;
  skippedQuickly?: boolean;
  action?: "like" | "save" | "share" | "comment" | "follow" | "loop" | "dwell" | "skip";
  tags?: string[];
  authorId?: string | null;
  institutionId?: string | null;
}

export async function POST(req: Request) {
  try {
    let payload: ReelTrackPayload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const {
      postId,
      watchDurationMs = 0,
      videoDurationMs = 0,
      loopCount = 0,
      completed = false,
      skippedQuickly = false,
      action = "dwell",
      tags = [],
      authorId = null,
      institutionId = null,
    } = payload;

    if (!postId || typeof postId !== "string") {
      return NextResponse.json({ ok: false, error: "postId is required" }, { status: 400 });
    }

    const user = await hexclaveServerApp.getUser();
    if (!user) {
      // Unauthenticated viewers are acknowledged gracefully without error
      return NextResponse.json({ ok: true, anonymous: true });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true, institutionId: true },
    });

    if (!profile) {
      return NextResponse.json({ ok: true, profileMissing: true });
    }

    const viewerId = profile.id;

    // Calculate algorithmic engagement weight
    let weight = 1;
    if (skippedQuickly) {
      weight = -2;
    } else {
      if (completed) weight += 3;
      if (loopCount > 0) weight += Math.min(loopCount * 4, 12);
      if (action === "like") weight += 3;
      if (action === "save") weight += 4;
      if (action === "share") weight += 5;
      if (action === "follow") weight += 6;
      if (action === "comment") weight += 4;
    }

    // 1. Upstash Redis Real-time Layer (sub-5ms update)
    try {
      const redis = getRedis();
      if (redis) {
        const now = Date.now();

        // Mark reel as seen by this user (score: timestamp, 14-day rolling window)
        const userSeenKey = `user:${viewerId}:seen_reels`;
        await redis.zadd(userSeenKey, { score: now, member: postId });
        await redis.zremrangebyrank(userSeenKey, 0, -501);
        await redis.expire(userSeenKey, 60 * 60 * 24 * 14);

        // Update tag affinities
        if (Array.isArray(tags) && tags.length > 0) {
          const tagScoreDelta = skippedQuickly ? -1.5 : Math.max(1, weight * 0.5);
          for (const rawTag of tags.slice(0, 5)) {
            const tag = String(rawTag).toLowerCase().replace(/^#/, "").trim();
            if (tag.length >= 2 && tag.length <= 30) {
              await redis.zincrby(`user:${viewerId}:interests`, tagScoreDelta, tag);
            }
          }
          await redis.expire(`user:${viewerId}:interests`, 60 * 60 * 24 * 30);
        }

        // Update creator affinity
        if (authorId && typeof authorId === "string" && authorId !== viewerId) {
          const creatorScoreDelta = skippedQuickly ? -1.0 : Math.max(1, weight * 0.8);
          await redis.zincrby(`user:${viewerId}:creators`, creatorScoreDelta, authorId);
          await redis.expire(`user:${viewerId}:creators`, 60 * 60 * 24 * 30);
        }
      }
    } catch (redisErr) {
      // Non-fatal: continue to DB commit
      if (process.env.NODE_ENV !== "test") {
        console.warn("[Reels Telemetry Redis Warning]:", redisErr);
      }
    }

    // 2. Commit durable analytics row to PostgreSQL
    try {
      await db.insert(userBehaviorEvents).values({
        userId: viewerId,
        eventType: skippedQuickly ? "REEL_SKIP" : loopCount > 0 ? "REEL_LOOP" : "REEL_WATCH",
        targetType: "POST",
        targetId: postId,
        metadata: {
          watchDurationMs,
          videoDurationMs,
          loopCount,
          completed,
          skippedQuickly,
          action,
          tags,
          authorId,
          institutionId,
        },
        weight,
      });
    } catch (dbErr) {
      if (process.env.NODE_ENV !== "test") {
        console.error("[Reels Telemetry DB Error]:", dbErr);
      }
    }

    return NextResponse.json({ ok: true, weight });
  } catch (error) {
    console.error("[POST /api/reels/track error]:", error);
    return NextResponse.json({ ok: false, error: "Internal tracking error" }, { status: 500 });
  }
}
