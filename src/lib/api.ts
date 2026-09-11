/**
 * Centralized API client & SWR fetcher utilities for CampusLoop.
 */

export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error((errorData as { error?: string }).error || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiRequest<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `API error (${res.status})`);
  }

  return data as T;
}

// ─── Post API Actions ───

export function voteOnPost(postId: string, value: number) {
  return apiRequest<{ votesCount: number; userVote: number }>(`/api/posts/${postId}/vote`, "POST", { value });
}

export function savePost(postId: string, save: boolean = true) {
  return apiRequest<{ success: boolean; saved: boolean }>(
    `/api/posts/${postId}/save`,
    save ? "POST" : "DELETE"
  );
}

export function voteOnPoll(postId: string, optionId: string) {
  return apiRequest<{ options: Array<{ id: string; votesCount: number; userVoted: boolean }> }>(
    `/api/posts/${postId}/poll-vote`,
    "POST",
    { optionId }
  );
}

export function repostPost(postId: string, comment?: string) {
  return apiRequest<{ id: string }>(`/api/posts/${postId}/repost`, "POST", { comment });
}

export function deletePost(postId: string) {
  return apiRequest<{ success: boolean }>(`/api/posts/${postId}`, "DELETE");
}

export function updatePost(
  postId: string,
  data: { body: string; title?: string | null; scope?: "CAMPUS" | "GLOBAL" }
) {
  return apiRequest<{ success: boolean; message: string; post: unknown }>(
    `/api/posts/${postId}`,
    "PATCH",
    data
  );
}

export function reportPost(postId: string, reason: string, details?: string) {
  return apiRequest<{ success: boolean }>(`/api/posts/${postId}/report`, "POST", { reason, details });
}

export function createComment(postId: string, text: string) {
  return apiRequest<{ id: string; text: string; createdAt: string }>(
    `/api/posts/${postId}/comments`,
    "POST",
    { text }
  );
}

// ─── Profile API Actions ───

export function updateProfile(profileData: Record<string, unknown>) {
  return apiRequest<{ success: boolean }>("/api/profile/me", "PATCH", profileData);
}

export function toggleFollowUser(username: string, follow: boolean = true) {
  return apiRequest<{
    ok?: boolean;
    isFollowing: boolean;
    followerCount?: number;
    followingCount?: number;
  }>(`/api/profile/${encodeURIComponent(username)}/follow`, follow ? "POST" : "DELETE");
}

// ─── Story API Actions ───

export function createStory(text: string, backgroundColor: string) {
  return apiRequest<{ id: string }>("/api/stories", "POST", { text, backgroundColor });
}

// ─── Reels Telemetry & Behavior Actions ───

export interface ReelTelemetryPayload {
  postId: string;
  watchDurationMs: number;
  videoDurationMs?: number;
  loopCount: number;
  completed: boolean;
  skippedQuickly: boolean;
  action?: "like" | "save" | "share" | "comment" | "follow" | "loop" | "dwell" | "skip";
  tags?: string[];
  authorId?: string | null;
  institutionId?: string | null;
}

export function trackReelTelemetry(payload: ReelTelemetryPayload): Promise<{ ok: boolean }> {
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/reels/track", blob);
      if (sent) return Promise.resolve({ ok: true });
    } catch {
      // Fallback to fetch if sendBeacon fails
    }
  }
  return apiRequest<{ ok: boolean }>("/api/reels/track", "POST", payload).catch(() => ({ ok: false }));
}
