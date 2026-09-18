"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimateVideo } from "@/components/ui/animated-icon";
import type { FeedPost } from "@/hooks/use-feed";
import {
  fetcher,
  likeReel,
  repostPost,
  saveReel,
  toggleFollowUser,
  trackReelTelemetry,
} from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { isOnline } from "@/lib/presence";
import { sounds } from "@/lib/sounds";
import { useHlsVideo, pauseAllReelMedia } from "@/hooks/use-hls-video";
import { cn, formatTimeAgo, getAvatarUrl, getCollegeShortName } from "@/lib/utils";
import { extractVideoStreamInfo } from "@/lib/video/stream-helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";

const FastCommentsModal = dynamic(
  () => import("@/components/feed/fast-comments-modal").then((m) => m.FastCommentsModal),
  { ssr: false }
);
const FeedCardRepostModal = dynamic(
  () => import("@/components/feed/feed-card-repost-modal").then((m) => m.FeedCardRepostModal),
  { ssr: false }
);
const PostLikesModal = dynamic(
  () => import("@/components/post/post-likes-modal").then((m) => m.PostLikesModal),
  { ssr: false }
);

const HASHTAG_REGEX = /#[a-zA-Z0-9_]+/g;
const MD_VIDEO_REGEX = /!\[.*?\]\(((?:https?:\/\/[^\s)]+|\/api\/files\/r2\/[^\s)]+)(?:\.(?:mp4|webm|mov|ogg)[^\s)]*|[^\s)]*videos[^\s)]*))\)/i;
const R2_VIDEO_REGEX = /((?:https?:\/\/[^\s<>"']*)?\/api\/files\/r2\/videos\/[^\s<>"']+)/i;
const RAW_VIDEO_REGEX = /((?:https?:\/\/[^\s<>"']+|\/api\/files\/r2\/[^\s<>"']+)\.(?:mp4|webm|mov|ogg)[^\s<>"']*)/i;

interface ReelsFeedClientProps {
  initialPosts: FeedPost[];
  currentUserId?: string;
  collegeName?: string;
}

type FeedMode = "for_you" | "campus" | "fresh";

const FEED_MODES: Array<{ id: FeedMode; label: string; description: string }> = [
  { id: "for_you", label: "For you", description: "Personalized from what you watch" },
  { id: "campus", label: "Your campus", description: "Closer to your college community" },
  { id: "fresh", label: "Fresh", description: "Newest campus-first clips" },
];

const SEEN_STORAGE_KEY = "campusloop_seen_reels_v3";
const SEEN_COOKIE_NAME = "campusloop_seen_reels";

function getLocalSeenIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function syncSeenCookie(ids: string[]) {
  if (typeof document === "undefined") return;
  try {
    const slice = ids.slice(0, 160);
    document.cookie = `${SEEN_COOKIE_NAME}=${encodeURIComponent(slice.join(","))}; path=/; max-age=1209600; SameSite=Lax`;
  } catch {}
}

function recordLocalSeenId(id: string) {
  if (typeof window === "undefined" || !id) return;
  try {
    const clean = id.split("-cycle-")[0];
    const current = getLocalSeenIds().filter((item) => item !== clean);
    const next = [clean, ...current].slice(0, 1200);
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(next));
    syncSeenCookie(next);
  } catch {}
}

export function ReelsFeedClient({ initialPosts, currentUserId, collegeName }: ReelsFeedClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedMode, setFeedMode] = useState<FeedMode>("for_you");
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("campusloop_reels_muted");
      return saved === null ? true : saved === "true";
    }
    return true;
  });
  const [selectedPostForComments, setSelectedPostForComments] = useState<FeedPost | null>(null);
  const [selectedPostForRepost, setSelectedPostForRepost] = useState<FeedPost | null>(null);
  const [selectedPostForLikes, setSelectedPostForLikes] = useState<FeedPost | null>(null);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const isWheelingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const toggleMute = useCallback(() => {
    setIsMuted((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("campusloop_reels_muted", String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const stopMedia = () => pauseAllReelMedia();
    window.addEventListener("pagehide", stopMedia);
    window.addEventListener("beforeunload", stopMedia);
    return () => {
      stopMedia();
      window.removeEventListener("pagehide", stopMedia);
      window.removeEventListener("beforeunload", stopMedia);
    };
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!containerRef.current || index < 0 || index >= posts.length) return;
      isProgrammaticScrollRef.current = true;
      const target = containerRef.current.children[index] as HTMLElement | undefined;
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setActiveIndex(index);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 400);
    },
    [posts.length],
  );

  const fetchMode = useCallback(async (mode: FeedMode, nextPage = 1) => {
    const seen = getLocalSeenIds().slice(0, 160);
    const exclude = seen.length ? `&excludeIds=${encodeURIComponent(seen.join(","))}` : "";
    const data = await fetcher<{ posts?: FeedPost[]; reels?: unknown[] }>(
      `/api/reels?page=${nextPage}&limit=14&mode=${mode}${exclude}`,
    );
    return Array.isArray(data) ? data : data.posts || [];
  }, []);

  const switchFeedMode = useCallback(
    async (mode: FeedMode) => {
      if (mode === feedMode || isSwitchingMode) return;
      setIsSwitchingMode(true);
      try {
        const fresh = await fetchMode(mode, 1);
        setFeedMode(mode);
        setPosts(fresh);
        setPage(1);
        setActiveIndex(0);
        containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/app/reels");
      } catch {
        toast.error("Couldn't refresh this reel mix");
      } finally {
        setIsSwitchingMode(false);
      }
    },
    [feedMode, fetchMode, isSwitchingMode],
  );

  const loadMoreReels = useCallback(async () => {
    if (isLoadingMore || posts.length === 0) return;
    setIsLoadingMore(true);
    try {
      const inMemory = posts.map((post) => post.id.split("-cycle-")[0]);
      const localSeen = getLocalSeenIds();
      const exclude = Array.from(new Set([...localSeen, ...inMemory])).slice(0, 500);
      const query = exclude.length ? `&excludeIds=${encodeURIComponent(exclude.join(","))}` : "";
      const data = await fetcher<{ posts?: FeedPost[]; reels?: unknown[] }>(
        `/api/reels?page=${page + 1}&limit=14&mode=${feedMode}${query}`,
      );
      const fresh = (Array.isArray(data) ? data : data.posts || []).filter(
        (post) => !new Set(posts.map((item) => item.id.split("-cycle-")[0])).has(post.id.split("-cycle-")[0]),
      );
      if (fresh.length) {
        setPosts((current) => [...current, ...fresh]);
        setPage((current) => current + 1);
      }
    } catch {
      // Keep the current queue intact.
    } finally {
      setIsLoadingMore(false);
    }
  }, [feedMode, isLoadingMore, page, posts]);

  useEffect(() => {
    if (activeIndex >= posts.length - 3) {
      loadMoreReels();
    }
  }, [activeIndex, loadMoreReels, posts.length]);

  useEffect(() => {
    const active = posts[activeIndex];
    if (!active) return;
    const id = active.id.split("-cycle-")[0];
    recordLocalSeenId(id);
    if (window.location.pathname !== `/app/reels/${id}`) {
      window.history.replaceState(null, "", `/app/reels/${id}`);
    }
  }, [activeIndex, posts]);

  const handleNotInterested = useCallback(
    async (post: FeedPost) => {
      await trackReelTelemetry({
        postId: post.id,
        watchDurationMs: 0,
        videoDurationMs: 0,
        loopCount: 0,
        completed: false,
        skippedQuickly: true,
        action: "skip",
        tags: post.body.match(HASHTAG_REGEX)?.map((tag) => tag.slice(1)) || [],
        authorId: post.author?.id,
        institutionId: post.institutionId,
      });

      setPosts((current) => current.filter((item) => item.id !== post.id));
      setActiveIndex((index) => Math.max(0, Math.min(index, posts.length - 2)));
      toast.success("We'll tune your next reels from this");
    },
    [posts.length],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (selectedPostForComments || selectedPostForRepost || isWheelingRef.current) return;
      if (Math.abs(event.deltaY) < 28) return;
      isWheelingRef.current = true;
      if (event.deltaY > 0 && activeIndex < posts.length - 1) {
        scrollToIndex(activeIndex + 1);
      } else if (event.deltaY < 0 && activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      }
      setTimeout(() => {
        isWheelingRef.current = false;
      }, 420);
    },
    [activeIndex, posts.length, scrollToIndex, selectedPostForComments, selectedPostForRepost],
  );

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (selectedPostForComments || selectedPostForRepost) return;
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  }, [selectedPostForComments, selectedPostForRepost]);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (selectedPostForComments || selectedPostForRepost || touchStartYRef.current === null) return;
      const delta = touchStartYRef.current - (event.changedTouches[0]?.clientY ?? touchStartYRef.current);
      touchStartYRef.current = null;
      if (Math.abs(delta) < 45) return;
      if (delta > 0 && activeIndex < posts.length - 1) scrollToIndex(activeIndex + 1);
      if (delta < 0 && activeIndex > 0) scrollToIndex(activeIndex - 1);
    },
    [activeIndex, posts.length, scrollToIndex, selectedPostForComments, selectedPostForRepost],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedPostForComments || selectedPostForRepost) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "j") {
        event.preventDefault();
        if (activeIndex < posts.length - 1) scrollToIndex(activeIndex + 1);
      }
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (activeIndex > 0) scrollToIndex(activeIndex - 1);
      }
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, posts.length, scrollToIndex, selectedPostForComments, selectedPostForRepost, toggleMute]);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    if (!height) return;
    const nextIndex = Math.round(containerRef.current.scrollTop / height);
    if (nextIndex >= 0 && nextIndex < posts.length && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  }, [activeIndex, posts.length]);

  async function handleExecuteRepost(withCommentary: boolean) {
    if (!selectedPostForRepost) return;
    setIsReposting(true);
    try {
      await repostPost(selectedPostForRepost.id, withCommentary ? quoteThoughts : undefined);
      sounds.tap();
      haptics.repost();
      toast.success(withCommentary ? "Quote posted to your campus" : "Reel reposted to your campus");
      setSelectedPostForRepost(null);
      setQuoteThoughts("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to repost reel");
    } finally {
      setIsReposting(false);
    }
  }

  if (!posts.length) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-zinc-950 px-6 text-center text-white">
        <div className="max-w-md">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10">
            <Sparkles className="size-6 text-blue-300" />
          </div>
          <h1 className="mt-5 text-2xl font-black">You’ve seen the current campus mix.</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Switch to Fresh or Your campus for another set of clips.
          </p>
          <button
            type="button"
            onClick={() => switchFeedMode("fresh")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black"
          >
            Show fresh reels <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  const activeReel = posts[activeIndex];

  const repostAuthorHandle = selectedPostForRepost
    ? selectedPostForRepost.isAnonymous
      ? "anonymous"
      : selectedPostForRepost.author?.username || "campusloop"
    : "campusloop";

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#050607] text-white select-none">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link
            href="/app"
            className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-black/60"
            aria-label="Back to campus feed"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="pointer-events-auto hidden items-center gap-1 rounded-2xl border border-white/10 bg-black/45 p-1 backdrop-blur-xl md:flex">
            {FEED_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => switchFeedMode(mode.id)}
                disabled={isSwitchingMode}
                title={mode.description}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-bold transition",
                  feedMode === mode.id ? "bg-white text-black" : "text-white/65 hover:bg-white/10 hover:text-white",
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <div className="hidden rounded-2xl border border-white/10 bg-black/45 px-3 py-2 text-right backdrop-blur-xl sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{collegeName || "CampusLoop"}</p>
              <p className="text-[11px] font-bold text-white">{activeIndex + 1} <span className="text-white/35">/</span> {posts.length}</p>
            </div>
            <button
              type="button"
              onClick={() => { toggleMute(); haptics.light(); }}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-black/45 px-3 text-xs font-bold text-white backdrop-blur-xl transition hover:bg-black/60"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <VolumeX className="size-4 text-white/70" /> : <Volume2 className="size-4 text-emerald-300" />}
              <span className="hidden sm:inline">{isMuted ? "Sound off" : "Sound on"}</span>
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 max-w-7xl md:hidden">
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/45 p-1 backdrop-blur-xl no-scrollbar">
            {FEED_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => switchFeedMode(mode.id)}
                disabled={isSwitchingMode}
                className={cn(
                  "min-w-max rounded-xl px-4 py-2 text-xs font-bold transition",
                  feedMode === mode.id ? "bg-white text-black" : "text-white/65",
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
        aria-label="Campus reels"
        className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar overscroll-y-contain"
      >
        {posts.map((post, index) => (
          <SingleReelItem
            key={post.id}
            post={post}
            isActive={index === activeIndex}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onOpenComments={() => setSelectedPostForComments(post)}
            onOpenRepost={() => setSelectedPostForRepost(post)}
            onOpenLikes={() => setSelectedPostForLikes(post)}
            onNotInterested={() => handleNotInterested(post)}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      <div className="pointer-events-auto fixed bottom-8 right-5 z-40 hidden flex-col gap-2 md:flex">
        <button
          type="button"
          onClick={() => activeIndex > 0 && scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0 || isSwitchingMode}
          className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-black/60 disabled:opacity-30"
          aria-label="Previous reel"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => activeIndex < posts.length - 1 && scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === posts.length - 1 || isSwitchingMode}
          className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-black/45 text-white backdrop-blur-xl transition hover:bg-black/60 disabled:opacity-30"
          aria-label="Next reel"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>

      <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-bold text-white/65 backdrop-blur-xl lg:flex">
        <ArrowDown className="size-3.5" />
        Swipe or scroll for the next campus moment
      </div>

      {isSwitchingMode && (
        <div className="pointer-events-none fixed inset-0 z-60 grid place-items-center bg-black/25 backdrop-blur-[2px]">
          <div className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-xl">
            Finding a new mix…
          </div>
        </div>
      )}

      {selectedPostForComments && (
        <FastCommentsModal
          post={selectedPostForComments}
          isOpen
          onClose={() => setSelectedPostForComments(null)}
          onCommentCountChange={(newCount) => {
            setPosts((prev) =>
              prev.map((item) => (item.id === selectedPostForComments.id ? { ...item, commentsCount: newCount } : item)),
            );
          }}
        />
      )}

      {selectedPostForRepost && (
        <FeedCardRepostModal
          isOpen
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

      {selectedPostForLikes && (
        <PostLikesModal
          postId={selectedPostForLikes.id.split("-cycle-")[0]}
          isOpen
          onClose={() => setSelectedPostForLikes(null)}
          currentUserId={currentUserId}
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
  onOpenLikes: () => void;
  onNotInterested: () => void;
  currentUserId?: string;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

function SingleReelItem({
  post,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenRepost,
  onOpenLikes,
  onNotInterested,
  currentUserId,
}: SingleReelItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [isFollowing, setIsFollowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounce refs for double-tap detection without pausing video
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Behavioral tracking refs
  const watchStartTimeRef = useRef<number>(0);
  const loopCountRef = useRef<number>(0);
  const hasSentTelemetryRef = useRef<boolean>(false);

  // Extract hashtags from caption for affinity tracking
  const hashtags = useMemo(() => {
    const matches = post.body.match(HASHTAG_REGEX);
    return matches ? matches.map((t) => t.slice(1)) : [];
  }, [post.body]);

  // Extract raw video URL (markdown, direct URL, or external media reference)
  const rawVideoUrl = useMemo(() => {
    if (post.externalPost?.media && post.externalPost.media.length > 0) {
      const vidMedia = post.externalPost.media.find((m) => m.mediaType === "VIDEO");
      if (vidMedia?.mediaUrl) return vidMedia.mediaUrl;
    }

    if (!post.body) return null;
    const mdMatch = post.body.match(MD_VIDEO_REGEX);
    if (mdMatch) return mdMatch[1];

    const r2Match = post.body.match(R2_VIDEO_REGEX);
    if (r2Match) return r2Match[1];

    const rawMatch = post.body.match(RAW_VIDEO_REGEX);
    if (rawMatch) return rawMatch[1];

    return null;
  }, [post.body, post.externalPost]);

  // High quality streaming & audio stream resolution
  const streamInfo = useMemo(() => {
    return extractVideoStreamInfo(rawVideoUrl, post.externalPost?.media);
  }, [rawVideoUrl, post.externalPost]);

  const videoUrl = streamInfo?.hdVideoUrl || rawVideoUrl;

  // Integrated HLS & Synchronized Audio Engine
  const { isPlaying, usingHls, togglePlay } = useHlsVideo({
    videoRef,
    audioRef,
    hlsUrl: streamInfo?.hlsUrl,
    videoUrl: streamInfo?.hdVideoUrl || rawVideoUrl,
    audioUrl: streamInfo?.audioUrl,
    isActive,
    isMuted,
    loop: true,
  });

  // Stop & mute audio/video immediately when inactive or unmounted
  useEffect(() => {
    const elAudio = audioRef.current;
    const elVideo = videoRef.current;
    if (!isActive) {
      if (elAudio) {
        try {
          elAudio.pause();
          elAudio.currentTime = 0;
          elAudio.muted = true;
        } catch {}
      }
      if (elVideo) {
        try {
          elVideo.pause();
          elVideo.currentTime = 0;
          elVideo.muted = true;
        } catch {}
      }
    }
    return () => {
      if (elAudio) {
        try {
          elAudio.pause();
          elAudio.currentTime = 0;
          elAudio.muted = true;
        } catch {}
      }
      if (elVideo) {
        try {
          elVideo.pause();
          elVideo.currentTime = 0;
          elVideo.muted = true;
        } catch {}
      }
    };
  }, [isActive]);

  // Clean caption text
  const cleanCaption = useMemo(() => {
    if (!post.body) return "";
    return post.body
      .replace(/!\[.*?\]\(https?:\/\/[^\s)]+\)/gi, "")
      .replace(/https?:\/\/v\.redd\.it\/[^\s]+/gi, "")
      .replace(/https?:\/\/[^\s]+\.(?:mp4|webm|mov|m3u8)[^\s]*/gi, "")
      .trim();
  }, [post.body]);

  // Telemetry: Watch time & loop tracking
  const handleVideoEnded = useCallback(() => {
    loopCountRef.current += 1;
    haptics.light();
    // Flush telemetry beacon on video loop
    trackReelTelemetry({
      postId: post.id,
      watchDurationMs: Date.now() - watchStartTimeRef.current,
      videoDurationMs: (videoRef.current?.duration || 0) * 1000,
      loopCount: loopCountRef.current,
      completed: true,
      skippedQuickly: false,
      action: "loop",
      tags: hashtags,
      authorId: post.author?.id,
      institutionId: post.institutionId,
    });
  }, [post.id, post.author?.id, post.institutionId, hashtags]);

  useEffect(() => {
    if (isActive) {
      watchStartTimeRef.current = Date.now();
      loopCountRef.current = 0;
      hasSentTelemetryRef.current = false;
    } else {
      if (watchStartTimeRef.current > 0 && !hasSentTelemetryRef.current) {
        hasSentTelemetryRef.current = true;
        const watchDurationMs = Date.now() - watchStartTimeRef.current;
        const videoDurationMs = (videoRef.current?.duration || 0) * 1000;
        const completed =
          (videoDurationMs > 0 && watchDurationMs / videoDurationMs >= 0.85) ||
          loopCountRef.current > 0;
        const skippedQuickly = watchDurationMs < 2000 && loopCountRef.current === 0;

        trackReelTelemetry({
          postId: post.id,
          watchDurationMs,
          videoDurationMs,
          loopCount: loopCountRef.current,
          completed,
          skippedQuickly,
          action: skippedQuickly ? "skip" : completed ? "dwell" : undefined,
          tags: hashtags,
          authorId: post.author?.id,
          institutionId: post.institutionId,
        });
      }
    }

    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
  }, [isActive, post.id, post.author?.id, post.institutionId, hashtags]);

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
    togglePlay();
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 500);
    haptics.light();
  }

  // Video tap with 260ms debounce to separate single-tap toggle from double-tap like
  function handleVideoTap() {
    const now = getCurrentTimestamp();
    const diff = now - lastTapTimeRef.current;

    if (diff > 0 && diff < 280) {
      // Double tap detected: cancel single tap play toggle
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapTimeRef.current = 0;
      handleDoubleTapLike();
    } else {
      lastTapTimeRef.current = now;
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
      singleTapTimerRef.current = setTimeout(() => {
        handleTogglePlay();
        singleTapTimerRef.current = null;
      }, 260);
    }
  }

  useEffect(() => {
    setUserVote(post.userVote);
    setVotesCount(post.votesCount);
    setIsSaved(Boolean(post.isSaved));
  }, [post.id, post.userVote, post.votesCount, post.isSaved]);

  async function handleDoubleTapLike() {
    setShowDoubleTapHeart(true);
    haptics.heartbeat();
    sounds.pop();
    setTimeout(() => setShowDoubleTapHeart(false), 800);

    if (userVote !== 1) {
      setUserVote(1);
      setVotesCount((prev) => prev + 1);
      try {
        const res = await likeReel(post.id);
        if (typeof res.likesCount === "number") {
          setVotesCount(res.likesCount);
        }
      } catch {
        setUserVote(post.userVote);
        setVotesCount(post.votesCount);
      }
      trackReelTelemetry({
        postId: post.id,
        watchDurationMs: Date.now() - watchStartTimeRef.current,
        loopCount: loopCountRef.current,
        completed: false,
        skippedQuickly: false,
        action: "like",
        tags: hashtags,
        authorId: post.author?.id,
        institutionId: post.institutionId,
      });
    }
  }

  // Like button click
  async function handleLikeClick(e: React.MouseEvent) {
    e.stopPropagation();
    haptics.light();
    const willLike = userVote !== 1;
    setUserVote(willLike ? 1 : 0);
    setVotesCount((prev) => (willLike ? prev + 1 : Math.max(0, prev - 1)));
    if (willLike) sounds.pop();
    try {
      const res = await likeReel(post.id);
      if (typeof res.likesCount === "number") {
        setVotesCount(res.likesCount);
      }
      if (typeof res.isLiked === "boolean") {
        setUserVote(res.isLiked ? 1 : 0);
      }
    } catch {
      setUserVote(userVote);
      setVotesCount(votesCount);
    }
    if (willLike) {
      trackReelTelemetry({
        postId: post.id,
        watchDurationMs: Date.now() - watchStartTimeRef.current,
        loopCount: loopCountRef.current,
        completed: false,
        skippedQuickly: false,
        action: "like",
        tags: hashtags,
        authorId: post.author?.id,
        institutionId: post.institutionId,
      });
    }
  }

  // Bookmark / Save click (with backend persistence and optimistic rollback)
  async function handleSaveClick(e: React.MouseEvent) {
    e.stopPropagation();
    haptics.light();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await saveReel(post.id);
      sounds.pop();
      toast.success(nextSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
      trackReelTelemetry({
        postId: post.id,
        watchDurationMs: Date.now() - watchStartTimeRef.current,
        loopCount: loopCountRef.current,
        completed: false,
        skippedQuickly: false,
        action: nextSaved ? "save" : undefined,
        tags: hashtags,
        authorId: post.author?.id,
        institutionId: post.institutionId,
      });
    } catch {
      setIsSaved(!nextSaved);
      toast.error("Failed to update bookmark");
    }
  }

  // Follow Creator click
  async function handleFollowClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!authorHandle || authorHandle === "campusloop" || post.isAnonymous) return;
    if (!currentUserId) {
      toast.error("Sign in to follow campus creators");
      return;
    }
    haptics.light();
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    try {
      await toggleFollowUser(authorHandle, nextFollowing);
      sounds.tap();
      toast.success(nextFollowing ? `Following @${authorHandle}` : `Unfollowed @${authorHandle}`);
      if (nextFollowing) {
        trackReelTelemetry({
          postId: post.id,
          watchDurationMs: getCurrentTimestamp() - watchStartTimeRef.current,
          loopCount: loopCountRef.current,
          completed: false,
          skippedQuickly: false,
          action: "follow",
          tags: hashtags,
          authorId: post.author?.id,
          institutionId: post.institutionId,
        });
      }
    } catch {
      setIsFollowing(!nextFollowing);
      toast.error("Failed to update follow status");
    }
  }

  // Share click
  async function handleShareClick(e: React.MouseEvent) {
    e.stopPropagation();
    haptics.light();
    const origin = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
    const shareUrl = `${origin}/app/post/${post.id}`;
    trackReelTelemetry({
      postId: post.id,
      watchDurationMs: Date.now() - watchStartTimeRef.current,
      loopCount: loopCountRef.current,
      completed: false,
      skippedQuickly: false,
      action: "share",
      tags: hashtags,
      authorId: post.author?.id,
      institutionId: post.institutionId,
    });
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

  const isExternalReddit = Boolean(post.externalPost);
  const redditPermalink = post.externalPost?.permalink
    ? `https://reddit.com${post.externalPost.permalink}`
    : post.externalPost?.canonicalUrl || null;
  const authorName = post.isAnonymous
    ? post.pseudonym || "Anonymous Student"
    : post.author?.displayName || (isExternalReddit ? `r/${post.externalPost?.subreddit || "reddit"}` : "Student");
  const authorHandle = post.isAnonymous
    ? "anonymous"
    : post.author?.username || (isExternalReddit ? post.externalPost?.subreddit || "reddit" : "campusloop");
  const collegeTag = getCollegeShortName(post.institution);
  const authorIsOnline = !post.isAnonymous && isOnline(post.author?.lastSeenAt);

  return (
    <div className="h-[100dvh] w-full snap-start relative flex items-center justify-center bg-black overflow-hidden">
      {/* Blurred Ambient Background for Desktop */}
      {videoUrl && (
        <div
          className="hidden sm:block absolute inset-0 -z-10 blur-3xl opacity-25 scale-125 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${post.author?.avatarUrl || "/og-image.png"})` }}
        />
      )}

      {/* Centered 9:16 Reel Container */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[94dvh] sm:rounded-2xl sm:my-auto overflow-hidden bg-zinc-950 flex items-center justify-center shadow-2xl border sm:border-white/10">
        {/* Video Element & Companion Audio Fallback */}
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              playsInline
              loop
              preload="metadata"
              poster={post.externalPost?.media?.[0]?.thumbnailUrl || undefined}
              crossOrigin="anonymous"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onClick={handleVideoTap}
              className="w-full h-full object-cover cursor-pointer"
            />
            {isActive && streamInfo?.audioUrl && !usingHls && (
              <audio
                ref={audioRef}
                src={streamInfo.audioUrl}
                preload="auto"
                loop
                playsInline
                crossOrigin="anonymous"
                className="hidden"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/50 p-6 text-center">
            <AnimateVideo className="size-12 mb-3 text-white/30" />
            <p className="text-sm font-semibold">Video preview unavailable</p>
          </div>
        )}

        {/* Floating Sound / Mute Toggle Button on Video */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            haptics.light();
          }}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/15 transition-all active:scale-95 cursor-pointer shadow-lg group"
          title={isMuted ? "Tap to unmute sound" : "Tap to mute sound"}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <>
              <VolumeX className="size-4 text-rose-400" />
              <span className="text-[11px] font-semibold text-white/90 group-hover:text-white">Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="size-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-white/90 group-hover:text-white">Sound on</span>
            </>
          )}
        </button>

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
          <div className="flex flex-col items-center gap-1 group">
            <button
              type="button"
              onClick={handleLikeClick}
              className="flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-80 cursor-pointer"
              aria-label={userVote === 1 ? "Unlike" : "Like"}
            >
              <div
                className={cn(
                  "flex size-full items-center justify-center rounded-full transition-colors",
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
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenLikes();
              }}
              className="text-[12px] font-bold text-white drop-shadow-md hover:underline cursor-pointer transition-transform active:scale-95"
              title="See who liked this reel"
            >
              {votesCount > 0 ? votesCount.toLocaleString() : "0"}
            </button>
          </div>

          {/* Comments */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments();
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            aria-label="Comments"
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
            onClick={(e) => {
              e.stopPropagation();
              onOpenRepost();
            }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            aria-label="Repost"
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
            aria-label={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
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
            aria-label="Share reel"
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
              onClick={(e) => {
                e.stopPropagation();
                if (post.isAnonymous) {
                  e.preventDefault();
                  toast.info("Posted anonymously by a verified campus student");
                }
              }}
              className="relative shrink-0 active:scale-95 transition-transform"
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-500 relative">
                <Avatar className="size-9 border-2 border-black">
                  <AvatarImage src={getAvatarUrl(post.author?.avatarUrl, authorHandle)} />
                  <AvatarFallback className="bg-zinc-800 text-xs font-bold">
                    {authorName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!post.isAnonymous && !isExternalReddit && (
                  <PresenceDot
                    lastSeenAt={post.author?.lastSeenAt}
                    className="bottom-0 right-0 size-2.5 ring-black"
                  />
                )}
              </div>
            </Link>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={post.isAnonymous ? "#" : `/@${authorHandle}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.isAnonymous) {
                      e.preventDefault();
                      toast.info("Posted anonymously by a verified campus student");
                    }
                  }}
                  className="font-bold text-sm text-white hover:underline truncate flex items-center gap-1"
                >
                  <span>{authorName}</span>
                </Link>
                {isExternalReddit && (
                  <a
                    href={redditPermalink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold hover:bg-orange-500/30 transition-colors shrink-0"
                    title={`From r/${post.externalPost?.subreddit || "reddit"}`}
                  >
                    <span>r/{post.externalPost?.subreddit}</span>
                    <ExternalLink className="size-2.5 opacity-80" />
                  </a>
                )}
                {!post.isAnonymous && (
                  <BadgeCheck className="size-4 text-emerald-400 fill-emerald-400/20 shrink-0" />
                )}
                {collegeTag && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/20 uppercase tracking-wider">
                    {collegeTag}
                  </span>
                )}
                {authorIsOnline && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-white/60">
                  @{authorHandle} · {formatTimeAgo(post.createdAt)}
                </span>

                {/* Follow Creator Button */}
                {!post.isAnonymous &&
                  currentUserId &&
                  post.author &&
                  post.author.id !== currentUserId && (
                    <button
                      type="button"
                      onClick={handleFollowClick}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm",
                        isFollowing
                          ? "bg-white/20 text-white/90 hover:bg-white/30 border border-white/20"
                          : "bg-rose-500 hover:bg-rose-600 text-white border border-rose-400/30"
                      )}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="size-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="size-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
              </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded((prev) => !prev);
                  }}
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
              <span className="truncate">
                {isExternalReddit
                  ? `Reddit Audio · r/${post.externalPost?.subreddit || "campus"}`
                  : "Original Audio · CampusLoop Campus Vibes"}
              </span>
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
