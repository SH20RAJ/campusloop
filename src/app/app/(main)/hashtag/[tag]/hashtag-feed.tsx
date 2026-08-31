"use client";

import { ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useFeed } from "@/hooks/use-feed";

export default function HashtagFeed() {
  const params = useParams();
  const rawTag = typeof params.tag === "string" ? params.tag : "";
  const tag = decodeURIComponent(rawTag).replace(/^#/, "");

  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  const {
    feed,
    isLoading: feedLoading,
    isLoadingMore,
    isReachingEnd,
    size,
    setSize,
  } = useFeed("GLOBAL", "ALL", "latest", "all", tag);

  useEffect(() => {
    if (!loadMoreRef || isReachingEnd || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, isReachingEnd, isLoadingMore, setSize]);

  return (
    <main className="min-h-screen bg-background text-foreground pb-28 mx-auto max-w-2xl select-none border-x border-border/20">
      {/* Twitter/X Style Minimal Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/30 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/app"
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            aria-label="Back to feed"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-black tracking-tight text-foreground truncate flex items-center gap-0.5">
              <span>#{tag}</span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium truncate">Campus Topic</p>
          </div>
        </div>

        <Link
          href={`/app/post/new?tag=${encodeURIComponent(tag)}`}
          className="h-8 px-3.5 rounded-full bg-foreground text-background hover:opacity-90 font-black text-xs transition-all flex items-center justify-center cursor-pointer shrink-0 shadow-2xs"
        >
          Post
        </Link>
      </header>

      {/* Feed List Container */}
      <div className="flex flex-col divide-y divide-border/20">
        {feedLoading && size === 1 ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll trigger */}
            {!isReachingEnd && (
              <div
                ref={setLoadMoreRef}
                className="flex items-center justify-center py-8 text-xs font-bold text-muted-foreground/80"
              >
                <span className="animate-pulse">Loading more #{tag} posts...</span>
              </div>
            )}

            {isReachingEnd && (
              <div className="text-center py-10 text-xs font-bold text-muted-foreground/60 select-none">
                You&apos;ve caught up on all posts for #{tag}! 🎉
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl p-6 border border-dashed border-border/80 bg-card/50 my-4">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40 mb-3 text-primary">
              <Hash className="size-6" />
            </div>
            <h3 className="font-bold text-foreground text-sm">#{tag} is quiet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4 leading-relaxed">
              No campus posts have used #{tag} yet. Be the first to start the trend!
            </p>
            <Link
              href={`/app/post/new?tag=${encodeURIComponent(tag)}`}
              className="mt-4 py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              Create first post for #{tag}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
