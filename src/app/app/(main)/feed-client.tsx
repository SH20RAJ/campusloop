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
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { StoryRing } from "@/components/ui/story-ring";
import { useFeed,useStories } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { Plus } from "lucide-react";
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

      {/* ─── Quick Composer Box ─── */}
      <div className="px-4 pt-4">
        <Link href="/app/post/new">
          <div className="flex items-center gap-3 bg-card/45 hover:bg-card/85 border border-border/45 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm">
            <Avatar className="h-9 w-9 border border-border/60 shadow-inner shrink-0">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {profile?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-xs text-muted-foreground font-semibold">
              Share a confession, drop a poll, or ask your campus...
            </div>
            <div className="h-7 w-7 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </div>

      {/* ─── Main Feed List ─── */}
      <div className="flex flex-col px-4 pt-4 gap-4.5">
        {feedLoading && size === 1 ? (
          <FeedSkeleton />
        ) : isError ? (
          <FeedErrorState onRetry={() => mutate()} />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post, idx) => (
              <div key={post.id} className="space-y-4.5">
                <FeedCard post={post} currentUserId={profile?.id} />
                {idx === 2 && <InlineCommunitiesWidget />}
                {idx === 6 && <InlineDatingWidget />}
                {idx === 10 && <InlineHashtagsWidget />}
                {idx === 14 && <InlineReferralWidget />}
              </div>
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

            {isReachingEnd && <FeedCaughtUpCard />}
          </>
        ) : (
          <FeedEmptyState />
        )}
      </div>
    </main>
  );
}
