"use client";

import { useFeed } from "@/hooks/use-feed";
import { FeedCard } from "@/components/ui/feed-card";
import { Skeleton } from "@/components/ui/skeleton";

export function DiscoverFeed() {
  const { feed, isLoading } = useFeed("GLOBAL");

  return (
    <main className="mx-auto flex w-full max-w-md flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-background/80 px-4 py-4 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="text-sm text-muted-foreground">See what's happening on other campuses.</p>
      </header>

      <div className="flex flex-col px-4 pt-6 pb-10 gap-6">
        {isLoading ? (
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
            <p>No posts yet in global scope.</p>
          </div>
        )}
      </div>
    </main>
  );
}
