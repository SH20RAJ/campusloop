"use client";

import { FeedCard } from "@/components/ui/feed-card";
import { FeedSkeleton } from "@/components/ui/skeleton-card";
import { useFeed } from "@/hooks/use-feed";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { ArrowLeft,Flame,Globe,Lock,Shield } from "lucide-react";
import { usePathname,useRouter,useSearchParams } from "next/navigation";
import { useEffect,useRef } from "react";

export function ConfessionsFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawScope = searchParams.get("scope");
  const scope: "CAMPUS" | "GLOBAL" = rawScope === "GLOBAL" ? "GLOBAL" : "CAMPUS";

  const {
    feed,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    setSize,
  } = useFeed(scope, "CONFESSION", "trending");

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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen select-none pb-24">
      {/* ─── Sticky Minimal Top Header ─── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
              <span>Campus Confessions</span>
              <Flame className="size-4 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Anonymous, sealed thoughts from {scope === "CAMPUS" ? "your college" : "all of India"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope Pill */}
          <div className="flex items-center rounded-full bg-muted/60 p-0.5 border border-border/40 shrink-0">
            <button
              type="button"
              onClick={() => handleScopeToggle("CAMPUS")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                scope === "CAMPUS"
                  ? "bg-foreground text-background shadow-xs font-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Campus
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

          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
            <Lock className="size-2.5" />
            <span>Sealed</span>
          </span>
        </div>
      </header>

      <div className="flex flex-col px-4 pt-4 gap-4">
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  You&apos;ve reached the end of confessions
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 text-muted-foreground">
            <Shield className="size-10 text-muted-foreground/40" />
            <p className="text-xs font-bold text-foreground">No confessions yet</p>
            <p className="text-[11px]">Be the first to share an anonymous secret with your campus.</p>
          </div>
        )}
      </div>
    </main>
  );
}
