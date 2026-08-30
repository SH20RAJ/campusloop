"use client";

import { Bookmark, ChevronLeft, ChevronRight, Heart, Loader2, Plus, Send, Share2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface StoryViewerClientProps {
  story: {
    id: string;
    mediaUrl: string | null;
    text: string | null;
    backgroundColor: string | null;
    createdAt: string;
    expiresAt: string;
    author: {
      id: string;
      displayName: string;
      username: string;
      avatarUrl: string | null;
      institution?: { name: string } | null;
    };
  };
  currentUserId: string;
  prevStoryId?: string | null;
  nextStoryId?: string | null;
  initialLiked?: boolean;
  initialLikesCount?: number;
}

export function StoryViewerClient({
  story,
  prevStoryId,
  nextStoryId,
  currentUserId,
  initialLiked = false,
  initialLikesCount = 0,
}: StoryViewerClientProps) {
  const router = useRouter();
  const isOwner = story.author.id === currentUserId;

  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch Swipe Gesture Tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Highlights Modal State
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlights, setHighlights] = useState<{ id: string; title: string; coverUrl?: string | null }[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState("");
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  const navigatePrev = useCallback(() => {
    if (prevStoryId) {
      sounds.pop();
      haptics.light();
      router.push(`/app/story/${prevStoryId}`);
    } else {
      sounds.tap();
      haptics.light();
      router.push("/app");
    }
  }, [prevStoryId, router]);

  const navigateNext = useCallback(() => {
    if (nextStoryId) {
      sounds.pop();
      haptics.light();
      router.push(`/app/story/${nextStoryId}`);
    } else {
      sounds.tap();
      haptics.light();
      router.push("/app");
    }
  }, [nextStoryId, router]);

  const closeViewer = useCallback(() => {
    sounds.tap();
    haptics.light();
    router.push("/app");
  }, [router]);

  // Auto-progress bar timer & auto-advance (pauses on touch/mouse hold or when typing)
  useEffect(() => {
    setProgress(0);
    const interval = 50;
    const duration = 7000; // 7 seconds
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      if (isPaused || replyText.trim().length > 0 || showHighlightModal) return;

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigateNext();
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, replyText, showHighlightModal, navigateNext]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (replyText.length > 0 || showHighlightModal) return;

      if (e.key === "ArrowLeft") {
        navigatePrev();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        navigateNext();
      } else if (e.key === "Escape") {
        closeViewer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigatePrev, navigateNext, closeViewer, replyText, showHighlightModal]);

  // Touch Swipe Handlers
  function handleTouchStart(e: React.TouchEvent) {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!replyText.trim()) setIsPaused(false);

    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Swipe down to dismiss
    if (deltaY > 80 && Math.abs(deltaY) > Math.abs(deltaX)) {
      closeViewer();
      return;
    }

    // Horizontal swipes
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next story
        navigateNext();
      } else {
        // Swiped Right -> Prev story
        navigatePrev();
      }
      return;
    }

    // Fast Tap detection (< 250ms and small displacement)
    if (duration < 250 && Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      const screenWidth = window.innerWidth;
      const tapX = touchEndX;
      if (tapX < screenWidth * 0.35) {
        navigatePrev();
      } else {
        navigateNext();
      }
    }
  }

  async function handleLike() {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      sounds.pop();
      haptics.heartbeat();
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    } else {
      haptics.light();
    }

    try {
      const res = await fetch(`/api/stories/${story.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { liked?: boolean; likesCount: number };
      if (typeof data.liked === "boolean") {
        setLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch {
      setLiked(!nextLiked);
      setLikesCount(likesCount);
    }
  }

  async function handleShare() {
    sounds.tap();
    haptics.light();
    const url = `https://campusloop.space/app/story/${story.id}`;
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${story.author.displayName}'s Campus Vibe`,
          text: `Check out this 24h campus vibe from @${story.author.username} on CampusLoop:`,
          url,
        });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    navigator.clipboard.writeText(url);
    toast.success("Story link copied to clipboard! 🚀");
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || isReplying) return;

    sounds.send();
    haptics.success();
    setIsReplying(true);
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: story.author.id,
          content: `Replied to your story: "${replyText.trim()}"`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      toast.success(`Reply sent to @${story.author.username}! 💬`);
      setReplyText("");
      setIsPaused(false);
    } catch {
      toast.error("Could not send reply. Try messaging directly.");
    } finally {
      setIsReplying(false);
    }
  }

  async function openHighlightModal() {
    setIsPaused(true);
    setShowHighlightModal(true);
    setIsLoadingHighlights(true);
    try {
      const res = await fetch("/api/highlights");
      if (res.ok) {
        const data = (await res.json()) as { id: string; title: string; coverUrl?: string | null }[];
        setHighlights(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHighlights(false);
    }
  }

  async function handleAddToExistingHighlight(highlightId: string, currentStoryIds: string[] = []) {
    setIsSavingHighlight(true);
    try {
      const updatedStoryIds = Array.from(new Set([...currentStoryIds, story.id]));
      const res = await fetch(`/api/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: highlights.find((h) => h.id === highlightId)?.title || "Highlight",
          storyIds: updatedStoryIds,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Added to Highlight! ⭐");
      setShowHighlightModal(false);
      setIsPaused(false);
    } catch {
      toast.error("Failed to add to highlight");
    } finally {
      setIsSavingHighlight(false);
    }
  }

  async function handleCreateNewHighlight(e: React.FormEvent) {
    e.preventDefault();
    if (!newHighlightTitle.trim() || isSavingHighlight) return;

    setIsSavingHighlight(true);
    try {
      const res = await fetch(`/api/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newHighlightTitle.trim(),
          coverUrl: story.mediaUrl || null,
          storyIds: [story.id],
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(`Created highlight "${newHighlightTitle}"! ⭐`);
      setShowHighlightModal(false);
      setNewHighlightTitle("");
      setIsPaused(false);
    } catch {
      toast.error("Failed to create highlight");
    } finally {
      setIsSavingHighlight(false);
    }
  }

  const bgClass = story.backgroundColor || "bg-linear-to-tr from-violet-600 to-indigo-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-85 backdrop-blur-md select-none p-0 md:p-4 touch-manipulation">
      {/* Prev Arrow Control (Desktop & Tablet) */}
      <button
        onClick={navigatePrev}
        className="hidden md:flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white items-center justify-center cursor-pointer transition-all mr-4 shadow-lg active:scale-90"
        aria-label="Previous story"
      >
        <ChevronLeft className="size-6" />
      </button>

      {/* Story Mobile Container Canvas */}
      <div
        className="relative w-full h-full md:h-[680px] md:w-[390px] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => {
          if (!replyText.trim()) setIsPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleLike}
      >
        {/* Visual Background: Image or Vibrant Gradient */}
        {story.mediaUrl ? (
          <img
            src={story.mediaUrl}
            alt="Story Media"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className={cn("absolute inset-0 w-full h-full z-0", bgClass)} />
        )}

        {/* Dark Vignette Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/65 via-transparent to-black/85 z-10 pointer-events-none" />

        {/* Double-Click Animated Floating Heart Burst */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-in zoom-in-50 fade-in duration-200">
            <Heart className="size-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_24px_rgba(244,63,94,0.8)] animate-bounce" />
          </div>
        )}

        {/* ─── Top Header: Progress Bars & Author Profile ─── */}
        <div className="relative z-20 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex flex-col gap-2.5 w-full pointer-events-auto">
          {/* Segmented Progress Bar */}
          <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-xs">
            <div
              className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between w-full">
            <Link
              href={`/@${story.author.username}`}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <Avatar className="h-9 w-9 border-2 border-white/40 shadow-md">
                <AvatarImage src={story.author.avatarUrl || ""} />
                <AvatarFallback className="text-xs font-bold bg-white text-primary">
                  {story.author.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1 leading-tight">
                  <span>{story.author.displayName}</span>
                  {story.author.institution && (
                    <span className="text-[10px] font-normal text-white/80">
                      • {story.author.institution.name.split(",")[0]}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-white/70">@{story.author.username}</p>
              </div>
            </Link>

            {/* Close Button */}
            <button
              onClick={closeViewer}
              className="h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-colors active:scale-90"
              aria-label="Close story"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* ─── Story Text & Interactive Stickers Content ─── */}
        <div className="relative z-20 flex-1 flex items-center justify-center p-6 text-center pointer-events-none">
          {story.text && (
            <div className="max-w-[320px] space-y-3">
              <p
                className={cn(
                  "text-xl sm:text-2xl font-black tracking-tight leading-relaxed break-words whitespace-pre-wrap drop-shadow-2xl text-white",
                  story.mediaUrl
                    ? "bg-black/50 px-4 py-2.5 rounded-2xl backdrop-blur-md border border-white/15 inline-block"
                    : ""
                )}
              >
                {story.text}
              </p>
            </div>
          )}
        </div>

        {/* ─── Mobile Tap / Arrow Floating Guides ─── */}
        <div className="absolute inset-y-24 left-0 w-1/3 z-15 cursor-pointer opacity-0 hover:opacity-10 transition-opacity flex items-center pl-2 pointer-events-auto">
          <div
            onClick={navigatePrev}
            className="h-10 w-10 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-xs"
          >
            <ChevronLeft className="size-5" />
          </div>
        </div>
        <div className="absolute inset-y-24 right-0 w-1/3 z-15 cursor-pointer opacity-0 hover:opacity-10 transition-opacity flex items-center justify-end pr-2 pointer-events-auto">
          <div
            onClick={navigateNext}
            className="h-10 w-10 rounded-full bg-black/30 text-white flex items-center justify-center backdrop-blur-xs"
          >
            <ChevronRight className="size-5" />
          </div>
        </div>

        {/* ─── Bottom Actions Bar (Reply / Like / Share / Highlight) ─── */}
        <div className="relative z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center gap-2 w-full bg-linear-to-t from-black/80 to-transparent pointer-events-auto">
          {!isOwner ? (
            <form onSubmit={handleSendReply} className="flex-1 relative flex items-center">
              <input
                type="text"
                placeholder={`Reply to ${story.author.displayName.split(" ")[0]}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => {
                  if (!replyText.trim()) setIsPaused(false);
                }}
                className="w-full h-10 rounded-full bg-white/15 border border-white/20 pl-4 pr-10 text-xs text-white placeholder:text-white/60 focus:outline-none focus:border-white/60 backdrop-blur-md transition-colors"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isReplying}
                className="absolute right-1.5 h-7 w-7 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-0 transition-opacity cursor-pointer active:scale-90"
              >
                {isReplying ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
              </button>
            </form>
          ) : (
            <div className="flex-1">
              <button
                onClick={openHighlightModal}
                className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-white hover:bg-white/25 backdrop-blur-md transition-colors cursor-pointer active:scale-95"
              >
                <Bookmark className="size-3.5" />
                <span>Add to Highlight</span>
              </button>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={cn(
              "h-10 px-3 rounded-full flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-90 cursor-pointer",
              liked
                ? "bg-rose-500/30 border border-rose-500/50 text-rose-400"
                : "bg-white/15 border border-white/20 text-white hover:bg-white/25"
            )}
          >
            <Heart
              className={cn(
                "size-4.5 transition-transform",
                liked && "fill-rose-500 text-rose-500 scale-110"
              )}
            />
            {likesCount > 0 && <span className="text-xs font-bold">{likesCount}</span>}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="h-10 w-10 rounded-full bg-white/15 border border-white/20 text-white hover:bg-white/25 flex items-center justify-center backdrop-blur-md transition-colors active:scale-90 cursor-pointer"
            aria-label="Share story"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Next Arrow Control (Desktop & Tablet) */}
      <button
        onClick={navigateNext}
        className="hidden md:flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white items-center justify-center cursor-pointer transition-all ml-4 shadow-lg active:scale-90"
        aria-label="Next story"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* ─── Highlights Management Modal ─── */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <Bookmark className="size-4 text-amber-400" />
                <span>Story Highlights</span>
              </h3>
              <button
                onClick={() => {
                  setShowHighlightModal(false);
                  setIsPaused(false);
                }}
                className="h-7 w-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Existing Highlights */}
            {isLoadingHighlights ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="size-6 animate-spin text-neutral-500" />
              </div>
            ) : highlights.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {highlights.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleAddToExistingHighlight(h.id)}
                    disabled={isSavingHighlight}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 text-left transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold">{h.title}</span>
                    <Plus className="size-3.5 text-neutral-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 text-center py-2">
                No highlights created yet. Make your first one below!
              </p>
            )}

            {/* Create New Highlight Form */}
            <form onSubmit={handleCreateNewHighlight} className="space-y-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                placeholder="Highlight title (e.g. Campus Fest 2026)..."
                value={newHighlightTitle}
                onChange={(e) => setNewHighlightTitle(e.target.value)}
                maxLength={30}
                className="w-full h-9 rounded-xl bg-neutral-800 border border-neutral-700 px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!newHighlightTitle.trim() || isSavingHighlight}
                className="w-full h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSavingHighlight ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    <span>Create & Add Story</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
