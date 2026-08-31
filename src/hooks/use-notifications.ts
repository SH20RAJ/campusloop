"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type NotificationTab =
  | "all"
  | "messages"
  | "posts"
  | "mentions"
  | "replies"
  | "reactions"
  | "crushes"
  | "verified";

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | "LIKE"
    | "COMMENT"
    | "REPLY"
    | "MENTION"
    | "REPOST"
    | "MATCH"
    | "CRUSH_ALERT"
    | "MILESTONE"
    | "STORY_LIKE"
    | "STORY_REPLY"
    | "FOLLOW"
    | "FRIEND"
    | "MESSAGE"
    | "NEW_POST"
    | "EVENT_REGISTRATION";
  actorId: string;
  referenceId: string | null;
  previewText: string | null;
  isRead: boolean;
  createdAt: string | Date;
  actor?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    points?: number | null;
    institutionId?: string | null;
    role?: string | null;
    institution?: {
      name: string;
      slug?: string | null;
    } | null;
  } | null;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

import { useEffect, useRef } from "react";
import { triggerBrowserNotification } from "@/hooks/use-push-notifications";

export function useNotifications(tab: NotificationTab = "all") {
  const lastTopIdRef = useRef<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    `/api/notifications?tab=${tab}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      keepPreviousData: true,
      dedupingInterval: 4000,
    }
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(() => {});
      } else if ("clearAppBadge" in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }

    if (data?.notifications && data.notifications.length > 0) {
      const top = data.notifications[0];
      if (lastTopIdRef.current && lastTopIdRef.current !== top.id && !top.isRead) {
        if (typeof document !== "undefined" && document.visibilityState === "hidden") {
          const actorName = top.actor?.displayName || "A classmate";
          triggerBrowserNotification(`CampusLoop: ${actorName}`, {
            body: top.previewText || "Sent you a new campus notification",
            url: "/app/notifications",
          });
        }
      }
      lastTopIdRef.current = top.id;
    }
  }, [data, unreadCount]);

  async function markAllAsRead() {
    // Optimistically mark all as read
    mutate((prev) => {
      if (!prev) return prev;
      return {
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      };
    }, false);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      mutate();
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
      mutate();
    }
  }

  async function markAsRead(id: string) {
    mutate((prev) => {
      if (!prev) return prev;
      return {
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      };
    }, false);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }

  /**
   * Permanently removes notifications. `scope: "all"` clears the current tab
   * (matching what the student can see); `scope: "read"` keeps unread ones.
   */
  async function clearAll(scope: "all" | "read" = "all") {
    const previous = data;

    mutate((prev) => {
      if (!prev) return prev;
      if (scope === "read") {
        const remaining = prev.notifications.filter((n) => !n.isRead);
        return { notifications: remaining, unreadCount: remaining.length };
      }
      return { notifications: [], unreadCount: 0 };
    }, false);

    try {
      const res = await fetch(`/api/notifications?scope=${scope}&tab=${encodeURIComponent(tab)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Request failed");
      await mutate();
      return true;
    } catch (err) {
      console.warn("Failed to clear notifications:", err);
      // Put the list back rather than leaving the student staring at a false empty state.
      mutate(previous, false);
      return false;
    }
  }

  async function deleteOne(id: string) {
    const previous = data;

    mutate((prev) => {
      if (!prev) return prev;
      const target = prev.notifications.find((n) => n.id === id);
      return {
        notifications: prev.notifications.filter((n) => n.id !== id),
        unreadCount: target && !target.isRead ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      };
    }, false);

    try {
      const res = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Request failed");
      return true;
    } catch (err) {
      console.warn("Failed to delete notification:", err);
      mutate(previous, false);
      return false;
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    mutate,
    markAllAsRead,
    markAsRead,
    clearAll,
    deleteOne,
  };
}

export function useUnreadNotificationsCount() {
  const { data } = useSWR<{ unreadCount: number }>("/api/notifications/unread-count", fetcher, {
    refreshInterval: 25000,
    dedupingInterval: 8000,
  });

  return data?.unreadCount || 0;
}
