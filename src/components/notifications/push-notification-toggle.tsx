"use client";

import { Bell, BellOff, BellRing, Check, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { cn } from "@/lib/utils";

/**
 * Modern Push & Browser Notification opt-in.
 * Supports a high-visibility dismissible "banner" in /app/notifications
 * and an interactive "row" in settings.
 */
export function PushNotificationToggle({ variant = "row" }: { variant?: "row" | "banner" }) {
  const { permission, isSubscribed, isBusy, isSupported, subscribe, sendTestNotification, unsubscribe } =
    usePushNotifications();

  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || dismissed) return null;

  const blocked = permission === "denied";

  if (variant === "banner") {
    // If subscribed, show a sleek pill that allows sending a test ping
    if (isSubscribed) {
      return (
        <div className="mx-4 my-2.5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <BellRing className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black text-foreground flex items-center gap-1.5">
                <span>Browser alerts active</span>
                <Check className="size-3 text-emerald-500" />
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Instant pings for campus replies, crushes, and chats
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={sendTestNotification}
            className="flex h-7 shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-background px-3 text-[11px] font-bold text-foreground hover:bg-muted transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Send test browser notification"
          >
            <Send className="size-3 text-emerald-500" />
            <span>Test Ping</span>
          </button>
        </div>
      );
    }

    if (blocked) {
      return (
        <div className="mx-4 my-2.5 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <BellOff className="size-3.5" />
            </span>
            <p className="text-xs text-muted-foreground">
              Notifications blocked by your browser. Unblock in site settings to receive campus alerts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2"
          >
            Dismiss
          </button>
        </div>
      );
    }

    return (
      <div className="mx-4 my-3 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 shadow-xs">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BellRing className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground">Turn on campus alerts</p>
            <p className="text-[11px] text-muted-foreground">
              Get notified for new replies, matches, and chats — even when the tab is backgrounded
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={subscribe}
          disabled={isBusy}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground shadow-sm transition-all hover:bg-primary/95 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
          <span>Enable</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            isSubscribed ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
          )}
        >
          {isSubscribed ? <BellRing className="size-4.5" /> : <BellOff className="size-4.5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-foreground">Push &amp; Browser Notifications</p>
          <p className="text-[11px] text-muted-foreground">
            {blocked
              ? "Blocked in your browser settings — re-allow them there to switch this on"
              : isSubscribed
                ? "Active for this device. Tap test ping to verify."
                : "Off — campus replies, matches, and chats won't alert your screen"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSubscribed && (
          <button
            type="button"
            onClick={sendTestNotification}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold text-foreground hover:bg-muted transition-all active:scale-95 cursor-pointer"
          >
            <Send className="size-3 text-primary" />
            <span>Test</span>
          </button>
        )}
        <button
          type="button"
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isBusy || blocked}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-black transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            isSubscribed
              ? "border border-border bg-card text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/95"
          )}
        >
          {isBusy && <Loader2 className="size-3.5 animate-spin" />}
          {isSubscribed ? "Turn off" : "Enable"}
        </button>
      </div>
    </div>
  );
}
