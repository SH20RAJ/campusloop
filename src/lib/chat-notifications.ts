import { and, eq, inArray, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { conversationParticipants, notifications } from "@/db/schema";
import { cleanNotificationSnippet, createNotificationsForMany } from "@/lib/notifications";

/**
 * Notify every other participant of a conversation that a message landed.
 *
 * Three independent silencers apply, in ascending cost order:
 *   1. the per-conversation `is_muted` flag (the mute button inside a chat),
 *   2. the account-wide "messages" switch, and
 *   3. a mute placed on the sender specifically
 * — the last two are enforced inside `createNotificationsForMany`.
 *
 * A rapid back-and-forth would otherwise leave a wall of rows in the
 * notifications tab, so any still-unread MESSAGE row for the same thread is
 * cleared first: each conversation keeps exactly one live entry, and the tab
 * reads like an inbox rather than a log.
 *
 * Never throws — a message must send even when nobody can be notified about it.
 */
export async function notifyNewMessage({
  conversationId,
  senderId,
  body,
}: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  try {
    const db = getDb();

    // Participants who have not silenced this specific thread.
    const recipients = await db
      .select({ userId: conversationParticipants.userId })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          ne(conversationParticipants.userId, senderId),
          eq(conversationParticipants.isMuted, false)
        )
      );

    if (recipients.length === 0) return;
    const recipientIds = recipients.map((row) => row.userId);

    // Collapse: drop the previous unread ping for this thread before adding the
    // newest one. Read rows are left alone — they are history, not a backlog.
    await db
      .delete(notifications)
      .where(
        and(
          inArray(notifications.userId, recipientIds),
          eq(notifications.type, "MESSAGE"),
          eq(notifications.referenceId, conversationId),
          eq(notifications.isRead, false)
        )
      );

    await createNotificationsForMany({
      recipientIds,
      actorId: senderId,
      type: "MESSAGE",
      // The notification deep-links to the thread, so the reference is the
      // conversation rather than the individual message.
      referenceId: conversationId,
      previewText: cleanNotificationSnippet(body, 90),
    });
  } catch (error) {
    console.error("notifyNewMessage failed:", error);
  }
}
