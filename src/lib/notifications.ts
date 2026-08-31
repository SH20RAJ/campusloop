import { inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import {
  channelForType,
  filterAllowedRecipients,
  isNotificationAllowed,
} from "@/lib/notification-preferences";
import { dispatchNotificationEmail } from "@/lib/notifications-email";
import { pushToUser } from "@/lib/push-dispatch";

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "REPLY"
  | "MENTION"
  | "REPOST"
  | "MATCH"
  | "CRUSH_ALERT"
  | "MILESTONE"
  | "FOLLOW"
  | "FRIEND"
  | "STORY_LIKE"
  | "STORY_REPLY"
  | "MESSAGE"
  | "NEW_POST";

export interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type: NotificationType;
  referenceId?: string | null;
  previewText?: string | null;
}

/** Types that should buzz a phone immediately rather than ride the normal queue. */
const HIGH_URGENCY_TYPES = new Set<NotificationType>(["MATCH", "MESSAGE"]);

/**
 * Truncate and clean text snippet for notification previews
 */
export function cleanNotificationSnippet(text: string, maxLength = 120): string {
  if (!text) return "";
  // Strip markdown images and links
  const cleaned = text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3)}...`;
}

/**
 * Regex-based extraction of @username handles
 */
export function extractMentionUsernames(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/(?:^|\s)@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];

  const handles = matches.map((m) => m.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);

  return Array.from(new Set(handles));
}

/**
 * Create a single notification with self-notification safety guard.
 *
 * Honours the recipient's account-wide channel switches and any mute they have
 * placed on this specific actor, so a muted person's activity produces no row,
 * no push and no email — nothing for the student to dismiss later.
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  // Prevent notifying oneself
  if (params.userId === params.actorId) {
    return false;
  }

  const allowed = await isNotificationAllowed({
    userId: params.userId,
    actorId: params.actorId,
    channel: channelForType(params.type),
  });
  if (!allowed) return false;

  try {
    const db = getDb();
    await db.insert(notifications).values({
      userId: params.userId,
      actorId: params.actorId,
      type: params.type,
      referenceId: params.referenceId || null,
      previewText: params.previewText ? cleanNotificationSnippet(params.previewText) : null,
    });

    // Wake the recipient's devices; failures here never fail the write above.
    await pushToUser(params.userId, HIGH_URGENCY_TYPES.has(params.type) ? "high" : "normal");

    // Dispatch transactional email via Cloudflare Email Sending
    dispatchNotificationEmail(params).catch(() => {});

    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
}

/**
 * Fan one event out to many recipients — a new post reaching every follower.
 *
 * Deliberately not a loop over `createNotification`: the mute/preference check
 * is batched into two queries and the rows land in a single multi-value insert,
 * so the cost is bounded by the audience size rather than multiplied by it.
 * Pushes are still per-device and are fired concurrently in capped waves.
 *
 * Returns the number of students actually notified.
 */
export async function createNotificationsForMany({
  recipientIds,
  actorId,
  type,
  referenceId,
  previewText,
  maxRecipients = 500,
}: {
  recipientIds: string[];
  actorId: string;
  type: NotificationType;
  referenceId?: string | null;
  previewText?: string | null;
  maxRecipients?: number;
}): Promise<number> {
  const channel = channelForType(type);
  if (!channel) return 0;

  const unique = Array.from(new Set(recipientIds)).filter((id) => id && id !== actorId);
  if (unique.length === 0) return 0;

  try {
    const allowed = await filterAllowedRecipients({ recipientIds: unique, actorId, channel });
    // A viral account should not be able to turn one post into an unbounded
    // write amplification; the newest followers past the cap simply see the
    // post in their feed instead of on their lock screen.
    const audience = allowed.slice(0, maxRecipients);
    if (audience.length === 0) return 0;

    const db = getDb();
    const snippet = previewText ? cleanNotificationSnippet(previewText) : null;

    await db.insert(notifications).values(
      audience.map((userId) => ({
        userId,
        actorId,
        type,
        referenceId: referenceId || null,
        previewText: snippet,
      }))
    );

    // Wake devices in waves so a large audience never opens hundreds of
    // simultaneous sockets from one worker invocation.
    const urgency = HIGH_URGENCY_TYPES.has(type) ? "high" : "normal";
    const WAVE = 25;
    for (let i = 0; i < audience.length; i += WAVE) {
      await Promise.all(audience.slice(i, i + WAVE).map((userId) => pushToUser(userId, urgency)));
    }

    return audience.length;
  } catch (error) {
    console.error("Failed to fan out notifications:", error);
    return 0;
  }
}

/**
 * Dispatches MENTION notifications to all valid users tagged in a post or comment
 */
export async function notifyMentions({
  text,
  actorId,
  referenceId,
}: {
  text: string;
  actorId: string;
  referenceId: string;
}): Promise<void> {
  const handles = extractMentionUsernames(text);
  if (handles.length === 0) return;

  try {
    const db = getDb();
    const matchedUsers = await db.query.userProfiles.findMany({
      where: inArray(sql`LOWER(${userProfiles.username})`, handles),
      columns: {
        id: true,
        username: true,
      },
    });

    const snippet = cleanNotificationSnippet(text);

    for (const user of matchedUsers) {
      if (user.id !== actorId) {
        await createNotification({
          userId: user.id,
          actorId,
          type: "MENTION",
          referenceId,
          previewText: snippet,
        });
      }
    }
  } catch (error) {
    console.error("Failed to notify mentioned users:", error);
  }
}
