"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { useCallback,useEffect,useState } from "react";
import { toast } from "sonner";

export type PushPermission = "unsupported" | "default" | "granted" | "denied";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

/**
 * Trigger a native browser or PWA system notification.
 * Works across desktop Chrome/Edge/Safari/Firefox, Android Chrome, and iOS PWA.
 */
export async function triggerBrowserNotification(title: string, options?: {
  body?: string;
  url?: string;
  tag?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const body = options?.body || "You have a new update on CampusLoop";
  const url = options?.url || "/app/notifications";
  const tag = options?.tag || "campusloop-alert";

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/logo.png",
          badge: "/icons/icon-192x192.png",
          tag,
          renotify: true,
          data: { url },
        } as any);
        return;
      }
    }

    // Fallback to standard window Notification constructor
    new Notification(title, {
      body,
      icon: "/logo.png",
      tag,
      data: { url },
    });
  } catch (err) {
    console.warn("Could not dispatch browser notification:", err);
  }
}

/**
 * Comprehensive Browser & PWA Notification lifecycle hook.
 * Deliberately supports both standard browser notifications (zero VAPID setup required)
 * and optional WebPush subscription if NEXT_PUBLIC_VAPID_PUBLIC_KEY is provided.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermission);
    if (Notification.permission === "granted") {
      setIsSubscribed(true);
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setIsSubscribed(true);
        })
        .catch(() => {});
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return false;
    }

    setIsBusy(true);
    sounds.tap();
    haptics.light();

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);

      if (result !== "granted") {
        toast.info(
          result === "denied"
            ? "Notifications are blocked. Please enable them in your browser site settings."
            : "Notification permission was not granted.",
        );
        setIsSubscribed(false);
        return false;
      }

      setIsSubscribed(true);
      sounds.ting();
      haptics.success();
      toast.success("Campus notifications active! You'll receive instant alerts.");

      // If VAPID is configured, register WebPush background subscription
      if (vapidPublicKey && "serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existing = await registration.pushManager.getSubscription();
          const subscription =
            existing ||
            (await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            }));

          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        } catch (pushErr) {
          console.warn("Optional WebPush subscription failed (browser notifications remain active):", pushErr);
        }
      }

      // Trigger a celebratory welcome notification
      await triggerBrowserNotification("CampusLoop Notifications Enabled! 🎉", {
        body: "You'll now receive alerts for campus replies, secret crushes, and direct chats.",
        url: "/app/notifications",
      });

      return true;
    } catch (err) {
      console.error("Push subscribe failed:", err);
      toast.error("Could not enable notifications. Check browser permissions.");
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [vapidPublicKey]);

  const sendTestNotification = useCallback(async () => {
    if (permission !== "granted") {
      await subscribe();
      return;
    }

    sounds.ting();
    haptics.success();
    await triggerBrowserNotification("CampusLoop: New Notification 🔔", {
      body: "Test ping: Your browser notifications and PWA alerts are working perfectly!",
      url: "/app/notifications",
    });
    toast.success("Test notification sent! Check your system banner.");
  }, [permission, subscribe]);

  const unsubscribe = useCallback(async () => {
    setIsBusy(true);
    sounds.tap();
    try {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          }).catch(() => {});
          await subscription.unsubscribe();
        }
      }

      setIsSubscribed(false);
      toast.success("Notifications muted");
      return true;
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      toast.error("Could not turn off notifications");
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isBusy,
    isSupported: typeof window !== "undefined" && "Notification" in window,
    isConfigured: true,
    subscribe,
    sendTestNotification,
    unsubscribe,
  };
}
