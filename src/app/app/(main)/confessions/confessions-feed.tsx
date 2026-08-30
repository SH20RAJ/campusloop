"use client";

import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useFeed } from "@/hooks/use-feed";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Dices,
  Flame,
  Globe,
  Plus,
  RotateCw,
  School,
  Shield,
  Sparkles,
  Trophy,
  VenetianMask,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CONFESSION_SORTS = [
  { id: "spicy", label: "Spicy 🔥", desc: "Most debated & trending secrets" },
  { id: "viral", label: "Viral ⚡", desc: "Breakout campus secrets" },
  { id: "top_voted", label: "Top Secret 🏆", desc: "All-time highest upvoted" },
  { id: "random", label: "Shuffle 🎲", desc: "Randomized secret pool" },
  { id: "latest", label: "Latest 🕒", desc: "Freshly spilled confessions" },
] as const;

export function ConfessionsFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "GLOBAL" ? "GLOBAL" : "CAMPUS";

  const rawSort = searchParams.get("sort") || "spicy";
  const [currentSort, setCurrentSort] = useState<string>(rawSort);
  const [randomSeed, setRandomSeed] = useState<number>(() => Date.now());
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
      setRandomSeed(Date.now());
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleReloadRandom() {
    sounds.pop();
    haptics.medium();
    setIsRotating(true);
    setRandomSeed(Date.now());
    mutate();
    setTimeout(() => setIsRotating(false), 700);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-28 border-x border-border/20">
      {/* ─── Sticky Minimal Top Header ─── */}
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="Go back"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5 truncate">
                <span>Campus Confessions</span>
                <Flame className="size-4 text-amber-500 fill-amber-500 shrink-0" />
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                Anonymous thoughts from {scope === "CAMPUS" ? "your campus" : "1,350+ Indian colleges"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Scope Pill */}
            <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
              <button
                type="button"
                onClick={() => handleScopeToggle("CAMPUS")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  scope === "CAMPUS"
                    ? "bg-foreground text-background shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <School className="size-3" />
                <span>Campus</span>
              </button>
              <button
                type="button"
                onClick={() => handleScopeToggle("GLOBAL")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  scope === "GLOBAL"
                    ? "bg-foreground text-background shadow-xs font-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Globe className="size-3" />
                <span>India</span>
              </button>
            </div>

            {/* Animated Reload SVG Button */}
            <button
              type="button"
              onClick={handleReloadRandom}
              className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-90"
              title="Shuffle & Refresh random secrets"
            >
              <RotateCw
                className={cn(
                  "size-3.5 transition-transform duration-700",
                  isRotating && "animate-spin"
                )}
              />
            </button>

            {/* New Confession Button */}
            <Link
              href="/app/post/new?type=CONFESSION"
              onClick={() => {
                sounds.tap();
                haptics.light();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Confess</span>
            </Link>
          </div>
        </div>

        {/* ─── Algorithm & Sorting Pills Strip ─── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 py-2 border-t border-border/20 bg-background/50">
          {CONFESSION_SORTS.map((s) => {
            const isActive = currentSort === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSortChange(s.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-foreground text-background shadow-xs font-black"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/40"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex flex-col px-4 pt-4 gap-4">
        {/* ─── Fast Confession Composer Box ─── */}
        <Link
          href="/app/post/new?type=CONFESSION"
          onClick={() => {
            sounds.tap();
            haptics.light();
          }}
          className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 transition-all hover:border-amber-500/60 hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-inner group-hover:scale-105 transition-transform">
                <VenetianMask className="size-5" />
              </div>
              <div>
                <p className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">
                  Got a campus secret or late-night thought?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  100% anonymous & cryptographic pseudonym protection.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-amber-500 bg-amber-500/15 px-3 py-1.5 rounded-full shrink-0 group-hover:bg-amber-500 group-hover:text-black transition-all">
              <span>Write Secret</span>
              <Sparkles className="size-3.5" />
            </div>
          </div>
        </Link>

        {/* ─── Feed Stream ─── */}
        {isLoading ? (
          <FeedSkeleton />
        ) : feed && feed.length > 0 ? (
          <>
            {feed.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}

            <div ref={loadMoreRef} className="py-6 text-center">
              {isLoadingMore && <FeedSkeleton />}
              {isReachingEnd && (
                <div className="space-y-2 py-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    You&apos;ve reached the end of secrets
                  </p>
                  <button
                    type="button"
                    onClick={handleReloadRandom}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer active:scale-95"
                  >
                    <Dices className="size-3.5 text-amber-500" />
                    <span>Shuffle New Random Secrets</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 text-muted-foreground border border-dashed border-border/60 rounded-3xl p-8">
            <Shield className="size-10 text-muted-foreground/40" />
            <div className="space-y-1 max-w-sm">
              <p className="text-sm font-black text-foreground">No confessions found</p>
              <p className="text-xs">Be the first to share an anonymous secret with your campus or shuffle global secrets.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReloadRandom}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/60 text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                <RotateCw className="size-3.5" />
                <span>Shuffle Feed</span>
              </button>
              <Link
                href="/app/post/new?type=CONFESSION"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition-all shadow-sm"
              >
                <Plus className="size-3.5 stroke-[3]" />
                <span>Write Secret</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
