"use client";

import { BellOff, BellRing } from "lucide-react";
import { useState } from "react";
import { MuteUserButton } from "@/components/notifications/mute-user-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUserMute } from "@/hooks/use-notification-preferences";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

/**
 * Bell control for a profile header: shows at a glance whether this person is
 * muted, and opens the per-channel mute sheet.
 */
export function MuteUserMenu({
  userId,
  displayName,
  className,
}: {
  userId: string;
  displayName?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  // Fetched on mount, not on open: the bell has to render its muted state
  // before anyone clicks it.
  const { channels } = useUserMute(userId);
  const anyMuted = channels.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          sounds.tap();
          haptics.light();
          setOpen(true);
        }}
        aria-label={`Notification settings for ${displayName || "this student"}`}
        title="Notification settings"
        className={cn(
          "h-9 w-9 shrink-0 rounded-full border bg-card flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer",
          anyMuted
            ? "border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
            : "border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground",
          className
        )}
      >
        {anyMuted ? <BellOff className="size-3.5" /> : <BellRing className="size-3.5" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-foreground">
                Notifications from {displayName || "this student"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Muting is private and reversible. They are never told, their posts stay in your feed, and you
                stay following them.
              </p>
            </div>

            <MuteUserButton userId={userId} displayName={displayName} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
