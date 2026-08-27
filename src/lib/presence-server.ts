import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { WRITE_THROTTLE_SECONDS } from "@/lib/presence";
import { and,eq,lt,or,sql } from "drizzle-orm";

/**
 * Record a heartbeat. Throttled in SQL rather than in memory: the row is only
 * touched when the stored timestamp is already stale, so a tab heart-beating
 * every 60s costs at most one write per 45s per user, and several tabs from
 * the same student collapse into the same budget.
 */
export async function recordHeartbeat(profileId: string): Promise<void> {
  const db = getDb();
  await db
    .update(userProfiles)
    .set({ lastSeenAt: new Date() })
    .where(
      and(
        eq(userProfiles.id, profileId),
        or(
          sql`${userProfiles.lastSeenAt} IS NULL`,
          lt(
            userProfiles.lastSeenAt,
            sql`now() - interval '${sql.raw(String(WRITE_THROTTLE_SECONDS))} seconds'`,
          ),
        ),
      ),
    );
}
