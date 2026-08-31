"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

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

const DEFAULTS: NotificationPreferenceSet = {
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

/**
 * Account-wide notification switches, optimistically toggled.
 *
 * The PATCH endpoint takes a partial body, so one switch is one field — two
 * tabs flipping different switches cannot overwrite each other.
 */
export function useNotificationPreferences() {
  const { data, isLoading, mutate } = useSWR<{ preferences: NotificationPreferenceSet }>(
    "/api/notifications/preferences",
    fetcher,
    { revalidateOnFocus: false }
  );

  const preferences = data?.preferences ?? DEFAULTS;

  const setPreference = useCallback(
    async (key: keyof NotificationPreferenceSet, value: boolean) => {
      const optimistic = { preferences: { ...preferences, [key]: value } };
      mutate(optimistic, false);

      try {
        const res = await fetch("/api/notifications/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [key]: value }),
        });
        if (!res.ok) throw new Error("Request failed");
        await mutate();
        return true;
      } catch (err) {
        console.warn("Failed to update notification preference:", err);
        // Snap the switch back rather than leaving it showing a setting that
        // was never saved.
        await mutate();
        return false;
      }
    },
    [preferences, mutate]
  );

  return { preferences, isLoading, setPreference };
}

export type MuteChannel =
  | "ALL"
  | "POST"
  | "MESSAGE"
  | "LIKE"
  | "COMMENT"
  | "MENTION"
  | "REPOST"
  | "FOLLOW"
  | "STORY"
  | "MATCH";

/**
 * Per-person mutes. `userId` is a profile id; pass null to skip fetching
 * entirely (the viewer's own profile, or a card whose author is anonymous).
 */
export function useUserMute(userId?: string | null) {
  const { data, isLoading, mutate } = useSWR<{ channels: MuteChannel[] }>(
    userId ? `/api/notifications/mute?userId=${encodeURIComponent(userId)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const channels = data?.channels ?? [];

  const isMuted = useCallback(
    (channel: MuteChannel) => channels.includes("ALL") || channels.includes(channel),
    [channels]
  );

  const setMuted = useCallback(
    async (channel: MuteChannel, muted: boolean) => {
      if (!userId) return false;

      try {
        const res = await fetch("/api/notifications/mute", {
          method: muted ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, channel }),
        });
        if (!res.ok) throw new Error("Request failed");
        const next = (await res.json()) as { channels: MuteChannel[] };
        await mutate({ channels: next.channels }, false);
        return true;
      } catch (err) {
        console.warn("Failed to update mute:", err);
        await mutate();
        return false;
      }
    },
    [userId, mutate]
  );

  return { channels, isMuted, isLoading, setMuted };
}
