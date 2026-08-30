import { inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { notifications, userProfiles } from "@/db/schema";
import { dispatchNotificationEmail } from "@/lib/notifications-email";
import { pushToUser } from "@/lib/push-dispatch";

export interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type:
    | "LIKE"
    | "COMMENT"
    | "REPLY"
    | "MENTION"
    | "REPOST"
    | "MATCH"
    | "CRUSH_ALERT"
    | "MILESTONE"
    | "FOLLOW"
    | "FRIEND";
  referenceId?: string | null;
  previewText?: string | null;
}

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
 * Create a single notification with self-notification safety guard
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  // Prevent notifying oneself
  if (params.userId === params.actorId) {
    return false;
  }

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
    await pushToUser(params.userId, params.type === "MATCH" ? "high" : "normal");

    // Dispatch transactional email via Cloudflare Email Sending
    dispatchNotificationEmail(params).catch(() => {});

    return true;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return false;
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
