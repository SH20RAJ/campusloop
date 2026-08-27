"use client";

import { FeedHeader } from "@/components/feed/feed-header";
import { FeedCaughtUpCard,FeedEmptyState,FeedErrorState } from "@/components/feed/feed-state-cards";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { FeedCard } from "@/components/ui/feed-card";
import {
InlineCommunitiesWidget,
InlineDatingWidget,
InlineHashtagsWidget,
InlineReferralWidget,
} from "@/components/ui/inline-feed-widgets";
import { FeedLoadingMoreSkeleton,FeedSkeleton } from "@/components/ui/skeleton-card";
import { StoryRing } from "@/components/ui/story-ring";

import { useFeed,useStories } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import { useEffect,useState } from "react";

export function FeedClient({ forcedType }: { forcedType?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Dashboard state synced with URL
  const initialScope = (searchParams.get("scope") as "CAMPUS" | "GLOBAL") || "GLOBAL";
  const [scope, setScopeState] = useState<"CAMPUS" | "GLOBAL">(initialScope);
  const initialType = forcedType || searchParams.get("type") || "ALL";
  const [type, setTypeState] = useState<string>(initialType);
  const sortParam = searchParams.get("sort") || "for_you";
  const [sort, setSortState] = useState<string>(sortParam);
  const [visibility, setVisibility] = useState<string>("all");

  useEffect(() => {
    if (forcedType) {
      setTypeState(forcedType);
      return;
    }
    const currentScope = searchParams.get("scope") as "CAMPUS" | "GLOBAL";
    if (currentScope && currentScope !== scope) {
      setScopeState(currentScope);
    }
    const currentSort = searchParams.get("sort");
    if (currentSort && currentSort !== sort) {
      setSortState(currentSort);
    }
    const currentType = searchParams.get("type");
    if (currentType && currentType !== type) {
      setTypeState(currentType);
    }
  }, [searchParams, scope, sort, type, forcedType]);

  function handleScopeChange(newScope: "CAMPUS" | "GLOBAL") {
    setScopeState(newScope);
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", newScope);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleTypeChange(newType: string) {
    setTypeState(newType);
    if (newType === "ALL") {
      router.push("/app");
    } else {
      router.push(`/app/posts/${newType}`);
    }
  }

  function handleSortChange(newSort: string) {
    setSortState(newSort);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const {
    feed,
    isLoading: feedLoading,
    isLoadingMore,
    isReachingEnd,
    isError,
    size,
    setSize,
    mutate,
  } = useFeed(scope, type, sort, visibility);

  const { stories, mutate: mutateStories, isLoading: storiesLoading } = useStories();
  const { profile } = useProfile();

  // Infinite scroll trigger ref and observer with 600px prefetch rootMargin
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef || isReachingEnd || isLoadingMore || isError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.05, rootMargin: "600px" }
    );

    observer.observe(loadMoreRef);
    return () => observer.disconnect();
  }, [loadMoreRef, isReachingEnd, isLoadingMore, isError, setSize]);

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen max-w-2xl bg-background text-foreground pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
      <FeedHeader
        scope={scope}
        onScopeChange={handleScopeChange}
        sort={sort}
        onSortChange={handleSortChange}
        type={type}
        onTypeChange={handleTypeChange}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        institutionSlug={profile?.institution?.slug}
      />

      {/* ─── Story Ring ─── */}
      <div className="w-full">
        {storiesLoading ? (
          <div className="flex gap-4 px-4 py-5 overflow-x-auto border-b border-border/40 bg-card/20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-14 w-14 rounded-full bg-muted/65 shimmer-effect" />
                <div className="h-2.5 w-10 bg-muted/65 rounded shimmer-effect" />
              </div>
            ))}
          </div>
        ) : (
          <StoryRing
            users={(stories || [])
              .filter((s) => s?.user)
              .map((s) => ({
                id: s.user.id,
                displayName: s.user.displayName,
                username: s.user.username,
                avatarUrl: s.user.avatarUrl,
                stories: s.stories,
              }))}
            mutateStories={mutateStories}
          />
        )}
      </div>

      {/* ─── Twitter-Style Top Composer Box ─── */}
      <div className="border-b border-border/30 px-4 py-3">
        <Link href="/app/post/new" className="flex gap-3 items-center">
          <Avatar className="size-10 rounded-full border border-border/40 shrink-0">
            <AvatarImage src={profile?.avatarUrl || ""} />
            <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
              {profile?.displayName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-[15px] text-muted-foreground/70 font-normal">
            What is happening on campus?!
          </div>
          <button
            type="button"
            className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-2xs"
          >
            Post
          </button>
        </Link>
      </div>

      {/* ─── Main Feed Stream (Twitter-Style Flat Timeline) ─── */}
      <div className="flex flex-col">
        {feedLoading && size === 1 ? (
          <FeedSkeleton />
        ) : isError ? (
          <FeedErrorState onRetry={() => mutate()} />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post, idx) => (
              <div key={post.id}>
                <FeedCard post={post} currentUserId={profile?.id} />
                {idx === 2 && (
                  <div className="p-3 border-b border-border/30 bg-muted/10">
                    <InlineCommunitiesWidget />
                  </div>
                )}
                {idx === 6 && (
                  <div className="p-3 border-b border-border/30 bg-muted/10">
                    <InlineDatingWidget />
                  </div>
                )}
                {idx === 10 && (
                  <div className="p-3 border-b border-border/30 bg-muted/10">
                    <InlineHashtagsWidget />
                  </div>
                )}
                {idx === 14 && (
                  <div className="p-3 border-b border-border/30 bg-muted/10">
                    <InlineReferralWidget />
                  </div>
                )}
              </div>
            ))}


            {/* Load more trigger anchor */}
            {!isReachingEnd && (
              <div ref={setLoadMoreRef} className="w-full">
                <FeedLoadingMoreSkeleton />
              </div>
            )}


            {isReachingEnd && <FeedCaughtUpCard />}
          </>
        ) : (
          <FeedEmptyState />
        )}
      </div>
    </main>
  );
}
