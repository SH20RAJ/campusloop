"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedPost } from "@/hooks/use-feed";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

interface FeedCardActionsProps {
  post: FeedPost;
  userVote: number;
  votesCount: number;
  onVote: () => void;
  onInstantRepost: () => void;
  onShare: () => void;
}

export function FeedCardActions({
  post,
  userVote,
  votesCount,
  onVote,
  onInstantRepost,
  onShare,
}: FeedCardActionsProps) {
  const [repostSpin, setRepostSpin] = useState(false);

  function triggerRepostAnimation() {
    setRepostSpin(true);
    setTimeout(() => setRepostSpin(false), 600);
    onInstantRepost();
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 text-muted-foreground">
      {/* Upvote Button */}
      <button
        onClick={onVote}
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold hover:text-rose-500 transition-colors group cursor-pointer",
          userVote === 1 && "text-rose-500"
        )}
        aria-label="Upvote post"
      >
        <AnimateIcon animateOnHover animation="path">
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-300 group-hover:scale-110",
              userVote === 1 && "fill-rose-500 text-rose-500 scale-110"
            )}
          />
        </AnimateIcon>
        <span className="tabular-nums">{votesCount}</span>
      </button>

      {/* Comment Link */}
      <Link
        href={`/app/post/${post.id}`}
        className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors group cursor-pointer"
        aria-label="Comments"
      >
        <AnimateIcon animateOnHover animation="path">
          <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
        </AnimateIcon>
        <span className="tabular-nums">{post.commentsCount}</span>
      </Link>

      {/* Instant 1-Tap Repost Button */}
      <button
        onClick={triggerRepostAnimation}
        className="flex items-center gap-1.5 text-xs font-semibold hover:text-emerald-500 transition-colors group cursor-pointer"
        title="Instant Repost to Feed"
      >
        <Repeat2
          className={cn(
            "h-4 w-4 transition-all duration-500 group-hover:scale-110 text-muted-foreground group-hover:text-emerald-500",
            repostSpin && "rotate-360 text-emerald-500 scale-125"
          )}
        />
        <span className="text-[10px] hidden sm:inline group-hover:text-emerald-500">Repost</span>
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors group cursor-pointer"
        aria-label="Share post"
      >
        <AnimateIcon animateOnHover animation="path">
          <Share2 className="h-4 w-4 transition-transform group-hover:scale-110" />
        </AnimateIcon>
        <span className="text-[10px] hidden sm:inline">Share</span>
      </button>
    </div>
  );
}
