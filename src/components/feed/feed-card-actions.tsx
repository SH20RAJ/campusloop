"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { FeedPost } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";
import { Heart,MessageCircle,Repeat2,Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FeedCardActionsProps {
  post: FeedPost;
  userVote: number;
  votesCount: number;
  commentsCount?: number;
  onVote: () => void;
  onInstantRepost: () => void;
  onShare: () => void;
  onOpenComments?: () => void;
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
}: FeedCardActionsProps) {
  const [repostSpin, setRepostSpin] = useState(false);
  const displayCommentsCount = commentsCount ?? post.commentsCount;

  function triggerRepostAnimation() {
    setRepostSpin(true);
    setTimeout(() => setRepostSpin(false), 600);
    onInstantRepost();
  }

  return (
    <div className="flex items-center justify-between px-3 sm:px-5 py-1.5 text-muted-foreground select-none touch-manipulation">
      {/* Upvote Button (Triangle / Heart with Count) */}
      <button
        onClick={onVote}
        className={cn(
          "flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 group cursor-pointer",
          userVote === 1
            ? "text-rose-500 bg-rose-500/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        aria-label="Upvote post"
      >
        <AnimateIcon animateOnHover animation="path">
          <Heart
            className={cn(
              "size-4.5 transition-all duration-300 group-hover:scale-110",
              userVote === 1 && "fill-rose-500 text-rose-500"
            )}
          />
        </AnimateIcon>
        <span className="tabular-nums font-bold text-xs">{votesCount}</span>
      </button>

      {/* Comment Button with Count (Opens Fast Comments Modal or Link fallback) */}
      {onOpenComments ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments();
          }}
          className="flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all active:scale-95 group cursor-pointer"
          aria-label="Comments"
        >
          <AnimateIcon animateOnHover animation="path">
            <MessageCircle className="size-4.5 transition-transform group-hover:scale-110" />
          </AnimateIcon>
          <span className="tabular-nums font-bold text-xs">{displayCommentsCount}</span>
        </button>
      ) : (
        <Link
          href={`/app/post/${post.id}`}
          className="flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all active:scale-95 group cursor-pointer"
          aria-label="Comments"
        >
          <AnimateIcon animateOnHover animation="path">
            <MessageCircle className="size-4.5 transition-transform group-hover:scale-110" />
          </AnimateIcon>
          <span className="tabular-nums font-bold text-xs">{displayCommentsCount}</span>
        </Link>
      )}


      {/* Repost Button */}
      <button
        onClick={triggerRepostAnimation}
        className="flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-95 group cursor-pointer"
        title="Instant Repost to Campus Feed"
      >
        <Repeat2
          className={cn(
            "size-4.5 transition-all duration-500 group-hover:scale-110",
            repostSpin && "rotate-360 text-emerald-500 scale-125"
          )}
        />
        <span className="text-xs font-bold hidden sm:inline">Repost</span>
      </button>

      {/* Share Button */}
      <button
        onClick={onShare}
        className="flex min-h-[44px] items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95 group cursor-pointer"
        aria-label="Share post"
      >
        <AnimateIcon animateOnHover animation="path">
          <Share2 className="size-4.5 transition-transform group-hover:scale-110" />
        </AnimateIcon>
        <span className="text-xs font-bold hidden sm:inline">Share</span>
      </button>
    </div>
  );
}
