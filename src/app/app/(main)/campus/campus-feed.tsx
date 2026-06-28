"use client";

import { useFeed, useStories } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { StoryRing } from "@/components/ui/story-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame } from "lucide-react";

export function CampusFeed() {
  const { feed, isLoading: feedLoading } = useFeed();
  const { stories, isLoading: storiesLoading } = useStories();

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen">
      {/* Header Area */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-4 backdrop-blur-xl border-b border-border flex items-center gap-2">
        <Flame className="h-5 w-5 text-primary animate-pulse" />
        <h1 className="text-xl font-bold tracking-tight">Campus Feed</h1>
      </header>

      {/* Stories Ring */}
      <div className="w-full">
        {storiesLoading ? (
          <div className="flex gap-4 px-4 py-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-14 rounded-full" />
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <StoryRing users={stories} />
        ) : null}
      </div>

      {/* Main Feed */}
      <div className="flex flex-col px-4 pt-4 pb-16 gap-6">
        {feedLoading ? (
          <>
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </>
        ) : feed && feed.length > 0 ? (
          feed.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-card p-6">
            <h3 className="font-semibold text-foreground text-sm">Quiet in here...</h3>
            <p className="text-xs text-muted-foreground mt-1">Be the first to post something in your college community!</p>
          </div>
        )}
      </div>
    </main>
  );
}
