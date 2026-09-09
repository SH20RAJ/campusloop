"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pause,
  Play,
  Repeat2,
  Share2,
  VenetianMask,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FeedCardRepostModal } from "@/components/feed/feed-card-repost-modal";
import { PostLikesModal } from "@/components/post/post-likes-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PollCard } from "@/components/ui/poll-card";
import { ReportDialog } from "@/components/ui/report-dialog";
import { RichText } from "@/components/ui/rich-text";
import { ShareStoryModal } from "@/components/ui/share-story-modal";
import type { FeedPost } from "@/hooks/use-feed";
import { repostPost, voteOnPost } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cleanSnippet, cn, formatTimeAgo, getAvatarUrl, getCollegeShortName } from "@/lib/utils";

interface PostReelCardProps {
  post: FeedPost;
  currentUserId?: string;
  onOpenComments: (post: FeedPost) => void;
  isActive?: boolean;
}

export function PostReelCard({ post, currentUserId, onOpenComments, isActive = false }: PostReelCardProps) {
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [isReposted, setIsReposted] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  // Video Reel State (Image 3)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayPauseRipple, setShowPlayPauseRipple] = useState(false);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  // Extract direct video URL if present in body
  const videoUrl = useMemo(() => {
    if (!post.body) return null;
    // Markdown video tag ![...](url.mp4)
    const mdMatch = post.body.match(/!\[.*?\]\((https?:\/\/[^\s)]+\.(?:mp4|webm|mov)[^\s)]*)\)/i);
    if (mdMatch) return mdMatch[1];

    // Raw video URL
    const rawMatch = post.body.match(/(https?:\/\/[^\s<>"']+\.(?:mp4|webm|mov)[^\s<>"']*)/i);
    if (rawMatch) return rawMatch[1];

    return null;
  }, [post.body]);

  // Clean body text by stripping raw video URL for caption display
  const captionText = useMemo(() => {
    if (!videoUrl) return post.body;
    return post.body
      .replace(new RegExp(`!\\[.*?\\]\\(${videoUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "gi"), "")
      .replace(videoUrl, "")
      .trim();
  }, [post.body, videoUrl]);

  // Split content into clean headline & body description and extract tags without duplication
  const { headline, descriptionText, tags } = useMemo(() => {
    const rawBody = post.body || "";
    let h = post.title || "";
    let desc = rawBody;

    if (!h) {
      if (rawBody.startsWith("# ")) {
        const firstLineEnd = rawBody.indexOf("\n");
        if (firstLineEnd !== -1) {
          h = rawBody.slice(2, firstLineEnd).trim();
          desc = rawBody.slice(firstLineEnd + 1).trim();
        } else {
          h = rawBody.slice(2).trim();
          desc = "";
        }
      } else {
        const doubleNewlineIdx = rawBody.indexOf("\n\n");
        if (doubleNewlineIdx > 0 && doubleNewlineIdx <= 55) {
          const candidateTitle = rawBody.slice(0, doubleNewlineIdx).trim();
          if (
            !candidateTitle.endsWith(".") &&
            !candidateTitle.endsWith("?") &&
            !candidateTitle.endsWith("!")
          ) {
            h = candidateTitle;
            desc = rawBody.slice(doubleNewlineIdx + 2).trim();
          }
        }
      }
    }

    // Strip trailing hashtags block from description text to prevent duplicate display
    const cleanedDesc = desc.replace(/(\n\s*(?:#[\w-]+\s*)+)$/g, "").trim();

    // Extract hashtags from body
    const rawFoundTags = (rawBody.match(/#([a-zA-Z0-9_-]+)/g) || []).map((t) => t.trim());
    const uniqueTags = Array.from(new Set(rawFoundTags));

    if (uniqueTags.length === 0) {
      const lower = rawBody.toLowerCase();
      if (
        lower.includes("exam") ||
        lower.includes("mid-sem") ||
        lower.includes("study") ||
        lower.includes("productive")
      ) {
        uniqueTags.push("#Academics", "#Productivity", "#StudentLife");
      } else if (
        lower.includes("crush") ||
        lower.includes("dating") ||
        lower.includes("love") ||
        post.type === "CONFESSION"
      ) {
        uniqueTags.push("#Confessions", "#CampusCrush", "#StudentLife");
      } else if (
        lower.includes("mess") ||
        lower.includes("food") ||
        lower.includes("canteen") ||
        lower.includes("hostel")
      ) {
        uniqueTags.push("#HostelDiaries", "#CampusFood", "#StudentLife");
      } else {
        uniqueTags.push("#CampusLife", "#Discussion", "#StudentLife");
      }
    }

    return { headline: h, descriptionText: cleanedDesc, tags: uniqueTags.slice(0, 3) };
  }, [post.body, post.title, post.type]);

  useEffect(() => {
    setUserVote(post.userVote);
    setVotesCount(post.votesCount);
    setCommentsCount(post.commentsCount);
    setIsSaved(Boolean(post.isSaved));
  }, [post.userVote, post.votesCount, post.commentsCount, post.isSaved]);

  // Video Autoplay & Pause when card is active/inactive
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, videoUrl]);

  // Video time update progress
  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);
  }

  // Toggle Video Play / Pause on tap
  function handleTogglePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayPauseRipple(true);
    setTimeout(() => setShowPlayPauseRipple(false), 600);
  }

  function handleToggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    sounds.tap();
  }

  const authorName = post.isAnonymous
    ? post.pseudonym || "Anonymous Student"
    : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? post.pseudonym || "anonymous" : post.author?.username || "student";
  const avatarFallback: React.ReactNode = post.isAnonymous ? (
    <VenetianMask className="size-4 text-purple-400" />
  ) : (
    (post.author?.displayName?.[0] ?? "S")
  );
  const avatarUrl = post.isAnonymous
    ? ""
    : getAvatarUrl(post.author?.avatarUrl, post.author?.username ?? "student");

  // Vote / Like handling
  async function handleVote(reactionEmoji?: string) {
    const isUpvoted = userVote === 1;
    const newValue = isUpvoted && !reactionEmoji ? 0 : 1;
    const newCount = isUpvoted && !reactionEmoji ? votesCount - 1 : isUpvoted ? votesCount : votesCount + 1;

    sounds.pop();
    haptics.medium();

    setUserVote(newValue);
    setVotesCount(newCount);
    if (reactionEmoji) {
      toast.success(`Reacted ${reactionEmoji}`);
    }

    try {
      const data = await voteOnPost(post.id, newValue);
      setUserVote(data.userVote);
    } catch {
      setUserVote(userVote);
      setVotesCount(votesCount);
    }
  }

  // Double-tap heart (Instagram Reels style)
  function handleDoubleTap(e: React.MouseEvent) {
    e.stopPropagation();
    setShowDoubleTapHeart(true);
    sounds.pop();
    haptics.success();
    if (userVote !== 1) {
      handleVote();
    }
    setTimeout(() => setShowDoubleTapHeart(false), 850);
  }

  // Repost handling
  async function handleExecuteRepost(isQuote: boolean) {
    sounds.tap();
    haptics.medium();
    setIsReposting(true);
    try {
      await repostPost(post.id, isQuote ? quoteThoughts : undefined);
      setIsReposted(true);
      setShowRepostModal(false);
      setQuoteThoughts("");
      toast.success(isQuote ? "Quote posted to your campus timeline!" : "Loop reposted!");
    } catch {
      toast.error("Failed to repost.");
    } finally {
      setIsReposting(false);
    }
  }

  // Share handling
  function handleShare() {
    sounds.tap();
    haptics.light();
    const shareUrl = `https://campusloop.space/app/post/${post.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Loop by ${authorName} on CampusLoop`,
          text: cleanSnippet(post.body, 100),
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Loop link copied to clipboard!");
    }
  }

  // Bookmark handling
  async function handleToggleSave() {
    sounds.tap();
    haptics.light();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    toast.success(nextSaved ? "Saved to your bookmarks" : "Removed from bookmarks");
    try {
      await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
    } catch {
      setIsSaved(!nextSaved);
    }
  }

  // Author follow toggle
  async function handleToggleFollowAuthor(e: React.MouseEvent) {
    e.stopPropagation();
    if (!post.authorId || post.isAnonymous || !authorHandle) return;
    const nextFollow = !isFollowingAuthor;
    setIsFollowingAuthor(nextFollow);
    sounds.tap();
    try {
      const endpoint = `/api/profile/${encodeURIComponent(authorHandle)}/follow`;
      const res = await fetch(endpoint, {
        method: nextFollow ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to follow");
      if (nextFollow) {
        toast.success(`Following @${authorHandle}`);
      }
    } catch {
      setIsFollowingAuthor(!nextFollow);
    }
  }

  // Reusable side actions column
  const renderSideActionRail = () => (
    <div className="absolute right-3 sm:right-6 bottom-4 sm:bottom-6 z-30 flex flex-col items-center gap-3.5 select-none shrink-0 text-foreground">
      {/* 1. Like */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => handleVote()}
          aria-label="Like post"
          className={cn(
            "size-11 sm:size-12 rounded-full border bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
            userVote === 1
              ? "border-rose-500/40 text-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              : "border-white/10 text-white/90 hover:text-white hover:bg-white/10"
          )}
        >
          <Heart
            className={cn(
              "size-5 sm:size-5.5",
              userVote === 1 ? "fill-rose-500 text-rose-500" : "text-rose-500 fill-rose-500/20"
            )}
          />
        </button>
        <span className="text-[11px] sm:text-xs font-bold text-white/80 tabular-nums">{votesCount}</span>
      </div>

      {/* 2. Comment */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => onOpenComments(post)}
          aria-label="Comment"
          className="size-11 sm:size-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer text-white/90 hover:text-white hover:bg-white/10"
        >
          <MessageCircle className="size-5 sm:size-5.5" />
        </button>
        <span className="text-[11px] sm:text-xs font-bold text-white/80 tabular-nums">{commentsCount}</span>
      </div>

      {/* 3. Repost / Loop */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => setShowRepostModal(true)}
          aria-label="Loop post"
          className={cn(
            "size-11 sm:size-12 rounded-full border bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
            isReposted
              ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              : "border-white/10 text-white/90 hover:text-white hover:bg-white/10"
          )}
        >
          <Repeat2 className={cn("size-5 sm:size-5.5", isReposted && "rotate-180")} />
        </button>
        <span className="text-[10px] font-bold text-white/60">Loop</span>
      </div>

      {/* 4. Bookmark */}
      <button
        type="button"
        onClick={handleToggleSave}
        aria-label="Bookmark"
        className={cn(
          "size-11 sm:size-12 rounded-full border bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
          isSaved
            ? "border-primary/40 text-primary fill-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            : "border-white/10 text-white/90 hover:text-white hover:bg-white/10"
        )}
      >
        <Bookmark className={cn("size-5", isSaved && "fill-primary")} />
      </button>

      {/* 5. Share */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share"
        className="size-11 sm:size-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shadow-lg hover:scale-110 active:scale-90"
      >
        <Share2 className="size-5" />
      </button>

      {/* 6. More Options */}
      <button
        type="button"
        onClick={() => setShowReport(true)}
        aria-label="More options"
        className="size-11 sm:size-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shadow-lg hover:scale-105 active:scale-95"
      >
        <MoreHorizontal className="size-5" />
      </button>
    </div>
  );

  const renderModals = () => (
    <>
      <FeedCardRepostModal
        isOpen={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        quoteThoughts={quoteThoughts}
        setQuoteThoughts={setQuoteThoughts}
        onExecuteRepost={handleExecuteRepost}
        originalPostAuthorHandle={authorHandle}
        isReposting={isReposting}
      />
      <ShareStoryModal
        isOpen={showShareStoryModal}
        onClose={() => setShowShareStoryModal(false)}
        post={post}
      />
      <PostLikesModal postId={post.id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} />
      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
    </>
  );

  // ─── PURE INSTAGRAM REELS VIDEO LAYOUT ───
  if (videoUrl) {
    return (
      <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center overflow-hidden select-none">
        <div
          onDoubleClick={handleDoubleTap}
          onClick={handleTogglePlay}
          className="relative w-full h-full sm:max-w-[420px] sm:max-h-[calc(100vh-140px)] sm:rounded-3xl overflow-hidden bg-black flex items-center justify-center cursor-pointer select-none"
        >
          {/* 9:16 Video Player */}
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          />

          {/* Double Tap Heart Animation */}
          <AnimatePresence>
            {showDoubleTapHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
              >
                <div className="rounded-full bg-black/40 p-6 backdrop-blur-md">
                  <Heart className="size-20 fill-rose-500 text-rose-500 drop-shadow-lg animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tap Play/Pause Ripple Indicator */}
          <AnimatePresence>
            {showPlayPauseRipple && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
              >
                <div className="size-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  {isPlaying ? (
                    <Play className="size-7 fill-white ml-0.5" />
                  ) : (
                    <Pause className="size-7 fill-white" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="absolute top-4 right-4 z-30 size-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          {/* Bottom Gradient & Author/Caption Info */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 pb-3 pr-16 text-white space-y-2 pointer-events-auto">
            {/* Author details */}
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9 border-2 border-white/40 shrink-0">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-xs sm:text-sm truncate drop-shadow-sm">{authorName}</span>
                {!post.isAnonymous && <BadgeCheck className="size-3.5 text-primary shrink-0" />}
              </div>

              {!post.isAnonymous && post.authorId && post.authorId !== currentUserId && (
                <button
                  type="button"
                  onClick={handleToggleFollowAuthor}
                  className={cn(
                    "ml-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none",
                    isFollowingAuthor
                      ? "bg-white/20 border-white/30 text-white"
                      : "bg-white text-black border-white hover:bg-white/90"
                  )}
                >
                  {isFollowingAuthor ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Caption */}
            {captionText && (
              <div className="text-xs text-white/90 leading-relaxed">
                <p className={cn("transition-all", !isExpandedCaption && "line-clamp-2")}>{captionText}</p>
                {captionText.length > 90 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpandedCaption((prev) => !prev);
                    }}
                    className="text-[11px] font-bold text-white/70 hover:text-white mt-0.5 cursor-pointer"
                  >
                    {isExpandedCaption ? "Show less" : "...more"}
                  </button>
                )}
              </div>
            )}

            {/* Campus Line */}
            {post.institution && (
              <p className="text-[10px] text-white/60 font-medium">
                {post.institution.name.split(",")[0]} · {formatTimeAgo(new Date(post.createdAt))}
              </p>
            )}

            {/* Video Progress Scrub Bar */}
            <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {renderSideActionRail()}
        {renderModals()}
      </div>
    );
  }

  // ─── IMMERSIVE FULL-PAGE REEL (BORDERLESS & RESPONSIVE TO ALL LENGTHS) ───
  return (
    <div
      onDoubleClick={handleDoubleTap}
      className="relative w-full h-full flex flex-col justify-between px-4 py-3 sm:px-8 sm:py-5 max-w-2xl mx-auto select-none overflow-hidden"
    >
      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.3, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
          >
            <div className="rounded-full bg-black/40 p-6 backdrop-blur-md">
              <Heart className="size-20 fill-rose-500 text-rose-500 drop-shadow-lg animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Author Header ─── */}
      <div className="flex items-center justify-between gap-3 min-w-0 pr-16 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={post.isAnonymous ? "#" : `/@${authorHandle}`}
            onClick={(e) => {
              if (post.isAnonymous) e.preventDefault();
              e.stopPropagation();
            }}
            className="relative shrink-0 group"
          >
            <Avatar className="size-10 sm:size-11 border border-white/20 shadow-md">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
              <AvatarFallback className="bg-purple-950 text-purple-200 font-black text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm sm:text-base text-foreground truncate max-w-[150px] sm:max-w-[240px]">
                {authorName}
              </span>
              {!post.isAnonymous && (
                <BadgeCheck className="size-4 text-purple-400 fill-purple-400/20 shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              {authorHandle && (
                <span className="truncate max-w-[120px] text-muted-foreground/90 font-medium">
                  @{authorHandle}
                </span>
              )}
              <span className="text-muted-foreground/40 shrink-0">·</span>
              <span className="text-muted-foreground/90 shrink-0 whitespace-nowrap font-medium">
                {formatTimeAgo(new Date(post.createdAt))}
              </span>
            </div>

            {post.institution?.name && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 mt-0.5 min-w-0">
                <span className="size-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0" />
                <span className="truncate font-medium text-foreground/85 max-w-[200px]">
                  {getCollegeShortName(post.institution)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Follow Button if not own post and not anonymous */}
        {!post.isAnonymous && post.authorId && currentUserId !== post.authorId && (
          <button
            type="button"
            onClick={handleToggleFollowAuthor}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shrink-0 shadow-xs",
              isFollowingAuthor
                ? "bg-white/10 text-white/80 hover:bg-white/15 border border-white/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            )}
          >
            {isFollowingAuthor ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* ─── Main Content Body (Natural top-aligned scroll, full reading without clipping) ─── */}
      <div className="flex-1 min-h-0 flex flex-col justify-start overflow-y-auto no-scrollbar pr-14 sm:pr-16 space-y-3 sm:space-y-4 py-3">
        {headline && (
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-foreground tracking-tight leading-snug">
            {headline}
          </h2>
        )}

        {descriptionText && (
          <div
            className={cn(
              "leading-relaxed font-normal text-foreground/95",
              descriptionText.length < 140
                ? "text-base sm:text-lg md:text-xl font-medium"
                : descriptionText.length < 300
                  ? "text-sm sm:text-base md:text-lg"
                  : "text-xs sm:text-sm md:text-base"
            )}
          >
            <RichText
              content={descriptionText}
              createdAt={post.createdAt}
              collegeName={getCollegeShortName(post.institution)}
            />
          </div>
        )}

        {/* Embedded Repost */}
        {post.repostOf && Boolean(post.repostComment) && post.body?.trim() !== post.repostOf.body?.trim() && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-3.5 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <span className="font-bold text-foreground">
                @{post.repostOf.author?.username || "student"}
              </span>
              {post.repostOf.institution && (
                <>
                  <span>·</span>
                  <span>{getCollegeShortName(post.repostOf.institution)}</span>
                </>
              )}
            </div>
            <p className="text-foreground/90 line-clamp-3 leading-relaxed">{post.repostOf.body}</p>
          </div>
        )}

        {/* Poll Component */}
        {post.type === "POLL" && post.pollOptions && (
          <div className="pt-1">
            <PollCard post={post} />
          </div>
        )}

        {/* Hashtags / Topic Tags (Rendered cleanly ONCE) */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {tags.map((tag, idx) => (
              <span
                key={tag}
                className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full transition-all select-none",
                  idx === 0
                    ? "bg-purple-950/70 border border-purple-500/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                    : "bg-white/5 border border-white/10 text-white/80"
                )}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {renderSideActionRail()}
      {renderModals()}
    </div>
  );
}
