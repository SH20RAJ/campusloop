import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { follows } from "@/db/schema";
import { getFriendsOnlyRecipients } from "@/lib/notification-preferences";
import { cleanNotificationSnippet, createNotificationsForMany } from "@/lib/notifications";

/** Hard ceiling on one post's notification fan-out. */
const MAX_NEW_POST_AUDIENCE = 500;

/**
 * Tell a student's followers that they posted.
 *
 * Two invariants hold this together:
 *
 *  - **Anonymous posts never fan out.** A confession carries no author id and
 *    must not carry an actor id either; a "your friend just posted" ping next
 *    to an anonymous post would deanonymize it by correlation. Callers are
 *    expected to skip anonymous posts, and this guard makes that non-optional.
 *
 *  - **Friends outrank followers.** Mutual edges are notified first, so when a
 *    popular account exceeds the fan-out cap the people who lose the push are
 *    one-way followers rather than actual friends. Students who set
 *    `followedPostsFriendsOnly` drop out of the one-way half entirely.
 *
 * Never throws: publishing a post must not depend on notifying anyone.
 */
export async function notifyFollowersOfNewPost({
  postId,
  authorId,
  isAnonymous,
  title,
  body,
}: {
  postId: string;
  authorId: string | null;
  isAnonymous: boolean;
  title?: string | null;
  body: string;
}): Promise<number> {
  if (isAnonymous || !authorId) return 0;

  try {
    const db = getDb();

    // Newest edges first so a capped fan-out favours the most recent, most
    // active part of the graph. Both branches are served by
    // follows_following_created_idx.
    const edges = await db
      .select({ followerId: follows.followerId, isMutual: follows.isMutual })
      .from(follows)
      .where(eq(follows.followingId, authorId))
      .orderBy(desc(follows.isMutual), desc(follows.createdAt))
      .limit(MAX_NEW_POST_AUDIENCE * 2);

    if (edges.length === 0) return 0;

    const friendIds = edges.filter((edge) => edge.isMutual).map((edge) => edge.followerId);
    const followerIds = edges.filter((edge) => !edge.isMutual).map((edge) => edge.followerId);

    // Anyone who narrowed followed-post alerts to friends only is removed from
    // the one-way follower half.
    const friendsOnly = await getFriendsOnlyRecipients(followerIds);
    const audience = [...friendIds, ...followerIds.filter((id) => !friendsOnly.has(id))];

    if (audience.length === 0) return 0;

    return await createNotificationsForMany({
      recipientIds: audience,
      actorId: authorId,
      type: "NEW_POST",
      referenceId: postId,
      previewText: cleanNotificationSnippet(title ? `${title} — ${body}` : body, 100),
      maxRecipients: MAX_NEW_POST_AUDIENCE,
    });
  } catch (error) {
    console.error("notifyFollowersOfNewPost failed:", error);
    return 0;
  }
}

/**
 * Whether one student currently follows another — used by the post detail page
 * to decide whether to offer the "mute their posts" action at all.
 */
export async function viewerFollowsAuthor(viewerId: string, authorId: string): Promise<boolean> {
  if (viewerId === authorId) return false;
  try {
    const db = getDb();
    const edge = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, viewerId), eq(follows.followingId, authorId)),
      columns: { id: true },
    });
    return Boolean(edge);
  } catch {
    return false;
  }
}
