"use client";

import { Bell, BellOff, Check, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type MuteChannel, useUserMute } from "@/hooks/use-notification-preferences";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface MuteOption {
  channel: MuteChannel;
  label: string;
  hint: string;
  icon: typeof Bell;
}

/**
 * The channels worth muting for one specific person. Deliberately short — a
 * long list turns a two-second decision into a form.
 */
const OPTIONS: MuteOption[] = [
  {
    channel: "POST",
    label: "Their posts",
    hint: "Stop post alerts, keep them in your feed",
    icon: Sparkles,
  },
  {
    channel: "MESSAGE",
    label: "Their messages",
    hint: "Messages still arrive, just silently",
    icon: MessageCircle,
  },
  {
    channel: "ALL",
    label: "Everything",
    hint: "No notifications from this person at all",
    icon: BellOff,
  },
];

/**
 * Per-person notification mute, for a profile page or a feed card menu.
 *
 * Muting is notification-only and reversible: the muted person keeps their
 * place in the feed, keeps the ranking boost that following them earns, and is
 * never told. It is the quiet middle ground between following someone and
 * unfollowing them.
 */
export function MuteUserButton({
  userId,
  displayName,
  className,
}: {
  userId: string;
  displayName?: string;
  className?: string;
}) {
  const { isMuted, isLoading, setMuted } = useUserMute(userId);
  const [pending, setPending] = useState<MuteChannel | null>(null);

  const name = displayName || "this student";

  async function toggle(channel: MuteChannel) {
    const next = !isMuted(channel);
    setPending(channel);
    sounds.tap();
    haptics.light();

    const ok = await setMuted(channel, next);
    setPending(null);

    if (!ok) {
      haptics.error();
      toast.error("Could not update that mute. Please try again.");
      return;
    }

    haptics.success();
    toast.success(
      next
        ? channel === "ALL"
          ? `Muted all notifications from ${name}`
          : `Muted ${channel === "POST" ? "post" : "message"} alerts from ${name}`
        : `Unmuted ${name}`
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {OPTIONS.map((option) => {
        // "ALL" already covers the narrower channels, so showing them as
        // individually off would misrepresent what unmuting one would do.
        const coveredByAll = option.channel !== "ALL" && isMuted("ALL");
        const active = isMuted(option.channel);
        const Icon = option.icon;
        const busy = pending === option.channel;

        return (
          <button
            key={option.channel}
            type="button"
            role="switch"
            aria-checked={active}
            disabled={isLoading || busy || coveredByAll}
            onClick={() => toggle(option.channel)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all shadow-2xs",
              active
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-border/60 bg-background/50 hover:border-border",
              coveredByAll || isLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer active:scale-[0.99]"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-xl",
                active ? "bg-amber-500/20 text-amber-500" : "bg-muted/50 text-muted-foreground"
              )}
            >
              <Icon className="size-3.5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-foreground">{option.label}</span>
              <span className="block text-[11px] text-muted-foreground truncate">
                {coveredByAll ? "Covered by “Everything”" : option.hint}
              </span>
            </span>

            {busy ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : active ? (
              <Check className="size-4 shrink-0 text-amber-500" />
            ) : (
              <Bell className="size-4 shrink-0 text-muted-foreground/50" />
            )}
          </button>
        );
      })}
    </div>
  );
}
