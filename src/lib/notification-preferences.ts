import { and, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import { notificationMutes, notificationPreferences } from "@/db/schema";

/**
 * Delivery channels a student can silence. A channel groups the notification
 * types that feel like one thing to the person receiving them, so muting
 * "comments" covers both top-level comments and threaded replies.
 */
export type NotificationChannel =
  | "POST"
  | "MESSAGE"
  | "LIKE"
  | "COMMENT"
  | "MENTION"
  | "REPOST"
  | "FOLLOW"
  | "STORY"
  | "MATCH";

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "POST",
  "MESSAGE",
  "LIKE",
  "COMMENT",
  "MENTION",
  "REPOST",
  "FOLLOW",
  "STORY",
  "MATCH",
];

/** "ALL" is a wildcard mute covering every channel from one actor. */
export type MuteChannel = NotificationChannel | "ALL";

export function isMuteChannel(value: unknown): value is MuteChannel {
  return value === "ALL" || NOTIFICATION_CHANNELS.includes(value as NotificationChannel);
}

/**
 * Notification type (what the row stores) → channel (what the student toggles).
 * Unknown types fall through to null and are always delivered, so a new
 * notification type can never be silently swallowed by a stale mapping.
 */
export function channelForType(type: string): NotificationChannel | null {
  switch (type) {
    case "NEW_POST":
      return "POST";
    case "MESSAGE":
      return "MESSAGE";
    case "LIKE":
      return "LIKE";
    case "COMMENT":
    case "REPLY":
      return "COMMENT";
    case "MENTION":
      return "MENTION";
    case "REPOST":
      return "REPOST";
    case "FOLLOW":
    case "FRIEND":
      return "FOLLOW";
    case "STORY_LIKE":
    case "STORY_REPLY":
      return "STORY";
    case "MATCH":
    case "CRUSH_ALERT":
      return "MATCH";
    default:
      return null;
  }
}

export interface NotificationPreferenceSet {
  messages: boolean;
  followedPosts: boolean;
  followedPostsFriendsOnly: boolean;
  likes: boolean;
  comments: boolean;
  mentions: boolean;
  follows: boolean;
  reposts: boolean;
  matches: boolean;
}

/** Everything on — what a student gets before they ever open the settings page. */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceSet = {
  messages: true,
  followedPosts: true,
  followedPostsFriendsOnly: false,
  likes: true,
  comments: true,
  mentions: true,
  follows: true,
  reposts: true,
  matches: true,
};

function channelEnabled(channel: NotificationChannel, prefs: NotificationPreferenceSet): boolean {
  switch (channel) {
    case "POST":
      return prefs.followedPosts;
    case "MESSAGE":
      return prefs.messages;
    case "LIKE":
      return prefs.likes;
    case "COMMENT":
      return prefs.comments;
    case "MENTION":
      return prefs.mentions;
    case "REPOST":
      return prefs.reposts;
    case "FOLLOW":
      return prefs.follows;
    case "STORY":
    case "MATCH":
      return prefs.matches;
    default:
      return true;
  }
}

/**
 * One student's account-wide switches, defaulted when no row exists yet.
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferenceSet> {
  try {
    const db = getDb();
    const row = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    });
    if (!row) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    return {
      messages: row.messages,
      followedPosts: row.followedPosts,
      followedPostsFriendsOnly: row.followedPostsFriendsOnly,
      likes: row.likes,
      comments: row.comments,
      mentions: row.mentions,
      follows: row.follows,
      reposts: row.reposts,
      matches: row.matches,
    };
  } catch (error) {
    console.error("getNotificationPreferences failed:", error);
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

/**
 * Upsert an account-wide switch set. Only the supplied keys change.
 */
export async function updateNotificationPreferences(
  userId: string,
  patch: Partial<NotificationPreferenceSet>
): Promise<NotificationPreferenceSet> {
  const db = getDb();
  const current = await getNotificationPreferences(userId);
  const next = { ...current, ...patch };

  await db
    .insert(notificationPreferences)
    .values({ userId, ...next })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { ...next, updatedAt: new Date() },
    });

  return next;
}

/**
 * Whether one notification should reach one recipient — the account-wide switch
 * for the channel AND the absence of a mute on that specific actor.
 *
 * Fails open: if the lookup errors the notification is still delivered, since
 * a dropped alert is worse than an extra one.
 */
export async function isNotificationAllowed({
  userId,
  actorId,
  channel,
}: {
  userId: string;
  actorId?: string | null;
  channel: NotificationChannel | null;
}): Promise<boolean> {
  if (!channel) return true;

  try {
    const prefs = await getNotificationPreferences(userId);
    if (!channelEnabled(channel, prefs)) return false;
    if (!actorId) return true;

    const db = getDb();
    const mute = await db.query.notificationMutes.findFirst({
      where: and(
        eq(notificationMutes.userId, userId),
        eq(notificationMutes.mutedUserId, actorId),
        or(eq(notificationMutes.channel, "ALL"), eq(notificationMutes.channel, channel))
      ),
      columns: { id: true },
    });

    return !mute;
  } catch (error) {
    console.error("isNotificationAllowed failed:", error);
    return true;
  }
}

/**
 * Fan-out filter: given many candidate recipients and one actor, return only
 * those who still want this channel from this person.
 *
 * Two queries total regardless of audience size — the muted set and the
 * preference rows are both fetched with a single `IN`, so a post going out to
 * a thousand followers does not become a thousand round trips.
 */
export async function filterAllowedRecipients({
  recipientIds,
  actorId,
  channel,
}: {
  recipientIds: string[];
  actorId: string;
  channel: NotificationChannel;
}): Promise<string[]> {
  const candidates = recipientIds.filter((recipientId) => recipientId !== actorId);
  if (candidates.length === 0) return [];

  try {
    const db = getDb();

    const [mutes, prefRows] = await Promise.all([
      db
        .select({ userId: notificationMutes.userId })
        .from(notificationMutes)
        .where(
          and(
            inArray(notificationMutes.userId, candidates),
            eq(notificationMutes.mutedUserId, actorId),
            or(eq(notificationMutes.channel, "ALL"), eq(notificationMutes.channel, channel))
          )
        ),
      db.select().from(notificationPreferences).where(inArray(notificationPreferences.userId, candidates)),
    ]);

    const muted = new Set(mutes.map((row) => row.userId));
    // Only students who have actually saved preferences appear here; everyone
    // else keeps the all-on default.
    const disabled = new Set(
      prefRows
        .filter((row) => !channelEnabled(channel, row as unknown as NotificationPreferenceSet))
        .map((row) => row.userId)
    );

    return candidates.filter((recipientId) => !muted.has(recipientId) && !disabled.has(recipientId));
  } catch (error) {
    console.error("filterAllowedRecipients failed:", error);
    return candidates;
  }
}

/**
 * Recipients who additionally restricted followed-post alerts to mutual friends.
 * Used by the new-post fan-out to drop one-way followers from their audience.
 */
export async function getFriendsOnlyRecipients(recipientIds: string[]): Promise<Set<string>> {
  if (recipientIds.length === 0) return new Set();
  try {
    const db = getDb();
    const rows = await db
      .select({ userId: notificationPreferences.userId })
      .from(notificationPreferences)
      .where(
        and(
          inArray(notificationPreferences.userId, recipientIds),
          eq(notificationPreferences.followedPostsFriendsOnly, true)
        )
      );
    return new Set(rows.map((row) => row.userId));
  } catch (error) {
    console.error("getFriendsOnlyRecipients failed:", error);
    return new Set();
  }
}

/** Mute one person on one channel (or every channel with "ALL"). */
export async function muteActor({
  userId,
  mutedUserId,
  channel,
}: {
  userId: string;
  mutedUserId: string;
  channel: MuteChannel;
}): Promise<void> {
  if (userId === mutedUserId) return;
  const db = getDb();
  await db.insert(notificationMutes).values({ userId, mutedUserId, channel }).onConflictDoNothing();
}

/** Lift a mute. Passing "ALL" clears every channel this student muted for that actor. */
export async function unmuteActor({
  userId,
  mutedUserId,
  channel,
}: {
  userId: string;
  mutedUserId: string;
  channel: MuteChannel;
}): Promise<void> {
  const db = getDb();
  const conditions = [eq(notificationMutes.userId, userId), eq(notificationMutes.mutedUserId, mutedUserId)];
  if (channel !== "ALL") {
    conditions.push(eq(notificationMutes.channel, channel));
  }
  await db.delete(notificationMutes).where(and(...conditions));
}

/** Every channel this student has muted for one actor. */
export async function getMutedChannelsFor(userId: string, actorId: string): Promise<MuteChannel[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({ channel: notificationMutes.channel })
      .from(notificationMutes)
      .where(and(eq(notificationMutes.userId, userId), eq(notificationMutes.mutedUserId, actorId)));
    return rows.map((row) => row.channel as MuteChannel);
  } catch (error) {
    console.error("getMutedChannelsFor failed:", error);
    return [];
  }
}
