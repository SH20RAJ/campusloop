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
 * Optimistically prepends a new post to the top of all active /api/feed SWR caches
 */
export function optimisticAddPost(newPost: FeedPost) {
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
