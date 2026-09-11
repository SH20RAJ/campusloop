import { and, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/db";
import { externalMedia, externalPosts } from "@/db/schema";

/**
 * Checks if a Reddit post ID or canonical permalink already exists in CampusLoop.
 */
export async function isRedditPostDuplicate(redditId: string, permalink?: string): Promise<boolean> {
  const db = getDb();

  const conditions = [and(eq(externalPosts.source, "reddit"), eq(externalPosts.externalId, redditId))];

  if (permalink) {
    conditions.push(eq(externalPosts.permalink, permalink));
  }

  const existing = await db.query.externalPosts.findFirst({
    where: or(...conditions),
    columns: { id: true },
  });

  return Boolean(existing);
}

/**
 * Batch-checks multiple Reddit post IDs and returns a set of existing IDs.
 */
export async function batchFindExistingRedditIds(redditIds: string[]): Promise<Set<string>> {
  if (redditIds.length === 0) return new Set();

  const db = getDb();
  const rows = await db
    .select({ externalId: externalPosts.externalId })
    .from(externalPosts)
    .where(and(eq(externalPosts.source, "reddit"), inArray(externalPosts.externalId, redditIds)));

  return new Set(rows.map((r) => r.externalId));
}

/**
 * Checks if an external media URL is already associated with an ingested post.
 */
export async function isMediaUrlDuplicate(mediaUrl: string): Promise<boolean> {
  if (!mediaUrl) return false;
  const db = getDb();

  const existing = await db.query.externalMedia.findFirst({
    where: eq(externalMedia.mediaUrl, mediaUrl),
    columns: { id: true },
  });

  return Boolean(existing);
}
