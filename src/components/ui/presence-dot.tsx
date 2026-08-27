"use client";

import { isOnline } from "@/lib/presence";
import { cn } from "@/lib/utils";

/**
 * Presence dot on an avatar. Renders nothing when the student is offline —
 * an always-on green dot tells the viewer nothing.
 */
export function PresenceDot({
  lastSeenAt,
  className,
}: {
  lastSeenAt?: Date | string | null;
  className?: string;
}) {
  if (!isOnline(lastSeenAt)) return null;

  return (
    <span
      title="Online now"
      aria-label="Online now"
      className={cn(
        "absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs",
        className,
      )}
    />
  );
}
