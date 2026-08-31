import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { merchants, merchantUsers, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getAuthenticatedMerchant } from "@/lib/merchant-auth";

/**
 * Resolve the store the caller is actually authorised to act for.
 *
 * Exactly two ways in:
 *   1. a merchant portal session cookie, or
 *   2. a signed-in student explicitly linked to a store via `merchant_users`.
 *
 * There used to be a third: when neither matched, this returned the first
 * merchant at the student's institution, and failing that
 * `db.query.merchants.findFirst()` — *any* store in the database. With
 * `merchant_users` empty, that meant every signed-in student resolved to a real
 * store and inherited its powers across all six /api/merchant routes: reading
 * other students' orders with their delivery addresses and phone numbers,
 * editing menu prices, and advancing order statuses.
 *
 * Returning null is the correct answer for someone who runs no store. The
 * merchant portal at /merchant-portal/login issues the cookie that path 1
 * looks for.
 */
export async function resolveMerchantSession(): Promise<typeof merchants.$inferSelect | null> {
  // 1. Direct merchant session cookie
  const directMerchant = await getAuthenticatedMerchant();
  if (directMerchant) {
    return directMerchant;
  }

  // 2. A student explicitly linked to a store as staff
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) return null;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) return null;

    const merchantUser = await db.query.merchantUsers.findFirst({
      where: eq(merchantUsers.userId, profile.id),
      with: { merchant: true },
    });

    const merchant = merchantUser?.merchant;
    if (!merchant) return null;

    // A suspended or closed store grants nothing, however the caller arrived.
    if (merchant.status === "SUSPENDED" || merchant.status === "CLOSED") return null;

    return merchant;
  } catch (err) {
    console.error("Error resolving merchant session:", err);
    return null;
  }
}
