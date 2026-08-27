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
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { FeedLoadingMoreSkeleton,FeedSkeleton } from "@/components/ui/skeleton-card";
import { StoryRing } from "@/components/ui/story-ring";

import { FeedPost,useFeed,useStories } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { confirmOptimisticPost,optimisticAddPost,revertOptimisticPost } from "@/lib/feed-mutations";
import type { TrendingHashtag } from "@/lib/trending-hashtags";
import { Flame } from "lucide-react";
import Link from "next/link";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import { useEffect,useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";



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
    isValidating,
    isReachingEnd,
    isError,
    size,
    setSize,
    mutate,
    refresh,
  } = useFeed(scope, type, sort, visibility);

  const { stories, mutate: mutateStories, isLoading: storiesLoading } = useStories();
  const { profile } = useProfile();

  const { data: trendingData } = useSWR<{ trending: TrendingHashtag[] }>(
    "/api/hashtags/trending?limit=8",
    fetcher,
    { dedupingInterval: 30000 }
  );
  const trendingTags = trendingData?.trending || [];

  const [quickText, setQuickText] = useState("");
  const [isQuickPosting, setIsQuickPosting] = useState(false);


  async function handleQuickPost(e: React.FormEvent) {
    e.preventDefault();
    const text = quickText.trim();
    if (!text || isQuickPosting) return;

    setIsQuickPosting(true);
    setQuickText("");

    const tempId = `temp_${Date.now()}`;
    const optimisticPost: FeedPost = {
      id: tempId,
      authorId: profile?.id || "temp_author",
      institutionId: profile?.institutionId || "inst_global",
      body: text,
      type: "NORMAL",
      scope,
      isAnonymous: false,
      pseudonym: null,
      title: null,
      status: "PUBLISHED",
      riskScore: 0,
      isEdited: false,
      repostOfId: null,
      repostComment: null,
      communityId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      votesCount: 0,

      commentsCount: 0,
      userVote: 0,
      author: profile as unknown as FeedPost["author"],
      institution: (profile?.institution || {
        id: profile?.institutionId || "inst_global",
        name: "Campus",
      }) as unknown as FeedPost["institution"],
    };


    optimisticAddPost(optimisticPost);
    toast.success("Post published! 🎉");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          type: "NORMAL",
          scope,
          isAnonymous: false,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to publish post");
      }

      const serverPost = (await res.json()) as { id: string; createdAt?: string | Date };
      confirmOptimisticPost(tempId, {
        ...optimisticPost,
        id: serverPost.id,
        createdAt: new Date(serverPost.createdAt || Date.now()),
      });
    } catch (err: unknown) {
      console.error("Quick post failed:", err);
      revertOptimisticPost(tempId);
      toast.error(err instanceof Error ? err.message : "Failed to publish post.");
    } finally {
      setIsQuickPosting(false);
    }
  }

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
    <PullToRefresh onRefresh={refresh}>
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
          institutionSlug={profile?.institution?.slug || (profile?.institution?.name ? profile.institution.name.split(",")[0] : null)}
          onRefresh={refresh}
          isRefreshing={isValidating}
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

        {/* ─── Twitter-Style Quick Composer Row with Instant Optimistic Post ─── */}
        <form onSubmit={handleQuickPost} className="border-b border-border/30 px-4 py-3 bg-card/30">
          <div className="flex gap-3 items-start">
            <Avatar className="size-10 rounded-full border border-border/40 shrink-0 mt-0.5">
              <AvatarImage src={profile?.avatarUrl || ""} />
              <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                {profile?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                rows={quickText ? 2 : 1}
                placeholder="What is happening on campus?!"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleQuickPost(e);
                  }
                }}
                className="w-full bg-transparent text-[15px] placeholder:text-muted-foreground/70 font-normal outline-none resize-none pt-2"
              />
              {quickText && (
                <div className="space-y-2 pt-1 border-t border-border/20">
                  {trendingTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase shrink-0 flex items-center gap-0.5">
                        <Flame className="size-2.5 text-primary" />
                      </span>
                      {trendingTags.slice(0, 6).map((t) => (
                        <button
                          key={t.tag}
                          type="button"
                          onClick={() => setQuickText((prev) => `${prev.trim()} ${t.tag} `)}
                          className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted/60 hover:bg-muted text-foreground border border-border/40 shrink-0 cursor-pointer transition-colors"
                        >
                          {t.tag}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Link
                      href="/app/post/new"
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      Open full editor (poll, photos, confession)
                    </Link>
                    <button
                      type="submit"
                      disabled={isQuickPosting || !quickText.trim()}
                      className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {isQuickPosting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              )}

            </div>
            {!quickText && (
              <div className="flex items-center gap-1.5 shrink-0 pt-1">
                <Link
                  href="/app/post/new"
                  className="px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                >
                  Post
                </Link>
              </div>
            )}
          </div>
        </form>

        {/* ─── Main Feed Stream (Twitter-Style Flat Timeline) ─── */}
        <div className="flex flex-col">
          {feedLoading && (!feed || feed.length === 0) ? (
            <FeedSkeleton />
          ) : isError && (!feed || feed.length === 0) ? (
            <FeedErrorState onRetry={() => refresh()} />
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
    </PullToRefresh>
  );
}

