"use client";

const SEEN_POSTS_STORAGE_KEY = "campusloop_seen_post_ids";
const MAX_SEEN_IDS = 150;

/**
 * Get list of recently seen post IDs from localStorage/sessionStorage
 */
export function getSeenPostIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(SEEN_POSTS_STORAGE_KEY) || sessionStorage.getItem(SEEN_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(-MAX_SEEN_IDS) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a single or multiple post IDs as seen by the user
 */
export function markPostsAsSeen(postIds: string | string[]): void {
  if (typeof window === "undefined") return;
  try {
    const idsToAdd = Array.isArray(postIds) ? postIds : [postIds];
    if (idsToAdd.length === 0) return;

    const current = getSeenPostIds();
    const set = new Set([...current, ...idsToAdd]);
    const trimmed = Array.from(set).slice(-MAX_SEEN_IDS);

    localStorage.setItem(SEEN_POSTS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota or disabled errors
  }
}
