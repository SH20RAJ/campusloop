/**
 * Backwards compatibility re-export.
 * All canonical gamification constants are maintained in `@/constants/gamification`.
 */

import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export * from "@/constants/gamification";

/**
 * Atomically credits Loop Points to a student's profile.
 *
 * `reason` is only used for server-side observability today; the ledger itself
 * lives on `user_profiles.points` so clout tiers stay a single source of truth.
 */
export async function awardPoints(profileId: string, amount: number, reason: string) {
  if (!profileId || !Number.isFinite(amount) || amount === 0) return;

  const db = getDb();
  await db
    .update(userProfiles)
    .set({ points: sql`GREATEST(${userProfiles.points} + ${amount}, 0)` })
    .where(eq(userProfiles.id, profileId));

  if (process.env.NODE_ENV !== "production") {
    console.log(`[LP] ${reason}: ${amount > 0 ? "+" : ""}${amount} -> ${profileId}`);
  }
}
