"use client";

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
 * Browser push subscription lifecycle.
 *
 * Deliberately never prompts on mount — an unprompted permission dialog is
 * the fastest way to get permanently denied. The caller decides when to ask,
 * off an explicit user action.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission as PushPermission);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(Boolean(sub)))
      .catch(() => setIsSubscribed(false));
  }, []);

  const subscribe = useCallback(async () => {
    if (permission === "unsupported") {
      toast.error("This browser can't do push notifications");
      return false;
    }
    if (!vapidPublicKey) {
      toast.error("Push isn't configured yet — missing VAPID key");
      return false;
    }

    setIsBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);

      if (result !== "granted") {
        toast.info(
          result === "denied"
            ? "Notifications blocked — you can re-enable them in browser settings"
            : "Notifications not enabled",
        );
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) throw new Error("Could not register this device");

      setIsSubscribed(true);
      toast.success("Push notifications on — we'll ping you about campus activity");
      return true;
    } catch (err) {
      console.error("Push subscribe failed:", err);
      toast.error(err instanceof Error ? err.message : "Could not enable notifications");
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [permission, vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    setIsBusy(true);
    try {
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

      setIsSubscribed(false);
      toast.success("Push notifications turned off");
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
    isSupported: permission !== "unsupported",
    isConfigured: Boolean(vapidPublicKey),
    subscribe,
    unsubscribe,
  };
}
