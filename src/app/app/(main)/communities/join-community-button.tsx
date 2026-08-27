"use client";

import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { Check,Loader2,Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { joinCommunity } from "./actions";

interface JoinButtonProps {
  communityId: string;
  initialIsMember: boolean;
  className?: string;
  /** Notified immediately on the optimistic flip, and again if it is rolled back. */
  onMembershipChange?: (isMember: boolean) => void;
}

export function JoinCommunityButton({
  communityId,
  initialIsMember,
  className,
  onMembershipChange,
}: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isPending, setIsPending] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  async function handleToggle() {
    if (isPending) return;

    const next = !isMember;
    // Flip first — the server call reconciles below.
    setIsMember(next);
    setIsPending(true);
    onMembershipChange?.(next);
    haptics.light();
    if (next) sounds.tap();

    try {
      const res = await joinCommunity(communityId);
      setIsMember(res.joined);
      if (res.joined !== next) onMembershipChange?.(res.joined);
      toast.success(res.joined ? "Joined community" : "Left community");
    } catch (e) {
      setIsMember(!next);
      onMembershipChange?.(!next);
      toast.error(e instanceof Error ? e.message : "Failed to update membership");
    } finally {
      setIsPending(false);
    }
  }

  const label = isMember ? (isHovering ? "Leave" : "Joined") : "Join";

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isPending}
      aria-pressed={isMember}
      className={cn(
        "h-8 px-4 text-xs font-bold rounded-full transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-1.5 active:scale-95",
        isMember
          ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5"
          : "bg-foreground text-background hover:opacity-90 shadow-2xs",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin" />
      ) : isMember ? (
        <Check className="size-3" />
      ) : (
        <Plus className="size-3" />
      )}
      <span>{label}</span>
    </button>
  );
}
