"use client";

import { FeedPost } from "@/hooks/use-feed";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { Bookmark,Heart,MessageCircle,Repeat2,Share } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FeedCardActionsProps {
  post: FeedPost;
  userVote: number;
  votesCount: number;
  commentsCount?: number;
  onVote: () => void;
  onInstantRepost: () => void;
  onShare: () => void;
  onOpenComments?: () => void;
  onOpenLikes?: () => void;
}

export function FeedCardActions({
  post,
  userVote,
  votesCount,
  commentsCount,
  onVote,
  onInstantRepost,
  onShare,
  onOpenComments,
  onOpenLikes,
}: FeedCardActionsProps) {
  const [repostSpin, setRepostSpin] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const displayCommentsCount = commentsCount ?? post.commentsCount;

  function triggerRepostAnimation(e: React.MouseEvent) {
    e.stopPropagation();
    if (hasReposted) return;

    setRepostSpin(true);
    setHasReposted(true);
    sounds.tap();
    haptics.light();
    setTimeout(() => setRepostSpin(false), 320);
    onInstantRepost();
  }

  async function handleToggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const nextState = !isSaved;
    setIsSaved(nextState);
    sounds.pop();
    haptics.light();

    try {
      const res = await fetch(`/api/posts/${post.id}/save`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to update save status");
      if (nextState) {
        toast.success("Saved to campus vault 🔖");
      } else {
        toast.info("Removed from saved posts");
      }
    } catch {
      setIsSaved(!nextState);
      toast.error("Could not update bookmark");
    }
  }

  return (
    <div
      className="flex items-center justify-between max-w-md pt-1.5 text-muted-foreground select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Reply Action */}
      <button
        type="button"
        onClick={onOpenComments}
        className="flex items-center gap-1.5 text-xs hover:text-[#1d9bf0] transition-colors group cursor-pointer"
        aria-label="Reply"
      >
        <div className="size-8 rounded-full group-hover:bg-[#1d9bf0]/10 flex items-center justify-center transition-colors">
          <MessageCircle className="size-4.5" />
        </div>
        {displayCommentsCount > 0 && (
          <span className="tabular-nums text-xs font-medium">{displayCommentsCount}</span>
        )}
      </button>

      {/* Repost Action */}
      <button
        type="button"
        onClick={triggerRepostAnimation}
        aria-pressed={hasReposted}
        className={cn(
          "flex items-center gap-1.5 text-xs transition-colors group cursor-pointer",
          hasReposted ? "text-emerald-500" : "hover:text-emerald-500"
        )}
        aria-label={hasReposted ? "Reposted" : "Repost"}
      >
        <div className="size-8 rounded-full group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
          <Repeat2
            className={cn(
              "size-4.5 transition-transform duration-300 ease-out",
              repostSpin && "rotate-180 scale-115",
              hasReposted && "text-emerald-500"
            )}
          />
        </div>
      </button>

      {/* Like / Heart Action */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onVote}
          className={cn(
            "size-8 rounded-full flex items-center justify-center transition-colors cursor-pointer group",
            userVote === 1 ? "text-rose-500 hover:bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
          )}
          aria-label="Like"
        >
          <Heart
            className={cn(
              "size-4.5 transition-transform group-hover:scale-110",
              userVote === 1 && "fill-rose-500 text-rose-500"
            )}
          />
        </button>
        {votesCount > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLikes?.();
            }}
            className={cn(
              "tabular-nums text-xs font-semibold px-1 py-0.5 rounded-md hover:underline cursor-pointer transition-colors",
              userVote === 1 ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
            )}
            title="View who liked this post"
          >
            {votesCount}
          </button>
        )}
      </div>

      {/* Save / Bookmark Action */}
      <button
        type="button"
        onClick={handleToggleSave}
        className={cn(
          "flex items-center gap-1.5 text-xs transition-colors group cursor-pointer",
          isSaved ? "text-amber-500" : "hover:text-amber-500"
        )}
        aria-label={isSaved ? "Saved" : "Save post"}
      >
        <div className="size-8 rounded-full group-hover:bg-amber-500/10 flex items-center justify-center transition-colors">
          <Bookmark
            className={cn(
              "size-4.5 transition-transform group-hover:scale-110",
              isSaved && "fill-amber-500 text-amber-500"
            )}
          />
        </div>
      </button>

      {/* Share Action */}
      <button
        type="button"
        onClick={onShare}
        className="flex items-center gap-1.5 text-xs hover:text-[#1d9bf0] transition-colors group cursor-pointer"
        aria-label="Share"
      >
        <div className="size-8 rounded-full group-hover:bg-[#1d9bf0]/10 flex items-center justify-center transition-colors">
          <Share className="size-4" />
        </div>
      </button>
    </div>
  );
}
