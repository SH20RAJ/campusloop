/**
 * Server-only gamification mutations & anti-abuse protections.
 *
 * Kept separate from `@/lib/gamification` because that module is imported by
 * client components for clout tier constants, and must stay free of
 * database (and `node:crypto`) imports.
 */

import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { getCloutTier, LP_ABUSE_PROTECTION, VERIFIED_LP_THRESHOLD, type LpActionType } from "@/constants/gamification";
import { createNotification } from "@/lib/notifications";

// In-memory rate limiting and daily cap tracking across warm runtime instances
const userDailyPoints = new Map<string, { total: number; date: string; actions: Map<string, number> }>();
const userActionTimestamps = new Map<string, number>();

/**
 * Atomically credits Loop Points to a student's profile with abuse protections,
 * daily category caps, and automatic milestone tier promotions.
 */
export async function awardPoints(
  profileId: string,
  amount: number,
  reason: LpActionType | string,
  options?: { actorId?: string; referenceId?: string; bypassCaps?: boolean }
) {
  if (!profileId || !Number.isFinite(amount) || amount === 0) return { credited: 0, reason: "invalid_input" };

  // Anti-abuse: Self-rewards prohibited (e.g. self-voting, self-downloading)
  if (!LP_ABUSE_PROTECTION.SELF_REWARD_ALLOWED && options?.actorId && options.actorId === profileId) {
    return { credited: 0, reason: "self_reward_prohibited" };
  }

  // Anti-abuse: Rapid velocity limiter (max actions per minute)
  const now = Date.now();
  const lastActionTime = userActionTimestamps.get(profileId) || 0;
  if (!options?.bypassCaps && now - lastActionTime < LP_ABUSE_PROTECTION.MIN_COOLDOWN_SECONDS * 1000) {
    return { credited: 0, reason: "cooldown_active" };
  }
  userActionTimestamps.set(profileId, now);

  // Daily caps enforcement
  const today = new Date().toISOString().slice(0, 10);
  let userStats = userDailyPoints.get(profileId);
  if (!userStats || userStats.date !== today) {
    userStats = { total: 0, date: today, actions: new Map() };
    userDailyPoints.set(profileId, userStats);
  }

  if (!options?.bypassCaps) {
    // Check global daily cap
    if (userStats.total >= LP_ABUSE_PROTECTION.DAILY_CAPS.DAILY_TOTAL_MAX) {
      return { credited: 0, reason: "daily_total_cap_reached" };
    }

    // Check category cap if configured
    const categoryCap = (LP_ABUSE_PROTECTION.DAILY_CAPS as Record<string, number>)[reason];
    if (categoryCap) {
      const currentCategoryEarned = userStats.actions.get(reason) || 0;
      if (currentCategoryEarned >= categoryCap) {
        return { credited: 0, reason: "category_cap_reached" };
      }
      // If adding amount exceeds cap, clamp to remaining cap
      amount = Math.min(amount, categoryCap - currentCategoryEarned);
    }
  }

  const db = getDb();

  // Fetch current user profile to verify prior clout tier
  const currentProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, profileId),
    columns: { id: true, userId: true, points: true, displayName: true },
  });

  if (!currentProfile) return { credited: 0, reason: "profile_not_found" };

  const prevPoints = currentProfile.points || 0;
  const prevTier = getCloutTier(prevPoints);

  // Atomically update user points
  const [updated] = await db
    .update(userProfiles)
    .set({ points: sql`GREATEST(${userProfiles.points} + ${amount}, 0)` })
    .where(eq(userProfiles.id, profileId))
    .returning({ id: userProfiles.id, points: userProfiles.points });

  const newPoints = typeof updated?.points === "number" ? updated.points : prevPoints + amount;
  const newTier = getCloutTier(newPoints);

  // Update in-memory daily tracker
  userStats.total += amount;
  userStats.actions.set(reason, (userStats.actions.get(reason) || 0) + amount);

  // Check for Clout Tier promotion or Verified Student milestone
  if (newTier.level > prevTier.level) {
    try {
      await createNotification({
        userId: currentProfile.userId,
        actorId: currentProfile.id,
        type: "MILESTONE",
        previewText: `Level Up! You just unlocked ${newTier.tierName} (Level ${newTier.level}) with ${newPoints} LP!`,
        referenceId: profileId,
        silent: false,
      });
    } catch (e) {
      console.error("[LP] Failed to dispatch tier promotion notification:", e);
    }
  } else if (prevPoints < VERIFIED_LP_THRESHOLD && newPoints >= VERIFIED_LP_THRESHOLD) {
    try {
      await createNotification({
        userId: currentProfile.userId,
        actorId: currentProfile.id,
        type: "MILESTONE",
        previewText: `You reached 150 LP! Verified Student Shield & 50 Secret Crush slots are now unlocked.`,
        referenceId: profileId,
        silent: false,
      });
    } catch (e) {
      console.error("[LP] Failed to dispatch verification notification:", e);
    }
  }

  return { credited: amount, newPoints, newTier: newTier.tierName };
}
