import { Redis } from "@upstash/redis";

/**
 * Upstash Redis Singleton for CampusLoop
 * Provides sub-millisecond key-value caching, rate limiting,
 * live signaling, and user behaviour analytics storage.
 */
let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Redis] Upstash Redis credentials not configured. Caching is disabled.");
    }
    return null;
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
}

export const redis = {
  get: async <T = unknown>(key: string) => getRedis()?.get<T>(key) ?? null,
  set: async (key: string, value: unknown, options?: Parameters<Redis["set"]>[2]) =>
    getRedis()?.set(key, value, options) ?? null,
};
