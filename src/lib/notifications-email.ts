import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { buildNotificationEmail } from "@/lib/email-templates";
import { eq } from "drizzle-orm";
import type { CreateNotificationParams } from "./notifications";

/**
 * Dispatches an email notification to the recipient when relevant events happen,
 * using Cloudflare Email Sending.
 */
export async function dispatchNotificationEmail(params: CreateNotificationParams): Promise<void> {
  // Can be disabled via env if needed
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === "false") {
    return;
  }

  // Only dispatch emails for high-signal notifications
  const emailWorthyTypes = ["MENTION", "MATCH", "REPLY"];
  if (!emailWorthyTypes.includes(params.type)) {
    return;
  }

  try {
    const db = getDb();

    // Fetch recipient and actor profiles
    const [recipient, actor] = await Promise.all([
      db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, params.userId),
        columns: {
          id: true,
          displayName: true,
          email: true,
          username: true,
        },
      }),
      db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, params.actorId),
        columns: {
          id: true,
          displayName: true,
          username: true,
        },
      }),
    ]);

    if (!recipient?.email || !actor) {
      return;
    }

    const { subject, html, text } = buildNotificationEmail({
      recipientName: recipient.displayName || recipient.username,
      actorName: actor.username,
      type: params.type as "MENTION" | "REPLY" | "MATCH",
      snippet: params.previewText || undefined,
      actionUrl: `https://campusloop.space/app/notifications`,
    });

    await sendEmail({
      to: recipient.email,
      subject,
      html,
      text,
    });
  } catch (error) {
    // Non-fatal background email dispatch error
    console.warn("[dispatchNotificationEmail failed]:", error);
  }
}
