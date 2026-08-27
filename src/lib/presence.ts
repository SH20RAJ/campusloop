import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { and,eq,lt,or,sql } from "drizzle-orm";

/** A student counts as online while their heartbeat is younger than this. */
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;
/** Client heartbeat interval; the write is skipped if a fresher one exists. */
export const HEARTBEAT_INTERVAL_MS = 60 * 1000;
/** Don't write more often than this per user, however chatty the client is. */
const WRITE_THROTTLE_SECONDS = 45;

export function isOnline(lastSeenAt?: Date | string | null): boolean {
  if (!lastSeenAt) return false;
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return false;
  return Date.now() - seen < ONLINE_WINDOW_MS;
}

/**
 * Human presence label: "Online", "Active 5m ago", "Active yesterday", or
 * null when the student has never been seen (nothing to claim).
 */
export function presenceLabel(lastSeenAt?: Date | string | null): string | null {
  if (!lastSeenAt) return null;
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return null;

  const diff = Date.now() - seen;
  if (diff < ONLINE_WINDOW_MS) return "Online";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Active ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Active yesterday";
  if (days < 7) return `Active ${days}d ago`;
  return "Active a while ago";
}

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
          lt(userProfiles.lastSeenAt, sql`now() - interval '${sql.raw(String(WRITE_THROTTLE_SECONDS))} seconds'`),
        ),
      ),
    );
}
