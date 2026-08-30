import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { sendPushTickle } from "@/lib/web-push";

/**
 * Wake every device a student has registered. Dead endpoints are pruned as we
 * discover them, so the table self-cleans instead of accumulating garbage
 * from uninstalled browsers.
 *
 * Never throws: a failed push must not fail the action that triggered it.
 */
export async function pushToUser(userId: string, urgency: "normal" | "high" = "normal"): Promise<void> {
  try {
    const db = getDb();
    const subs = await db
      .select({ id: pushSubscriptions.id, endpoint: pushSubscriptions.endpoint })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    if (subs.length === 0) return;

    const results = await Promise.all(
      subs.map(async (sub) => ({ id: sub.id, result: await sendPushTickle(sub.endpoint, urgency) }))
    );

    const expired = results.filter((r) => r.result === "expired").map((r) => r.id);
    if (expired.length > 0) {
      await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, expired));
    }
  } catch (error) {
    console.error("pushToUser failed:", error);
  }
}
