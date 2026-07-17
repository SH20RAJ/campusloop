"use client";

import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FeedSkeleton } from "@/components/ui/skeleton-card";

export default function HashtagFeedPage() {
  const params = useParams();
  const tag = typeof params.tag === "string" ? params.tag : "";
  
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
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, isReachingEnd, isLoadingMore, setSize]);

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 mx-auto max-w-2xl">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-4 flex items-center gap-3">
        <Link href="/app" className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 hover:bg-muted transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">#{tag}</h2>
          <p className="text-[10px] text-muted-foreground font-semibold">Campus discussion feed</p>
        </div>
      </div>

      {/* Main Feed List */}
      <div className="flex flex-col px-4 pt-4 gap-4.5">
        {feedLoading && size === 1 ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
            
            {/* Load more trigger anchor */}
            {!isReachingEnd && (
              <div 
                ref={setLoadMoreRef} 
                className="flex items-center justify-center py-8 text-xs font-bold text-muted-foreground/80"
              >
                <span className="animate-pulse">Loading more posts...</span>
              </div>
            )}

            {isReachingEnd && (
              <div className="text-center py-10 text-[11px] font-bold text-muted-foreground/50 select-none">
                You've looped through all posts for #{tag}! 🎉
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-card-dark rounded-3xl p-6 border border-border/40 my-4 mx-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">
              #{tag} is quiet
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs px-4 leading-relaxed">
              No posts have used the #{tag} hashtag yet. Be the first to start the trend!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
