"use client";

import { useFeed, useStories } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { StoryRing } from "@/components/ui/story-ring";
import { Skeleton } from "@/components/ui/skeleton";

export function CampusFeed() {
  const { feed, isLoading: feedLoading } = useFeed();
  const { stories, isLoading: storiesLoading } = useStories();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col min-h-screen">
      {/* Header Area */}
      <header className="sticky top-0 z-40 bg-background/80 px-4 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight">CampusLoop</h1>
      </header>

      {/* Stories Ring */}
      <div className="w-full">
        {storiesLoading ? (
          <div className="flex gap-4 px-4 py-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-full" />
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <StoryRing users={stories} />
        ) : null}
      </div>

      {/* Main Feed */}
      <div className="flex flex-col px-4 pt-2 pb-10 gap-6">
        {feedLoading ? (
          <>
            <Skeleton className="h-[400px] w-full rounded-[32px]" />
            <Skeleton className="h-[400px] w-full rounded-[32px]" />
          </>
        ) : feed && feed.length > 0 ? (
          feed.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center opacity-50">
            <p>No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </main>
  );
}
