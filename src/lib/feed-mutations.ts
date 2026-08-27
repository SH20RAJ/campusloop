/**
 * Feed Mutations & Optimistic Update Helpers
 * Provides atomic optimistic post prepending, server confirmation, and cache synchronization
 * across all active SWR feed queries.
 */
import { FeedPost } from "@/hooks/use-feed";
import { mutate } from "swr";

// In-memory feed cache shared across mounts
export const feedPagesCache = new Map<string, FeedPost[][]>();
export const feedSizeCache = new Map<string, number>();

/**
 * Posts published in this session that may not be visible to the feed API yet.
 *
 * optimisticAddPost can only patch feed caches that already exist, so a post
 * created from a cold start (opening the composer directly, then landing on
 * /app) would fetch a fresh first page that races the insert and lose the new
 * post. useFeed merges this buffer into page 0 so a just-published post is
 * always on top, whichever route the author came from.
 */
const PENDING_TTL_MS = 90_000;
const pendingPosts = new Map<string, { post: FeedPost; addedAt: number }>();

function prunePending() {
  const now = Date.now();
  for (const [id, entry] of pendingPosts.entries()) {
    if (now - entry.addedAt > PENDING_TTL_MS) pendingPosts.delete(id);
  }
}

/** Recently published posts, newest first, for merging into the top of a feed page. */
export function getPendingFeedPosts(): FeedPost[] {
  prunePending();
  return Array.from(pendingPosts.values())
    .sort((a, b) => b.addedAt - a.addedAt)
    .map((entry) => entry.post);
}

export function clearPendingFeedPost(id: string) {
  pendingPosts.delete(id);
}

/**
 * Optimistically prepends a new post to the top of all active /api/feed SWR caches
 */
export function optimisticAddPost(newPost: FeedPost) {
  // 0. Remember it independently of any cache key, so a feed mounting fresh
  //    right after publishing still shows it on top.
  prunePending();
  pendingPosts.set(newPost.id, { post: newPost, addedAt: Date.now() });

  // 1. Update in-memory caches
  for (const [key, pages] of feedPagesCache.entries()) {
    if (pages && pages.length > 0) {
      const [firstPage, ...restPages] = pages;
      feedPagesCache.set(key, [[newPost, ...firstPage.filter((p) => p.id !== newPost.id)], ...restPages]);
    } else {
      feedPagesCache.set(key, [[newPost]]);
    }
  }

  // 2. Mutate active SWR cache keys matching /api/feed
  mutate(
    (key) => typeof key === "string" && key.includes("/api/feed"),
    (currentPages: FeedPost[][] | undefined) => {
      if (!currentPages || currentPages.length === 0) {
        return [[newPost]];
      }
      const [firstPage, ...restPages] = currentPages;
      return [[newPost, ...firstPage.filter((p) => p.id !== newPost.id)], ...restPages];
    },
    false // don't revalidate immediately to keep optimistic UI intact
  );
}

/**
 * Replaces a temporary optimistic post with the confirmed server post
 */
export function confirmOptimisticPost(tempId: string, realPost: FeedPost) {
  // Swap the temp entry for the server-backed one, keeping it pending so it
  // survives the next feed fetch while replication catches up.
  const existing = pendingPosts.get(tempId);
  pendingPosts.delete(tempId);
  pendingPosts.set(realPost.id, { post: realPost, addedAt: existing?.addedAt ?? Date.now() });

  for (const [key, pages] of feedPagesCache.entries()) {
    if (pages) {
      feedPagesCache.set(
        key,
        pages.map((page) => page.map((p) => (p.id === tempId ? realPost : p)))
      );
    }
  }

  mutate(
    (key) => typeof key === "string" && key.includes("/api/feed"),
    (currentPages: FeedPost[][] | undefined) => {
      if (!currentPages) return currentPages;
      return currentPages.map((page) => page.map((p) => (p.id === tempId ? realPost : p)));
    },
    false
  );
}

/**
 * Reverts a temporary optimistic post if the network request fails
 */
export function revertOptimisticPost(tempId: string) {
  pendingPosts.delete(tempId);

  for (const [key, pages] of feedPagesCache.entries()) {
    if (pages) {
      feedPagesCache.set(
        key,
        pages.map((page) => page.filter((p) => p.id !== tempId))
      );
    }
  }

  mutate(
    (key) => typeof key === "string" && key.includes("/api/feed"),
    (currentPages: FeedPost[][] | undefined) => {
      if (!currentPages) return currentPages;
      return currentPages.map((page) => page.filter((p) => p.id !== tempId));
    },
    false
  );
}
