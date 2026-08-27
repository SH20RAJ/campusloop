"use client";

import { apiRequest } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { Loader2,UserCheck,UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FollowButtonProps {
  username: string;
  displayName?: string;
  initialIsFollowing: boolean;
  size?: "sm" | "md";
  className?: string;
  onChange?: (isFollowing: boolean, counts?: { followersCount: number; followingCount: number }) => void;
}

interface FollowResponse {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export function FollowButton({
  username,
  displayName,
  initialIsFollowing,
  size = "md",
  className,
  onChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  async function toggleFollow() {
    if (isPending) return;

    const next = !isFollowing;
    // Optimistic flip — reverted below if the request fails.
    setIsFollowing(next);
    setIsPending(true);
    onChange?.(next);
    haptics.light();
    if (next) sounds.tap();

    try {
      const data = await apiRequest<FollowResponse>(
        `/api/profile/${encodeURIComponent(username)}/follow`,
        next ? "POST" : "DELETE",
      );
      setIsFollowing(data.isFollowing);
      onChange?.(data.isFollowing, {
        followersCount: data.followersCount,
        followingCount: data.followingCount,
      });
    } catch (err) {
      setIsFollowing(!next);
      onChange?.(!next);
      toast.error(
        err instanceof Error
          ? err.message
          : `Could not ${next ? "follow" : "unfollow"} ${displayName || `@${username}`}`,
      );
    } finally {
      setIsPending(false);
    }
  }

  const label = isFollowing ? (isHovering ? "Unfollow" : "Following") : "Follow";

  return (
    <button
      type="button"
      onClick={toggleFollow}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isPending}
      aria-pressed={isFollowing}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-bold shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-wait",
        size === "sm" ? "h-8 px-3.5 text-[11px]" : "h-9 px-4 text-xs",
        isFollowing
          ? "border border-border bg-card text-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="size-3.5" />
      ) : (
        <UserPlus className="size-3.5" />
      )}
      <span>{label}</span>
    </button>
  );
}
