"use client";

import { Building2, ChevronRight, Search, Users, Zap } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("for_you");
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
      } else {
        // At bottom of deck: load more and advance
        loadMorePosts(true);
      }
    } else if (deltaY < -swipeThreshold) {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
    }
  }

  // Helper to construct query URL based on active tab
  const getFeedUrl = useCallback((tab: string, pageNum: number) => {
    let sortParam = "for_you";
    let typeParam = "";
    let hashtagParam = "";

    if (tab === "latest") {
      sortParam = "latest";
    } else if (tab === "clubs") {
      sortParam = "trending";
      typeParam = "COMMUNITY";
    } else if (tab === "opportunities") {
      sortParam = "latest";
      hashtagParam = "opportunities";
    }

    const params = new URLSearchParams();
    params.set("page", String(pageNum));
    params.set("limit", "15");
    params.set("sort", sortParam);
    params.set("scope", "GLOBAL");
    if (typeParam) params.set("type", typeParam);
    if (hashtagParam) params.set("hashtag", hashtagParam);

    return `/api/feed?${params.toString()}`;
  }, []);

  // Load more posts when near bottom of deck - Truly infinite scroll with feed algorithm
  const loadMorePosts = useCallback(async (autoAdvance = false) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const url = getFeedUrl(activeTab, nextPage);
      const data = await fetcher<FeedPost[] | { posts: FeedPost[] }>(url);
      const rawPosts: FeedPost[] = Array.isArray(data) ? data : (data?.posts || []);

      if (rawPosts.length > 0) {
        let addedCount = 0;
        setItems((prev) => {
          const existingPostIds = new Set(
            prev.filter((i) => i.type === "POST").map((i) => (i as { post: FeedPost }).post.id)
          );
          const freshPosts = rawPosts.filter((p) => !existingPostIds.has(p.id));
          if (freshPosts.length === 0) return prev;
          addedCount = freshPosts.length;
          const newItems: LoopDeckItem[] = freshPosts.map((p) => ({ type: "POST", post: p }));
          return [...prev, ...newItems];
        });
        setPage(nextPage);

        if (autoAdvance) {
          setTimeout(() => {
            scrollToIndex(activeIndex + 1);
          }, 150);
        }
      } else {
        // Fallback: If page runs dry, cycle in trending/viral campus posts so scroll never ends
        const fallbackData = await fetcher<FeedPost[] | { posts: FeedPost[] }>(
          `/api/feed?page=1&limit=20&sort=trending&scope=GLOBAL`
        );
        const fallbackPosts: FeedPost[] = Array.isArray(fallbackData) ? fallbackData : (fallbackData?.posts || []);
        if (fallbackPosts.length > 0) {
          setItems((prev) => {
            const existingPostIds = new Set(
              prev.filter((i) => i.type === "POST").map((i) => (i as { post: FeedPost }).post.id)
            );
            const freshPosts = fallbackPosts.filter((p) => !existingPostIds.has(p.id));
            if (freshPosts.length === 0) return prev;
            return [...prev, ...freshPosts.map((p) => ({ type: "POST", post: p } as LoopDeckItem))];
          });
          if (autoAdvance) {
            setTimeout(() => {
              scrollToIndex(activeIndex + 1);
            }, 150);
          }
        }
      }
    } catch {
      // Ignore network error
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page, activeTab, getFeedUrl, activeIndex, scrollToIndex]);

  // Pre-fetch next posts on mount so user always has immediate swipe continuity
  useEffect(() => {
    if (items.length <= 2) {
      loadMorePosts();
    }
  }, []);

  // Tab change handler with instant refresh & smooth reset to top
  const handleTabChange = useCallback(async (tabId: string) => {
    setActiveTab(tabId);
    sounds.tap();
    haptics.light();
    try {
      const url = getFeedUrl(tabId, 1);
      const data = await fetcher<FeedPost[] | { posts: FeedPost[] }>(url);
      const rawPosts: FeedPost[] = Array.isArray(data) ? data : (data?.posts || []);

      if (rawPosts.length > 0) {
        const newItems: LoopDeckItem[] = rawPosts.map((p) => ({ type: "POST", post: p }));
        setItems(newItems);
        setActiveIndex(0);
        setPage(1);
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        // Fallback to general feed if tab-specific filter yields no results
        const fallback = await fetcher<FeedPost[] | { posts: FeedPost[] }>(
          `/api/feed?page=1&limit=15&sort=latest&scope=GLOBAL`
        );
        const fbPosts: FeedPost[] = Array.isArray(fallback) ? fallback : (fallback?.posts || []);
        if (fbPosts.length > 0) {
          setItems(fbPosts.map((p) => ({ type: "POST", post: p })));
          setActiveIndex(0);
          setPage(1);
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }
    } catch {
      // ignore
    }
  }, [getFeedUrl]);

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

              // Preload more early when approaching end
              if (newIdx >= items.length - 2) {
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

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-dvh overflow-hidden bg-background select-none"
    >
      {/* ─── Ambient Glow in Background ─── */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] bg-purple-600/10 blur-[140px] rounded-full -z-10" />

      {/* ─── Top Header & Subheader Tabs ─── */}
      <header className="absolute top-0 inset-x-0 z-30 px-4 pt-2.5 pb-1 bg-gradient-to-b from-background/95 via-background/85 to-transparent backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Campus Community & Icon */}
          <Link href="/app/colleges" className="flex items-center gap-2.5 group min-w-0">
            <div className="size-10 rounded-full bg-purple-950/80 border border-purple-500/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.35)] shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="size-5 text-purple-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black text-foreground truncate tracking-tight leading-tight">
                {campusName || "Birla Institute of Technology"}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate font-medium flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3 text-purple-400" />
                  <span>Campus Community</span>
                </span>
                <span>·</span>
                <span>3.2K members</span>
              </p>
            </div>
          </Link>

          {/* Right: Glowing Loop # Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
            <Zap className="size-3.5 fill-purple-400 text-purple-400 animate-pulse" />
            <span>Loop #{activeIndex + 1}</span>
            <ChevronRight className="size-3.5 text-purple-400/80" />
          </div>
        </div>

        {/* Subheader Filter Tabs */}
        <div className="flex items-center justify-between gap-2 mt-3 border-b border-border/20 pb-0.5">
          <div className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "for_you", label: "For You" },
              { id: "latest", label: "Latest" },
              { id: "clubs", label: "Clubs" },
              { id: "opportunities", label: "Opportunities" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "relative pb-2 transition-colors cursor-pointer select-none whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-foreground font-black"
                    : "text-muted-foreground hover:text-foreground font-semibold"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 inset-x-0 h-[3px] rounded-full bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                )}
              </button>
            ))}
          </div>

          <Link
            href="/app/search"
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
            aria-label="Search campus discussions"
          >
            <Search className="size-4" />
          </Link>
        </div>
      </header>

      {/* ─── Vertical Snap Scroll Deck (Exact Viewport Bounds: top 88px, bottom 64px on mobile / 0 on desktop) ─── */}
      <div
        ref={containerRef}
        className="absolute inset-x-0 top-[88px] sm:top-[92px] bottom-[64px] md:bottom-0 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
      >
        {items.map((item, index) => (
          <div
            key={item.type === "POST" ? item.post.id : item.id}
            data-index={index}
            className="w-full h-full snap-start snap-always shrink-0 relative overflow-hidden flex flex-col"
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
