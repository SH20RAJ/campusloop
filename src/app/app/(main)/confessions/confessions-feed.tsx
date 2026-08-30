"use client";

import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useFeed } from "@/hooks/use-feed";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronDown,
  Globe,
  RotateCw,
  School,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CONFESSION_TABS = [
  { id: "spicy", label: "Spicy 🔥" },
  { id: "viral", label: "Viral ⚡" },
  { id: "latest", label: "Latest 🕒" },
  { id: "top_voted", label: "Top 🏆" },
] as const;

export function ConfessionsFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { profile } = useProfile();

  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "GLOBAL" ? "GLOBAL" : "CAMPUS";

  const rawSort = searchParams.get("sort") || "spicy";
  const [currentSort, setCurrentSort] = useState<string>(rawSort);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [isRotating, setIsRotating] = useState(false);

  const {
    feed,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    setSize,
    mutate,
  } = useFeed(scope, "CONFESSION", currentSort, "all", undefined, randomSeed);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || isReachingEnd || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((s) => s + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isReachingEnd, isLoadingMore, setSize]);

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

  const campusShortName =
    profile?.institution?.name?.split(",")[0] ||
    profile?.institution?.name ||
    "Campus";

  return (
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
              <h1 className="text-sm font-black text-foreground tracking-tight truncate">
                Confessions
              </h1>
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

          {/* Right Action: Reload / Shuffle SVG */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReloadRandom}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer active:scale-90"
              title="Shuffle & Refresh feed"
            >
              <RotateCw
                className={cn(
                  "size-3.5 transition-transform duration-700",
                  isRotating && "animate-spin"
                )}
              />
            </button>
          </div>
        </div>

        {/* ─── Flat Twitter Tabs ─── */}
        <div className="grid grid-cols-4 border-t border-border/20 text-center font-bold text-xs sm:text-sm">
          {CONFESSION_TABS.map((tab) => {
            const isActive = currentSort === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSortChange(tab.id)}
                className={cn(
                  "py-3 transition-colors relative cursor-pointer flex items-center justify-center gap-1",
                  isActive
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-14 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ─── Feed Stream Starts Directly Here (Zero Chrome Clutter) ─── */}
      <div className="flex flex-col">
        {isLoading ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}

            {/* Infinite Scroll Trigger */}
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-8 text-xs text-muted-foreground"
            >
              {isLoadingMore ? (
                <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isReachingEnd ? (
                <span className="text-[11px] text-muted-foreground/60">
                  You've caught up with all campus secrets ✨
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="py-24 text-center px-4 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mx-auto">
              <School className="size-6" />
            </div>
            <p className="text-sm font-bold text-foreground">
              No confessions found in this tab
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Be the first to anonymously spill what's on your mind.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
