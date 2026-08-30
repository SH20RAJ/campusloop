/**
 * Server-only gamification mutations.
 *
 * Kept separate from `@/lib/gamification` because that module is imported by
 * client components for the clout tier constants, and it must stay free of
 * database (and therefore `node:crypto`) imports.
 */

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";

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
