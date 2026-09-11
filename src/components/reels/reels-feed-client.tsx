"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Repeat2,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FastCommentsModal } from "@/components/feed/fast-comments-modal";
import { FeedCardRepostModal } from "@/components/feed/feed-card-repost-modal";
import { AnimatedIcon, AnimateVideo } from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FeedPost } from "@/hooks/use-feed";
import { fetcher, repostPost, voteOnPost } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl, getCollegeShortName } from "@/lib/utils";

interface ReelsFeedClientProps {
  initialPosts: FeedPost[];
  currentUserId?: string;
  collegeName?: string;
}

export function ReelsFeedClient({ initialPosts, currentUserId, collegeName }: ReelsFeedClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedPostForComments, setSelectedPostForComments] = useState<FeedPost | null>(null);
  const [selectedPostForRepost, setSelectedPostForRepost] = useState<FeedPost | null>(null);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isWheelingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  // Smooth scroll to a specific reel index
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
      setActiveIndex(index);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 400);
    },
    [posts.length]
  );

  // Preload more video reels as user approaches the end
  const loadMoreReels = useCallback(async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetcher<FeedPost[] | { posts: FeedPost[] }>(
        `/api/feed?sort=reels&page=${nextPage}&limit=10&scope=GLOBAL`
      );
      const rawPosts: FeedPost[] = Array.isArray(data) ? data : data?.posts || [];
      if (rawPosts.length > 0) {
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const fresh = rawPosts.filter((p) => !seen.has(p.id));
          return [...prev, ...fresh];
        });
        setPage(nextPage);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, page]);

  useEffect(() => {
    if (activeIndex >= posts.length - 2) {
      loadMoreReels();
    }
  }, [activeIndex, posts.length, loadMoreReels]);

  // Desktop Mouse Wheel handler
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (selectedPostForComments || selectedPostForRepost) return;
      if (isWheelingRef.current || isProgrammaticScrollRef.current) return;

      const threshold = 30;
      if (e.deltaY > threshold) {
        if (activeIndex < posts.length - 1) {
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
    [activeIndex, posts.length, scrollToIndex, selectedPostForComments, selectedPostForRepost]
  );

  // Mobile Touch Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    if (selectedPostForComments || selectedPostForRepost) return;
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (selectedPostForComments || selectedPostForRepost || touchStartYRef.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    touchStartYRef.current = null;

    const swipeThreshold = 45;
    if (deltaY > swipeThreshold) {
      if (activeIndex < posts.length - 1) {
        scrollToIndex(activeIndex + 1);
      }
    } else if (deltaY < -swipeThreshold) {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
    }
  }

  // Keyboard navigation (ArrowDown, ArrowUp, J, K, Mute)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedPostForComments || selectedPostForRepost) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
        e.preventDefault();
        if (activeIndex < posts.length - 1) scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, posts.length, scrollToIndex, selectedPostForComments, selectedPostForRepost]);

  // Track scroll position when user manually drags scrollbar
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const itemHeight = container.clientHeight;
    if (itemHeight <= 0) return;
    const newIndex = Math.round(container.scrollTop / itemHeight);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < posts.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, posts.length]);

  async function handleExecuteRepost(withCommentary: boolean) {
    if (!selectedPostForRepost) return;
    setIsReposting(true);
    try {
      await repostPost(selectedPostForRepost.id, withCommentary ? quoteThoughts : undefined);
      sounds.tap();
      haptics.repost();
      toast.success(withCommentary ? "Quote posted to your campus timeline" : "Reel reposted to your campus timeline");
      setSelectedPostForRepost(null);
      setQuoteThoughts("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to repost reel");
    } finally {
      setIsReposting(false);
    }
  }

  const repostAuthorHandle = selectedPostForRepost
    ? selectedPostForRepost.isAnonymous
      ? "anonymous"
      : selectedPostForRepost.author?.username || "campusloop"
    : "campusloop";

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white flex justify-center items-center overflow-hidden select-none">
      {/* Top Overlay Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            title="Back to Campus Feed"
            aria-label="Back to Campus Feed"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-7 rounded-lg bg-gradient-to-tr from-rose-500 to-purple-600 shadow-md">
              <AnimateVideo className="size-4 text-white" />
            </span>
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Campus Reels
            </span>
            {collegeName && (
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                {collegeName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsMuted((prev) => !prev);
              haptics.light();
            }}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all active:scale-95 cursor-pointer"
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX className="size-4 text-white/80" /> : <Volume2 className="size-4 text-white" />}
          </button>
        </div>
      </header>

      {/* Main Reels Snap Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar"
      >
        {posts.map((post, idx) => (
          <SingleReelItem
            key={post.id}
            post={post}
            isActive={idx === activeIndex}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onOpenComments={() => setSelectedPostForComments(post)}
            onOpenRepost={() => setSelectedPostForRepost(post)}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Desktop Navigation Floating Arrows */}
      <div className="hidden md:flex fixed right-8 bottom-10 z-30 flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => activeIndex > 0 && scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-xl"
          title="Previous Reel (Up Arrow / K)"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => activeIndex < posts.length - 1 && scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === posts.length - 1}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-xl"
          title="Next Reel (Down Arrow / J)"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>

      {/* Fast Comments Modal */}
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

      {/* Repost Modal */}
      {selectedPostForRepost && (
        <FeedCardRepostModal
          isOpen={Boolean(selectedPostForRepost)}
          onClose={() => {
            setSelectedPostForRepost(null);
            setQuoteThoughts("");
          }}
          quoteThoughts={quoteThoughts}
          setQuoteThoughts={setQuoteThoughts}
          isReposting={isReposting}
          onExecuteRepost={handleExecuteRepost}
          originalPostAuthorHandle={repostAuthorHandle}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single Reel Slide Component
// ─────────────────────────────────────────────────────────────

interface SingleReelItemProps {
  post: FeedPost;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenComments: () => void;
  onOpenRepost: () => void;
  currentUserId?: string;
}

function SingleReelItem({
  post,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenRepost,
  currentUserId,
}: SingleReelItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract video URL
  const videoUrl = useMemo(() => {
    if (!post.body) return null;
    const mdMatch = post.body.match(
      /!\[.*?\]\(((?:https?:\/\/[^\s)]+|\/api\/files\/r2\/[^\s)]+)(?:\.(?:mp4|webm|mov|ogg)[^\s)]*|[^\s)]*videos[^\s)]*))\)/i
    );
    if (mdMatch) return mdMatch[1];

    const r2Match = post.body.match(/((?:https?:\/\/[^\s<>"']*)?\/api\/files\/r2\/videos\/[^\s<>"']+)/i);
    if (r2Match) return r2Match[1];

    const rawMatch = post.body.match(
      /((?:https?:\/\/[^\s<>"']+|\/api\/files\/r2\/[^\s<>"']+)\.(?:mp4|webm|mov|ogg)[^\s<>"']*)/i
    );
    if (rawMatch) return rawMatch[1];

    return null;
  }, [post.body]);

  // Clean caption text
  const cleanCaption = useMemo(() => {
    if (!videoUrl) return post.body;
    return post.body
      .replace(new RegExp(`!\\[.*?\\]\\(${videoUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "gi"), "")
      .replace(videoUrl, "")
      .trim();
  }, [post.body, videoUrl]);

  // Autoplay / pause control based on slide visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with sound restricted by browser; fallback to muted
            video.muted = true;
            video.play().catch(() => {});
            setIsPlaying(true);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Time update for progress bar
  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  }

  // Toggle play/pause
  function handleTogglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 500);
    }
    haptics.light();
  }

  // Double tap to like
  const lastTapRef = useRef<number>(0);
  function handleVideoTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      handleDoubleTapLike();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      handleTogglePlay();
    }
  }

  function handleDoubleTapLike() {
    setShowDoubleTapHeart(true);
    haptics.heartbeat();
    sounds.pop();
    setTimeout(() => setShowDoubleTapHeart(false), 800);

    if (userVote !== 1) {
      setUserVote(1);
      setVotesCount((prev) => prev + 1);
      voteOnPost(post.id, 1).catch(() => {
        setUserVote(post.userVote);
        setVotesCount(post.votesCount);
      });
    }
  }

  // Like button click
  function handleLikeClick() {
    haptics.light();
    if (userVote === 1) {
      setUserVote(0);
      setVotesCount((prev) => Math.max(0, prev - 1));
      voteOnPost(post.id, 0);
    } else {
      setUserVote(1);
      setVotesCount((prev) => prev + 1);
      sounds.pop();
      voteOnPost(post.id, 1);
    }
  }

  // Bookmark click
  function handleSaveClick() {
    haptics.light();
    setIsSaved((prev) => !prev);
    toast.success(!isSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
  }

  // Share click
  async function handleShareClick() {
    haptics.light();
    const shareUrl = `https://campusloop.space/app/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || "Campus Reel on CampusLoop",
          text: cleanCaption.slice(0, 100),
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or failed, fallback to copy
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Reel link copied to clipboard!");
  }

  const authorName = post.isAnonymous
    ? post.pseudonym || "Anonymous Student"
    : post.author?.displayName || post.author?.username || "Student";
  const authorHandle = post.isAnonymous ? "anonymous" : post.author?.username || "campusloop";
  const collegeTag = getCollegeShortName(post.institution);

  return (
    <div className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black overflow-hidden">
      {/* Blurred Ambient Background for Desktop (Instagram web style) */}
      {videoUrl && (
        <div
          className="hidden sm:block absolute inset-0 -z-10 blur-3xl opacity-25 scale-125 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${post.author?.avatarUrl || "/og-image.png"})` }}
        />
      )}

      {/* Centered 9:16 Reel Container */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[94dvh] sm:rounded-2xl sm:my-auto overflow-hidden bg-zinc-950 flex items-center justify-center shadow-2xl border sm:border-white/10">
        {/* Video Element */}
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            loop
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onClick={handleVideoTap}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/50 p-6 text-center">
            <AnimateVideo className="size-12 mb-3 text-white/30" />
            <p className="text-sm font-semibold">Video preview unavailable</p>
          </div>
        )}

        {/* Center Animated Play/Pause Ripple Indicator */}
        <AnimatePresence>
          {showPlayIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white shadow-2xl">
                {isPlaying ? <Play className="size-8 fill-white" /> : <Pause className="size-8 fill-white" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Double-Tap Heart Explosion */}
        <AnimatePresence>
          {showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <Heart className="size-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Action Bar (Instagram style) */}
        <div className="absolute right-3 bottom-20 z-30 flex flex-col items-center gap-5 pointer-events-auto">
          {/* Like / Upvote */}
          <button
            type="button"
            onClick={handleLikeClick}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-80",
                userVote === 1 ? "bg-rose-500/20 text-rose-500" : "bg-black/40 text-white hover:bg-black/60"
              )}
            >
              <Heart
                className={cn(
                  "size-6 transition-all",
                  userVote === 1 && "fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                )}
              />
            </div>
            <span className="text-[12px] font-bold text-white drop-shadow-md">
              {votesCount > 0 ? votesCount.toLocaleString() : "Like"}
            </span>
          </button>

          {/* Comments */}
          <button
            type="button"
            onClick={onOpenComments}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-transform active:scale-80">
              <MessageCircle className="size-6" />
            </div>
            <span className="text-[12px] font-bold text-white drop-shadow-md">
              {post.commentsCount > 0 ? post.commentsCount.toLocaleString() : "Chat"}
            </span>
          </button>

          {/* Repost */}
          <button
            type="button"
            onClick={onOpenRepost}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-transform active:scale-80">
              <Repeat2 className="size-6" />
            </div>
            <span className="text-[12px] font-bold text-white drop-shadow-md">Repost</span>
          </button>

          {/* Bookmark / Save */}
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-80",
                isSaved ? "bg-amber-500/20 text-amber-400" : "bg-black/40 text-white hover:bg-black/60"
              )}
            >
              <Bookmark className={cn("size-6", isSaved && "fill-amber-400 text-amber-400")} />
            </div>
            <span className="text-[12px] font-bold text-white drop-shadow-md">Save</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-transform active:scale-80">
              <Share2 className="size-6" />
            </div>
            <span className="text-[12px] font-bold text-white drop-shadow-md">Share</span>
          </button>

          {/* Spinning Audio Vinyl Disc */}
          <div className="pt-2">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-950 border-2 border-white/40 shadow-lg"
            >
              <div className="size-3.5 rounded-full bg-rose-500" />
            </motion.div>
          </div>
        </div>

        {/* Bottom Metadata Overlay (Instagram style) */}
        <div className="absolute left-0 right-16 bottom-0 z-20 p-4 pb-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-auto">
          {/* Creator Profile Row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <Link
              href={post.isAnonymous ? "#" : `/@${authorHandle}`}
              className="relative shrink-0 active:scale-95 transition-transform"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-500">
                <Avatar className="size-9 border-2 border-black">
                  <AvatarImage src={getAvatarUrl(post.author?.avatarUrl, authorHandle)} />
                  <AvatarFallback className="bg-zinc-800 text-xs font-bold">
                    {authorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={post.isAnonymous ? "#" : `/@${authorHandle}`}
                  className="font-bold text-sm text-white hover:underline truncate"
                >
                  {authorName}
                </Link>
                {!post.isAnonymous && (
                  <BadgeCheck className="size-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                )}
                {collegeTag && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20 uppercase tracking-wider">
                    {collegeTag}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-white/60">@{authorHandle} · {formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Caption & Title */}
          {post.title && (
            <h2 className="font-bold text-sm text-white mb-1 drop-shadow-sm leading-snug line-clamp-1">
              {post.title}
            </h2>
          )}

          {cleanCaption && (
            <div className="text-xs text-white/90 mb-2 leading-relaxed">
              <p className={cn("transition-all", !isExpanded && "line-clamp-2")}>{cleanCaption}</p>
              {cleanCaption.length > 90 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="text-[11px] font-bold text-white/70 hover:text-white mt-0.5 cursor-pointer underline"
                >
                  {isExpanded ? "less" : "more"}
                </button>
              )}
            </div>
          )}

          {/* Audio Waveform Ticker */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/80 overflow-hidden">
            <Music2 className="size-3.5 shrink-0 text-rose-400 animate-pulse" />
            <div className="truncate flex items-center gap-2">
              <span className="truncate">Original Audio · CampusLoop Campus Vibes</span>
            </div>
          </div>
        </div>

        {/* Video Progress Bar at the very bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
