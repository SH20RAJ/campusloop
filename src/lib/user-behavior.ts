import { getDb } from "@/db";
import { userBehaviorEvents } from "@/db/schema";
import { getRedis } from "@/lib/redis";

export interface UserEventPayload {
  userId: string;
  eventType:
    | "POST_VIEW"
    | "POST_DWELL"
    | "SEARCH"
    | "PROFILE_VISIT"
    | "STORY_VIEW"
    | "CHAT_CALL"
    | "COMMUNITY_JOIN"
    | "MARKETPLACE_VIEW"
    | "RANDOM_LOOP_ENGAGE";
  targetType?: "POST" | "USER" | "COLLEGE" | "COMMUNITY" | "SEARCH_QUERY" | "CALL";
  targetId?: string;
  metadata?: Record<string, any>;
  weight?: number;
}

/**
 * High-performance, dual-layer behavior tracking:
 * 1. Writes instantly to Upstash Redis (LP/Recent affinity cache, real-time personalization)
 * 2. Asynchronously commits to PostgreSQL userBehaviorEvents table for durable training data
 */
export async function trackUserBehavior(event: UserEventPayload): Promise<void> {
  const { userId, eventType, targetType, targetId, metadata = {}, weight = 1 } = event;

  // 1. Upstash Redis Real-Time Layer (sub-5ms)
  try {
    const redis = getRedis();
    if (redis) {
      const now = Date.now();
      // Track recently engaged target IDs in a sorted set per user
      if (targetId) {
        const userRecentsKey = `user:${userId}:recents:${eventType.toLowerCase()}`;
        await redis.zadd(userRecentsKey, { score: now, member: targetId });
        // Keep top 100 recent items per category, expire key after 14 days
        await redis.zremrangebyrank(userRecentsKey, 0, -101);
        await redis.expire(userRecentsKey, 60 * 60 * 24 * 14);
      }

      // Increment user interest tags frequency
      if (metadata?.interests && Array.isArray(metadata.interests)) {
        for (const interest of metadata.interests) {
          await redis.zincrby(`user:${userId}:interests`, weight, interest);
        }
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Redis Behavior Tracking Non-Fatal Error]:", err);
    }
  }

  // 2. Persistent PostgreSQL Event Log Layer
  try {
    const db = getDb();
    await db.insert(userBehaviorEvents).values({
      userId,
      eventType,
      targetType,
      targetId,
      metadata,
      weight,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Postgres Behavior Tracking Error]:", err);
    }
  }
}

/**
 * Retrieve user's top affinity tags from Redis cache (for instantaneous For You ranking)
 */
export async function getUserAffinityInterests(userId: string): Promise<string[]> {
  try {
    const redis = getRedis();
    if (!redis) return [];
    // Top 5 highest weighted interests
    return await redis.zrevrange(`user:${userId}:interests`, 0, 4);
  } catch {
    return [];
  }
}
