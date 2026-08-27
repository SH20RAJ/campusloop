"use client";

import {
AlertTriangle,RefreshCw,
Zap
} from "lucide-react";
import Link from "next/link";

export function FeedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center glass-card-dark rounded-3xl p-6 border border-border/40 my-4 mx-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 mb-4">
        <Zap className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">
        Your feed is quiet
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4 leading-relaxed">
        No posts matched your active filter settings. Try resetting filters or post something yourself!
      </p>
    </div>
  );
}

export function FeedCaughtUpCard() {
  return (
    <div className="space-y-4 pt-4 pb-10">
      <div className="rounded-2xl border border-border/70 bg-card p-5 text-center space-y-3 shadow-sm">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto">
          <Zap className="size-5" />
        </div>
        <h4 className="text-xs font-bold text-foreground">You&apos;ve caught up on all posts! 🎉</h4>
        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Want more campus activity? Explore 1,350+ Indian colleges or swipe on student dating profiles.
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Link
            href="/colleges"
            className="px-3.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            Campus Directory
          </Link>
          <Link
            href="/app/dating"
            className="px-3.5 py-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 text-pink-500 text-xs font-bold hover:bg-pink-500/20 transition-colors"
          >
            Dating Matches
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeedErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-destructive/30 bg-destructive/5 p-6 my-4 mx-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">Couldn&apos;t load your feed</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
        Something went wrong while fetching posts. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </button>
    </div>
  );
}
