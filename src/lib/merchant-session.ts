import { getDb } from "@/db";
import { merchants, merchantUsers, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getAuthenticatedMerchant } from "@/lib/merchant-auth";
import { eq } from "drizzle-orm";

export async function resolveMerchantSession(): Promise<typeof merchants.$inferSelect | null> {
  // 1. Direct merchant session cookie
  const directMerchant = await getAuthenticatedMerchant();
  if (directMerchant) {
    return directMerchant;
  }

  // 2. Fallback to Hexclave user session
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) return null;

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) return null;

    let merchantUser = await db.query.merchantUsers.findFirst({
      where: eq(merchantUsers.userId, profile.id),
      with: { merchant: true },
    });

    let merchant = merchantUser?.merchant;
    if (!merchant) {
      const firstMerchant = await db.query.merchants.findFirst({
        where: eq(merchants.institutionId, profile.institutionId),
      });
      merchant = firstMerchant || (await db.query.merchants.findFirst());
    }

    return merchant || null;
  } catch (err) {
    console.error("Error resolving fallback merchant session:", err);
    return null;
  }
}
