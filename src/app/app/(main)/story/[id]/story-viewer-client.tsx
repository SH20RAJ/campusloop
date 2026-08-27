"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
Bookmark,
ChevronLeft,
ChevronRight,
Heart,
Loader2,
Plus,
Send,
Share2,
X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { toast } from "sonner";

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

  // Highlights Modal State
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlights, setHighlights] = useState<{ id: string; title: string; coverUrl?: string | null }[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState("");
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  // Auto-progress bar timer & auto-advance (pauses on touch/mouse hold or when typing)
  useEffect(() => {
    setProgress(0);
    const interval = 50;
    const duration = 7000; // 7 seconds
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      // Pause if user is holding, focused on reply, or has typed text
      if (isPaused || replyText.trim().length > 0 || showHighlightModal) return;

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (nextStoryId) {
            router.push(`/app/story/${nextStoryId}`);
          } else {
            router.push("/app");
          }
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [story.id, nextStoryId, router, isPaused, replyText, showHighlightModal]);

  // Keyboard left/right arrow navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (replyText.length > 0 || showHighlightModal) return;

      if (e.key === "ArrowLeft" && prevStoryId) {
        router.push(`/app/story/${prevStoryId}`);
      } else if (e.key === "ArrowRight") {
        if (nextStoryId) {
          router.push(`/app/story/${nextStoryId}`);
        } else {
          router.push("/app");
        }
      } else if (e.key === "Escape") {
        router.push("/app");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevStoryId, nextStoryId, router, replyText, showHighlightModal]);

  async function handleLike() {
    const nextLiked = !liked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      if (typeof window !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(20);
      }
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
      // Revert on error
      setLiked(!nextLiked);
      setLikesCount(likesCount);
    }
  }

  async function handleShare() {
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

    setIsReplying(true);
    try {
      // Send DM message to story author via chat endpoint
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

  const bgClass = story.backgroundColor || "bg-gradient-to-tr from-violet-600 to-indigo-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 md:bg-opacity-80 backdrop-blur-md select-none p-0 md:p-4 touch-manipulation">
      {/* Prev Arrow Button (Desktop) */}
      <button
        onClick={() => (prevStoryId ? router.push(`/app/story/${prevStoryId}`) : router.push("/app"))}
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
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          if (!replyText.trim()) setIsPaused(false);
        }}
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/85 z-10 pointer-events-none" />

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
                <p className="text-[10px] text-white/75 font-medium">
                  @{story.author.username} •{" "}
                  {new Date(story.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </Link>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Highlight Button for Owner */}
              {isOwner && (
                <button
                  type="button"
                  onClick={openHighlightModal}
                  className="h-8 px-2.5 rounded-full bg-black/45 hover:bg-black/65 border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-90"
                  title="Add to Highlights"
                >
                  <Bookmark className="size-3.5" />
                  <span className="hidden sm:inline">Highlight</span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => router.push("/app")}
                className="h-8 w-8 rounded-full bg-black/45 hover:bg-black/65 flex items-center justify-center text-white cursor-pointer outline-none border border-white/20 transition-all active:scale-90"
                aria-label="Close story"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Center: Story Text Content ─── */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 relative z-20 pointer-events-auto">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-relaxed max-w-[290px] break-words whitespace-pre-wrap select-text drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] text-white">
            {story.text || ""}
          </h2>
        </div>

        {/* ─── Bottom Controls: Like, Reply & Share ─── */}
        <div className="w-full p-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 z-20 pointer-events-auto">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            {/* Message Input: Pauses story timer while typing */}
            <input
              type="text"
              value={replyText}
              onFocus={() => setIsPaused(true)}
              onBlur={() => {
                if (!replyText.trim()) setIsPaused(false);
              }}
              onChange={(e) => {
                setReplyText(e.target.value);
                setIsPaused(true);
              }}
              placeholder={`Send message to @${story.author.username}...`}
              className="flex-1 h-10 rounded-full border border-white/30 bg-black/45 px-4 text-xs text-white placeholder:text-white/65 outline-none focus:border-white/70 focus:bg-black/65 backdrop-blur-md transition-all"
            />

            {replyText.trim() ? (
              <button
                type="submit"
                disabled={isReplying}
                className="h-10 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer shadow-md active:scale-95 transition-all shrink-0"
              >
                <Send className="size-3.5" /> Send
              </button>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Like Story Button with Counter Badge */}
                <button
                  type="button"
                  onClick={handleLike}
                  className={cn(
                    "h-10 px-3 rounded-full border border-white/30 flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-md",
                    liked
                      ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/30"
                      : "bg-black/45 text-white hover:bg-black/65"
                  )}
                  aria-label="Like story"
                >
                  <Heart className={cn("size-4.5", liked && "fill-white")} />
                  {likesCount > 0 && (
                    <span className="text-xs font-black tracking-tight">{likesCount}</span>
                  )}
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-10 w-10 rounded-full border border-white/30 bg-black/45 hover:bg-black/65 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-md"
                  aria-label="Share story"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ─── Add to Highlight Dialog Modal ─── */}
        {showHighlightModal && (
          <div
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4 animate-in slide-in-from-bottom duration-200"
            onClick={() => {
              setShowHighlightModal(false);
              setIsPaused(false);
            }}
          >
            <div
              className="bg-card text-card-foreground rounded-3xl p-5 space-y-4 max-h-[80%] overflow-y-auto border border-border/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="size-4.5 text-primary" />
                  <h3 className="text-sm font-black tracking-tight text-foreground">
                    Story Highlights
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightModal(false);
                    setIsPaused(false);
                  }}
                  className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Create New Highlight Input */}
              <form onSubmit={handleCreateNewHighlight} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Highlight name (e.g. Campus, Vibes)..."
                  value={newHighlightTitle}
                  onChange={(e) => setNewHighlightTitle(e.target.value)}
                  maxLength={30}
                  className="flex-1 h-9 rounded-full bg-muted/50 border border-border/50 px-3.5 text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!newHighlightTitle.trim() || isSavingHighlight}
                  className="h-9 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:bg-primary/90 disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Plus className="size-3.5" /> Create
                </button>
              </form>

              {/* Existing Highlights */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Save to existing
                </p>
                {isLoadingHighlights ? (
                  <div className="py-6 flex items-center justify-center text-xs text-muted-foreground gap-2">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading highlights...</span>
                  </div>
                ) : highlights.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {highlights.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleAddToExistingHighlight(h.id)}
                        disabled={isSavingHighlight}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-border/40 hover:bg-muted/40 transition-colors text-left cursor-pointer"
                      >
                        <div className="size-9 rounded-full bg-muted flex items-center justify-center border border-border/50 shrink-0 overflow-hidden">
                          {h.coverUrl ? (
                            <img src={h.coverUrl} alt={h.title} className="size-full object-cover" />
                          ) : (
                            <Bookmark className="size-4 text-primary" />
                          )}
                        </div>
                        <span className="text-xs font-bold truncate flex-1">{h.title}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">
                    No highlights yet. Create your first highlight above!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Arrow Button (Desktop) */}
      <button
        onClick={() => (nextStoryId ? router.push(`/app/story/${nextStoryId}`) : router.push("/app"))}
        className="hidden md:flex h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white items-center justify-center cursor-pointer transition-all ml-4 shadow-lg active:scale-90"
        aria-label="Next story"
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
