"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FastCommentsModal } from "@/components/feed/fast-comments-modal";
import { DeckAcademicDropCard } from "@/components/post/deck/deck-academic-drop-card";
import type { LoopDeckItem } from "@/components/post/deck/deck-types";
import { DeckUserSuggestionsCard } from "@/components/post/deck/deck-user-suggestions-card";
import { PostReelCard } from "@/components/post/post-reel-card";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface PostReelsDeckProps {
  initialItems: LoopDeckItem[];
  currentUserId?: string;
  campusName?: string;
}

export function PostReelsDeck({ initialItems, currentUserId, campusName }: PostReelsDeckProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<LoopDeckItem[]>(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPostForComments, setSelectedPostForComments] = useState<FeedPost | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const isProgrammaticScrollRef = useRef(false);
  const isWheelingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  // Smooth scroll to target index
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!containerRef.current || index < 0 || index >= items.length) return;
      sounds.tap();
      haptics.light();
      isProgrammaticScrollRef.current = true;
      const targetElement = containerRef.current.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      setActiveIndex(index);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    },
    [items.length]
  );

  // Desktop Mouse Wheel / Trackpad Snap Gesture Handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Don't intercept if user is inside comments drawer
      if (selectedPostForComments) return;
      if (isWheelingRef.current || isProgrammaticScrollRef.current) return;

      const threshold = 28;
      if (e.deltaY > threshold) {
        if (activeIndex < items.length - 1) {
          isWheelingRef.current = true;
          scrollToIndex(activeIndex + 1);
          setTimeout(() => {
            isWheelingRef.current = false;
          }, 450);
        }
      } else if (e.deltaY < -threshold) {
        if (activeIndex > 0) {
          isWheelingRef.current = true;
          scrollToIndex(activeIndex - 1);
          setTimeout(() => {
            isWheelingRef.current = false;
          }, 450);
        }
      }
    },
    [activeIndex, items.length, scrollToIndex, selectedPostForComments]
  );

  // Mobile Touch Swipe Gesture Handlers
  function handleTouchStart(e: React.TouchEvent) {
    if (selectedPostForComments) return;
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (selectedPostForComments || touchStartYRef.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    touchStartYRef.current = null;

    const swipeThreshold = 40;
    if (deltaY > swipeThreshold) {
      if (activeIndex < items.length - 1) {
        scrollToIndex(activeIndex + 1);
      }
    } else if (deltaY < -swipeThreshold) {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
    }
  }

  // Load more posts when near bottom of deck
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetcher<{ posts: FeedPost[] }>(`/api/feed?page=${nextPage}&limit=15&sort=for_you`);
      if (data?.posts && data.posts.length > 0) {
        setItems((prev) => {
          const existingPostIds = new Set(
            prev.filter((i) => i.type === "POST").map((i) => (i as { post: FeedPost }).post.id)
          );
          const freshPosts = data.posts.filter((p) => !existingPostIds.has(p.id));
          const newItems: LoopDeckItem[] = freshPosts.map((p) => ({ type: "POST", post: p }));
          return [...prev, ...newItems];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch {
      // Ignore network error
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page]);

  // Keyboard navigation (ArrowDown, ArrowUp, J, K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedPostForComments) return;
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (e.key === "ArrowDown" || e.key.toLowerCase() === "j") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, scrollToIndex, selectedPostForComments]);

  // IntersectionObserver to detect currently centered item & update URL
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const indexAttr = entry.target.getAttribute("data-index");
            if (indexAttr !== null) {
              const newIdx = Number.parseInt(indexAttr, 10);
              setActiveIndex(newIdx);

              const currentItem = items[newIdx];
              if (currentItem && currentItem.type === "POST") {
                const currentPost = currentItem.post;
                window.history.replaceState(null, "", `/app/post/${currentPost.id}`);
                const author = currentPost.isAnonymous
                  ? "Anonymous Student"
                  : currentPost.author?.displayName || "Student";
                document.title = `${author}'s Loop | CampusLoop`;
              }

              // Preload more when approaching end
              if (newIdx >= items.length - 3) {
                loadMorePosts();
              }
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    const elements = container.querySelectorAll("[data-index]");
    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items, loadMorePosts]);

  const activeItem = items[activeIndex];

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-dvh overflow-hidden bg-background select-none"
    >
      {/* ─── Top Floating Header ─── */}
      <div className="absolute top-2.5 inset-x-3 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
        {/* Back to Campus Feed button */}
        <Link
          href="/app"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-background/85 backdrop-blur-xl px-3.5 py-1.5 text-xs font-bold text-foreground shadow-md hover:bg-muted/80 transition-all cursor-pointer select-none active:scale-95"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Campus Feed</span>
        </Link>

        {/* Campus Loop Indicator Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/70 bg-card/85 backdrop-blur-xl px-3.5 py-1 text-[11px] font-bold text-muted-foreground shadow-xs">
          <Zap className="size-3 text-primary animate-pulse" />
          <span className="text-foreground font-black">{campusName || "CampusLoop Spotlight"}</span>
          <span>·</span>
          <span>Loop #{activeIndex + 1}</span>
        </div>
      </div>

      {/* ─── Vertical Snap Scroll Deck ─── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar pt-6 pb-4"
      >
        {items.map((item, index) => (
          <div
            key={item.type === "POST" ? item.post.id : item.id}
            data-index={index}
            className="w-full h-full snap-start snap-always flex items-center justify-center p-2 sm:p-4 shrink-0"
          >
            {item.type === "POST" ? (
              <PostReelCard
                post={item.post}
                currentUserId={currentUserId}
                onOpenComments={(p) => setSelectedPostForComments(p)}
                isActive={index === activeIndex}
              />
            ) : item.type === "USER_SUGGESTIONS" ? (
              <DeckUserSuggestionsCard users={item.users} institutionName={campusName} />
            ) : item.type === "ACADEMIC_DROP" ? (
              <DeckAcademicDropCard resource={item.resource} />
            ) : item.type === "POLL_SPOTLIGHT" ? (
              <PostReelCard
                post={item.post}
                currentUserId={currentUserId}
                onOpenComments={(p) => setSelectedPostForComments(p)}
                isActive={index === activeIndex}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* ─── Floating Quick Navigation Pill (Right Side like Instagram Image 3) ─── */}
      <div className="absolute right-3 sm:right-6 bottom-6 z-30 flex flex-col items-center gap-1.5 rounded-full border border-border/80 bg-card/90 backdrop-blur-2xl p-1.5 shadow-2xl">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous loop"
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            activeIndex === 0
              ? "opacity-30 cursor-not-allowed text-muted-foreground"
              : "hover:bg-muted/60 text-foreground hover:scale-110 active:scale-95"
          )}
        >
          <ChevronUp className="size-4" />
        </button>

        <div className="px-1 text-[10px] font-black text-muted-foreground tabular-nums select-none">
          {activeIndex + 1}
          <span className="opacity-40">/</span>
          {items.length}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === items.length - 1}
          aria-label="Next loop"
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            activeIndex === items.length - 1
              ? "opacity-30 cursor-not-allowed text-muted-foreground"
              : "hover:bg-muted/60 text-foreground hover:scale-110 active:scale-95"
          )}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* ─── Slide-Up Comments Drawer ─── */}
      {selectedPostForComments && (
        <FastCommentsModal
          post={selectedPostForComments}
          isOpen={Boolean(selectedPostForComments)}
          onClose={() => setSelectedPostForComments(null)}
          onCommentCountChange={(newCount) => {
            setItems((prev) =>
              prev.map((i) =>
                i.type === "POST" && i.post.id === selectedPostForComments.id
                  ? { ...i, post: { ...i.post, commentsCount: newCount } }
                  : i
              )
            );
          }}
        />
      )}
    </div>
  );
}
