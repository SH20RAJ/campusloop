"use client";

import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { ArrowLeft, Hash, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FeedSkeleton } from "@/components/ui/skeleton-card";

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
    <main className="min-h-screen bg-background text-foreground pb-24 mx-auto max-w-2xl select-none">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60 px-4 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app"
            className="flex size-8 items-center justify-center rounded-xl border border-border/80 bg-card hover:bg-muted transition-colors cursor-pointer shrink-0 shadow-xs"
            aria-label="Back to feed"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-black text-foreground flex items-center gap-1.5 truncate">
              <span className="text-primary">#</span>{tag}
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <TrendingUp className="size-3 text-rose-500" /> Campus Discussion Topic
            </p>
          </div>
        </div>

        <Link
          href={`/app/post/new?tag=${encodeURIComponent(tag)}`}
          className="py-1.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer shrink-0"
        >
          Post with #{tag}
        </Link>
      </div>

      {/* Feed List Container */}
      <div className="flex flex-col px-4 pt-4 gap-4">
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
