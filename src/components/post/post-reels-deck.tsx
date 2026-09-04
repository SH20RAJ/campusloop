"use client";
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FastCommentsModal } from "@/components/feed/fast-comments-modal";
import { PostReelCard } from "@/components/post/post-reel-card";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface PostReelsDeckProps {
  initialPost: FeedPost;
  currentUserId?: string;
}

export function PostReelsDeck({ initialPost, currentUserId }: PostReelsDeckProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([initialPost]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPostForComments, setSelectedPostForComments] = useState<FeedPost | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isProgrammaticScrollRef = useRef(false);

  // Fetch subsequent feed posts to populate infinite vertical snap reel
  useEffect(() => {
    let isCancelled = false;

    async function loadAdjacentPosts() {
      try {
        const data = await fetcher<{ posts: FeedPost[] }>("/api/feed?limit=25&sort=latest");
        if (isCancelled || !data?.posts) return;

        // Filter out duplicates of initialPost
        const unique = data.posts.filter((p) => p.id !== initialPost.id);
        setPosts([initialPost, ...unique]);
      } catch (err) {
        console.error("Failed to load adjacent posts for reel", err);
      }
    }

    loadAdjacentPosts();
    return () => {
      isCancelled = true;
    };
  }, [initialPost]);

  // Load more posts when user gets near bottom of deck
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetcher<{ posts: FeedPost[] }>(`/api/feed?page=${nextPage}&limit=20&sort=latest`);
      if (data?.posts && data.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const fresh = data.posts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...fresh];
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

  // Scroll to target index smoothly
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!containerRef.current || index < 0 || index >= posts.length) return;
      sounds.tap();
      haptics.light();
      isProgrammaticScrollRef.current = true;
      const targetElement = containerRef.current.children[index] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    },
    [posts.length]
  );

  // Keyboard navigation: ArrowDown / ArrowUp / J / K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input / textarea or comments modal is open
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

  // IntersectionObserver to detect which post is currently centered
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

              const currentPost = posts[newIdx];
              if (currentPost) {
                // Update URL without reloading page (Reels / News reader style)
                window.history.replaceState(null, "", `/app/post/${currentPost.id}`);
                // Update dynamic document title
                const author = currentPost.isAnonymous
                  ? "Anonymous Student"
                  : currentPost.author?.displayName || "Student";
                document.title = `${author}'s Post | CampusLoop`;
              }

              // Preload more when reaching near end
              if (newIdx >= posts.length - 3) {
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

    const items = container.querySelectorAll("[data-index]");
    for (const item of items) {
      observer.observe(item);
    }

    return () => {
      observer.disconnect();
    };
  }, [posts, loadMorePosts]);

  const currentPost = posts[activeIndex] || initialPost;

  return (
    <div className="relative w-full h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] overflow-hidden bg-background">
      {/* ─── Top Floating Bar ─── */}
      <div className="absolute top-2.5 inset-x-3 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
        {/* Back to Campus Feed button */}
        <Link
          href="/app"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-background/80 backdrop-blur-xl px-3.5 py-1.5 text-xs font-bold text-foreground shadow-md hover:bg-muted/80 transition-all cursor-pointer select-none active:scale-95"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Campus Feed</span>
        </Link>

        {/* Reels Campus Stream Indicator */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/70 bg-card/75 backdrop-blur-xl px-3 py-1 text-[11px] font-bold text-muted-foreground shadow-xs">
          <Sparkles className="size-3 text-primary animate-pulse" />
          <span className="text-foreground">{currentPost.institution?.name?.split(",")[0] || "Campus"}</span>
          <span>·</span>
          <span>Reel #{activeIndex + 1}</span>
        </div>
      </div>

      {/* ─── Vertical Snap Scroll Deck ─── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar pt-6 pb-4"
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            data-post-id={post.id}
            data-index={index}
            className="w-full h-full snap-start snap-always flex items-center justify-center p-2 sm:p-4 shrink-0"
          >
            <PostReelCard
              post={post}
              currentUserId={currentUserId}
              onOpenComments={(p) => setSelectedPostForComments(p)}
              isActive={index === activeIndex}
            />
          </div>
        ))}
      </div>

      {/* ─── Floating Reels Quick Navigation Pill (Right side) ─── */}
      <div className="absolute right-3 sm:right-6 bottom-6 z-30 flex flex-col items-center gap-1.5 rounded-full border border-border/80 bg-card/90 backdrop-blur-2xl p-1.5 shadow-2xl">
        {/* Previous Post Button */}
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous post"
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            activeIndex === 0
              ? "opacity-30 cursor-not-allowed text-muted-foreground"
              : "hover:bg-muted/60 text-foreground hover:scale-110 active:scale-95"
          )}
        >
          <ChevronUp className="size-4" />
        </button>

        {/* Post Counter Badge */}
        <div className="px-1 text-[10px] font-black text-muted-foreground tabular-nums select-none">
          {activeIndex + 1}
          <span className="opacity-40">/</span>
          {posts.length}
        </div>

        {/* Next Post Button */}
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === posts.length - 1}
          aria-label="Next post"
          className={cn(
            "p-2 rounded-full transition-all cursor-pointer",
            activeIndex === posts.length - 1
              ? "opacity-30 cursor-not-allowed text-muted-foreground"
              : "hover:bg-muted/60 text-foreground hover:scale-110 active:scale-95"
          )}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {/* ─── Slide-Up Comments Drawer (Instagram / TikTok Style) ─── */}
      {selectedPostForComments && (
        <FastCommentsModal
          post={selectedPostForComments}
          isOpen={Boolean(selectedPostForComments)}
          onClose={() => setSelectedPostForComments(null)}
          onCommentCountChange={(newCount) => {
            setPosts((prev) =>
              prev.map((p) => (p.id === selectedPostForComments.id ? { ...p, commentsCount: newCount } : p))
            );
          }}
        />
      )}
    </div>
  );
}
