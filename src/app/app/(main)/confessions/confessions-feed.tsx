"use client";

import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Feather,
  Flame,
  Globe,
  RotateCw,
  School,
  Sparkles,
  Trophy,
  VenetianMask,
  Zap,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ConfessionComposerModal } from "@/components/confessions/confession-composer-modal";
import { FeedCard } from "@/components/ui/feed-card";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { ConfessionsFeedSkeleton } from "@/components/ui/skeleton-card";
import { useFeed } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const CONFESSION_TABS = [
  { id: "spicy", label: "Spicy", icon: Flame, colorClass: "text-amber-500" },
  { id: "viral", label: "Viral", icon: Zap, colorClass: "text-emerald-500" },
  { id: "latest", label: "Latest", icon: Clock, colorClass: "text-sky-500" },
  { id: "top_voted", label: "Top", icon: Trophy, colorClass: "text-yellow-500" },
] as const;

export function ConfessionsFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { profile } = useProfile();

  // Default scope to GLOBAL so students immediately see a thriving campus stream across India
  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "CAMPUS" ? "CAMPUS" : "GLOBAL";

  const rawSort = searchParams.get("sort") || "spicy";
  const [currentSort, setCurrentSort] = useState<string>(rawSort);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);

  // Composer Modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"CONFESSION" | "ARTICLE">("CONFESSION");

  const { feed, isLoading, isLoadingMore, isReachingEnd, setSize, mutate, refresh } = useFeed(
    scope,
    "CONFESSION",
    currentSort,
    "all",
    undefined,
    randomSeed
  );

  // De-duplicate items safely
  const uniqueFeed = useMemo(() => {
    if (!feed) return [];
    const map = new Map<string, (typeof feed)[0]>();
    for (const post of feed) {
      if (!map.has(post.id)) {
        map.set(post.id, post);
      }
    }
    return Array.from(map.values());
  }, [feed]);

  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreNode || isReachingEnd || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoadingMore) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.05, rootMargin: "300px" }
    );

    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [loadMoreNode, isReachingEnd, isLoadingMore, setSize]);

  function handleScopeToggle(newScope: "CAMPUS" | "GLOBAL") {
    sounds.tap();
    haptics.light();
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", newScope);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSortChange(sortId: string) {
    sounds.tap();
    haptics.light();
    setCurrentSort(sortId);
    if (sortId === "random") {
      setRandomSeed((prev) => prev + 1);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleReloadRandom() {
    sounds.pop();
    haptics.medium();
    setIsRotating(true);
    setRandomSeed((prev) => prev + 1);
    mutate();
    setTimeout(() => setIsRotating(false), 700);
  }

  function openComposer(mode: "CONFESSION" | "ARTICLE") {
    sounds.tap();
    haptics.medium();
    setComposerMode(mode);
    setIsComposerOpen(true);
  }

  const campusShortName = profile?.institution?.name?.split(",")[0] || profile?.institution?.name || "Campus";

  return (
    <PullToRefresh onRefresh={refresh}>
      <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28 border-x border-border/30 bg-background">
        {/* ─── Top Sticky Bar (Twitter / X Minimalist) ─── */}
        <header className="sticky top-0 z-40 border-b border-border/30 bg-background/85 backdrop-blur-xl">
          <div className="flex h-13 items-center justify-between px-4 gap-2">
            {/* Left Context: Back Button & Title / Campus Switcher */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Go back"
              >
                <ArrowLeft className="size-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1.5">
                  <VenetianMask className="size-4 text-purple-400 shrink-0" />
                  <h1 className="text-sm font-black text-foreground tracking-tight truncate">Confessions</h1>
                </div>
                <span className="text-muted-foreground/40 text-xs">·</span>

                {/* Campus / India Scope Pill Button */}
                <button
                  type="button"
                  onClick={() => handleScopeToggle(scope === "CAMPUS" ? "GLOBAL" : "CAMPUS")}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-bold text-foreground border border-border/40 transition-colors cursor-pointer truncate max-w-[170px]"
                  title="Switch feed scope"
                >
                  {scope === "CAMPUS" ? (
                    <>
                      <School className="size-3 text-primary shrink-0" />
                      <span className="truncate">{campusShortName}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="size-3 text-primary shrink-0" />
                      <span>All India</span>
                    </>
                  )}
                  <ChevronDown className="size-3 text-muted-foreground shrink-0 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Right Action: Reload / Shuffle */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleReloadRandom}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer active:scale-90"
                title="Shuffle & Refresh feed"
              >
                <RotateCw
                  className={cn("size-3.5 transition-transform duration-700", isRotating && "animate-spin")}
                />
              </button>
            </div>
          </div>

          {/* ─── Cute Creator Quick Bar ─── */}
          <div className="px-3.5 py-2.5 bg-purple-950/15 border-t border-purple-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 shrink-0">
                <Sparkles className="size-3.5" />
              </div>
              <p className="text-[11px] font-semibold text-foreground/80 truncate">
                Spill tea or share an anonymous story
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openComposer("CONFESSION")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <VenetianMask className="size-3" />
                <span>Spill Tea</span>
              </button>

              <button
                type="button"
                onClick={() => openComposer("ARTICLE")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/70 hover:bg-muted text-foreground border border-border/60 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Feather className="size-3" />
                <span>Article</span>
              </button>
            </div>
          </div>

          {/* ─── Flat Twitter Tabs (Zero Raw Emojis, Clean Lucide Icons) ─── */}
          <div className="grid grid-cols-4 border-t border-border/20 text-center font-bold text-[11px] sm:text-xs">
            {CONFESSION_TABS.map((tab) => {
              const isActive = currentSort === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSortChange(tab.id)}
                  className={cn(
                    "py-2.5 transition-colors relative cursor-pointer flex items-center justify-center gap-1.5",
                    isActive
                      ? "text-foreground font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <TabIcon className={cn("size-3.5", isActive ? tab.colorClass : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* ─── Feed Stream Starts Directly Here (Zero Chrome Clutter) ─── */}
        <div className="flex flex-col">
          {isLoading ? (
            <ConfessionsFeedSkeleton />
          ) : uniqueFeed.length > 0 ? (
            <>
              {uniqueFeed.map((post) => (
                <FeedCard key={post.id} post={post} />
              ))}

              {/* Infinite Scroll Trigger */}
              <div
                ref={setLoadMoreNode}
                className="flex flex-col justify-center items-center py-8 text-xs text-muted-foreground gap-2"
              >
                {isLoadingMore ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading more confessions...</span>
                  </div>
                ) : !isReachingEnd ? (
                  <button
                    type="button"
                    onClick={() => setSize((s) => s + 1)}
                    className="px-4 py-2 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
                  >
                    Load more
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground/60 font-medium">
                    You&apos;ve caught up with all campus secrets
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center px-4 space-y-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/25 mx-auto">
                <VenetianMask className="size-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">No confessions found here yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Be the first to spill campus secrets or publish an anonymous long-form story.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => openComposer("CONFESSION")}
                  className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Spill First Confession
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confession Composer Modal */}
        <ConfessionComposerModal
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          defaultScope={scope}
          defaultMode={composerMode}
          onPublished={() => {
            refresh();
            mutate();
          }}
        />
      </main>
    </PullToRefresh>
  );
}

