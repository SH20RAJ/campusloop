"use client";

import { usePushNotifications } from "@/hooks/use-push-notifications";
import { cn } from "@/lib/utils";
import { Bell,BellOff,BellRing,Loader2 } from "lucide-react";

/**
 * Push opt-in. Two shapes: a dismissible "banner" for the notification
 * center, and a "row" for settings.
 */
export function PushNotificationToggle({ variant = "row" }: { variant?: "row" | "banner" }) {
  const { permission, isSubscribed, isBusy, isSupported, isConfigured, subscribe, unsubscribe } =
    usePushNotifications();

  // Nothing useful to offer if the browser or the deployment can't do push
  if (!isSupported || !isConfigured) return null;

  const blocked = permission === "denied";

  if (variant === "banner") {
    // Only worth interrupting for when they haven't decided yet
    if (isSubscribed || blocked) return null;

    return (
      <div className="mx-4 my-3 flex items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BellRing className="size-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground">Turn on push notifications</p>
            <p className="text-[11px] text-muted-foreground">
              Get pinged for replies, matches and follows — even with the tab closed
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={subscribe}
          disabled={isBusy}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-black text-primary-foreground shadow-2xs transition-all hover:bg-primary/95 active:scale-95 cursor-pointer disabled:opacity-60"
        >
          {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
          Enable
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
            isSubscribed ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground",
          )}
        >
          {isSubscribed ? <BellRing className="size-4.5" /> : <BellOff className="size-4.5" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-foreground">Push notifications</p>
          <p className="text-[11px] text-muted-foreground">
            {blocked
              ? "Blocked in your browser settings — re-allow them there to switch this on"
              : isSubscribed
              ? "On for this device"
              : "Off — replies, matches and follows won't reach you when you're away"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isBusy || blocked}
        className={cn(
          "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-black transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          isSubscribed
            ? "border border-border bg-card text-foreground hover:bg-muted"
            : "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/95",
        )}
      >
        {isBusy && <Loader2 className="size-3.5 animate-spin" />}
        {isSubscribed ? "Turn off" : "Enable"}
      </button>
    </div>
  );
}
