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
  Volume2,
  VolumeX,
} from "lucide-react";
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
import { cleanSnippet, cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface PostReelCardProps {
  post: FeedPost;
  currentUserId?: string;
  onOpenComments: (post: FeedPost) => void;
  isActive?: boolean;
}

const QUICK_REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "😂", label: "Haha" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😮", label: "Wow" },
  { emoji: "💯", label: "100" },
];

export function PostReelCard({ post, currentUserId, onOpenComments, isActive = false }: PostReelCardProps) {
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [isReposted, setIsReposted] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showReactionTray, setShowReactionTray] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

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
  const avatarFallback = post.isAnonymous ? "🎭" : (post.author?.displayName?.[0] ?? "S");
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
      setActiveReaction(reactionEmoji);
      toast.success(`Reacted ${reactionEmoji}`);
    } else {
      setActiveReaction(null);
    }
    setShowReactionTray(false);

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
      toast.success(isQuote ? "Quote posted to your campus timeline! ✨" : "Loop reposted! 🔄");
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
      toast.success("Loop link copied to clipboard! 📋");
    }
  }

  // Bookmark handling
  async function handleToggleSave() {
    sounds.tap();
    haptics.light();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    toast.success(nextSaved ? "Saved to your bookmarks 🔖" : "Removed from bookmarks");
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

  // ─── PURE INSTAGRAM REELS VIDEO LAYOUT (Image 3) ───
  if (videoUrl) {
    return (
      <div className="relative flex items-center justify-center gap-3 sm:gap-4 w-full h-full max-h-[calc(100dvh-5.5rem)]">
        <div
          onDoubleClick={handleDoubleTap}
          onClick={handleTogglePlay}
          className="relative w-full max-w-[340px] sm:max-w-[380px] h-[calc(100dvh-6.5rem)] max-h-[680px] rounded-3xl overflow-hidden bg-black border border-border/80 shadow-2xl flex items-center justify-center cursor-pointer select-none"
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
                  {isPlaying ? <Play className="size-7 fill-white ml-0.5" /> : <Pause className="size-7 fill-white" />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sound Toggle (Bottom-Right) */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="absolute bottom-4 right-4 z-30 size-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          {/* Bottom Gradient & Author/Caption Info */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pb-3 text-white space-y-2 pointer-events-auto">
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
                  className={`ml-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none ${
                    isFollowingAuthor
                      ? "bg-white/20 border-white/30 text-white"
                      : "bg-white text-black border-white hover:bg-white/90"
                  }`}
                >
                  {isFollowingAuthor ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Caption */}
            {captionText && (
              <div className="text-xs text-white/90 leading-relaxed pr-8">
                <p className={cn("transition-all", !isExpandedCaption && "line-clamp-2")}>
                  {captionText}
                </p>
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

        {/* ─── Floating Vertical Action Column (Right Side like Instagram Image 3) ─── */}
        <div className="flex flex-col items-center gap-3.5 z-30 select-none shrink-0 text-foreground">
          {/* 1. Like */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => handleVote()}
              aria-label="Like post"
              className={cn(
                "size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
                userVote === 1 ? "text-rose-500 bg-rose-500/10 border-rose-500/30" : "hover:text-foreground"
              )}
            >
              <Heart className={cn("size-5.5 sm:size-6", userVote === 1 && "fill-rose-500")} />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
              {votesCount > 0 ? votesCount : "Like"}
            </span>
          </div>

          {/* 2. Comment */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenComments(post)}
              aria-label="Comment"
              className="size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer hover:text-foreground"
            >
              <MessageCircle className="size-5.5 sm:size-6" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
              {commentsCount > 0 ? commentsCount : "Reply"}
            </span>
          </div>

          {/* 3. Repost */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setShowRepostModal(true)}
              aria-label="Repost"
              className={cn(
                "size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
                isReposted ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" : "hover:text-foreground"
              )}
            >
              <Repeat2 className={cn("size-5.5 sm:size-6", isReposted && "rotate-180")} />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground">Loop</span>
          </div>

          {/* 4. Bookmark */}
          <button
            type="button"
            onClick={handleToggleSave}
            aria-label="Save"
            className={cn(
              "size-10 sm:size-11 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
              isSaved ? "text-primary fill-primary" : "hover:text-foreground text-muted-foreground"
            )}
          >
            <Bookmark className={cn("size-5", isSaved && "fill-primary")} />
          </button>

          {/* 5. Share */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="size-10 sm:size-11 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer hover:text-foreground text-muted-foreground"
          >
            <Share2 className="size-5" />
          </button>

          {/* 6. More Options */}
          <button
            type="button"
            onClick={() => setShowReport(true)}
            aria-label="Report"
            className="size-9 rounded-full border border-border/60 bg-card/80 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>

        {/* Modals */}
        <FeedCardRepostModal
          isOpen={showRepostModal}
          onClose={() => setShowRepostModal(false)}
          quoteThoughts={quoteThoughts}
          setQuoteThoughts={setQuoteThoughts}
          onExecuteRepost={handleExecuteRepost}
          originalPostAuthorHandle={authorHandle}
          isReposting={isReposting}
        />
        <ShareStoryModal isOpen={showShareStoryModal} onClose={() => setShowShareStoryModal(false)} post={post} />
        <PostLikesModal postId={post.id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} />
        <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
      </div>
    );
  }

  // ─── IMMERSIVE CARD LAYOUT FOR TEXT, POLLS & IMAGES ───
  return (
    <div className="relative flex items-center justify-center gap-3 sm:gap-4 w-full h-full max-h-[calc(100dvh-5.5rem)]">
      <article
        onDoubleClick={handleDoubleTap}
        className={cn(
          "relative w-full max-w-xl mx-auto rounded-3xl border border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 flex flex-col justify-between max-h-[calc(100dvh-5.5rem)] overflow-y-auto no-scrollbar select-none transition-all",
          isActive ? "ring-1 ring-primary/25 shadow-primary/5" : "opacity-95"
        )}
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

        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="size-11 border border-border/80 shadow-xs">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                  <AvatarFallback className="bg-muted font-black text-xs text-foreground">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                {!post.isAnonymous && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
              </div>

              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm sm:text-[15px] text-foreground truncate">
                    {authorName}
                  </span>
                  {!post.isAnonymous && (
                    <BadgeCheck className="size-4 text-primary shrink-0" />
                  )}
                  <span className="text-xs text-muted-foreground truncate">@{authorHandle}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  {post.institution && (
                    <>
                      <span className="truncate max-w-[140px] sm:max-w-[200px] font-medium">
                        {post.institution.name.split(",")[0]}
                      </span>
                      <span>·</span>
                    </>
                  )}
                  <span>{formatTimeAgo(new Date(post.createdAt))}</span>
                </div>
              </div>
            </div>

            {/* Tag Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                {post.type === "CONFESSION" ? "🎭 Confession" : post.type === "POLL" ? "📊 Poll" : "💬 Yap"}
              </span>
            </div>
          </div>

          {/* Post Text */}
          <div className="text-[15px] sm:text-base text-foreground leading-relaxed pt-1">
            <RichText content={post.body} maxHeight={240} />
          </div>

          {/* Embedded Repost */}
          {post.repostOf && (
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <span className="font-bold text-foreground">
                  @{post.repostOf.author?.username || "student"}
                </span>
                {post.repostOf.institution && (
                  <>
                    <span>·</span>
                    <span>{post.repostOf.institution.name.split(",")[0]}</span>
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
        </div>

        {/* Footer Reaction Count */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          {votesCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowLikesModal(true)}
              className="flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="size-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                {activeReaction || "❤️"}
              </span>
              <span className="font-bold text-foreground ml-1">{votesCount}</span>
              <span>reactions</span>
            </button>
          ) : (
            <span>Be the first to react</span>
          )}

          <button
            type="button"
            onClick={() => onOpenComments(post)}
            className="hover:underline cursor-pointer font-medium"
          >
            {commentsCount} comments
          </button>
        </div>
      </article>

      {/* Floating Action Column (Right Side) */}
      <div className="flex flex-col items-center gap-3.5 z-30 select-none shrink-0 text-foreground">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleVote()}
            aria-label="Like post"
            className={cn(
              "size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
              userVote === 1 ? "text-rose-500 bg-rose-500/10 border-rose-500/30" : "hover:text-foreground"
            )}
          >
            <Heart className={cn("size-5.5 sm:size-6", userVote === 1 && "fill-rose-500")} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {votesCount > 0 ? votesCount : "Like"}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenComments(post)}
            aria-label="Comment"
            className="size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer hover:text-foreground"
          >
            <MessageCircle className="size-5.5 sm:size-6" />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {commentsCount > 0 ? commentsCount : "Reply"}
          </span>
        </div>

        {/* Repost */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setShowRepostModal(true)}
            aria-label="Repost"
            className={cn(
              "size-11 sm:size-12 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
              isReposted ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" : "hover:text-foreground"
            )}
          >
            <Repeat2 className={cn("size-5.5 sm:size-6", isReposted && "rotate-180")} />
          </button>
          <span className="text-[11px] font-bold text-muted-foreground">Loop</span>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label="Save"
          className={cn(
            "size-10 sm:size-11 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer",
            isSaved ? "text-primary fill-primary" : "hover:text-foreground text-muted-foreground"
          )}
        >
          <Bookmark className={cn("size-5", isSaved && "fill-primary")} />
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="size-10 sm:size-11 rounded-full border border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90 cursor-pointer hover:text-foreground text-muted-foreground"
        >
          <Share2 className="size-5" />
        </button>

        {/* More Options */}
        <button
          type="button"
          onClick={() => setShowReport(true)}
          aria-label="Report"
          className="size-9 rounded-full border border-border/60 bg-card/80 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Modals */}
      <FeedCardRepostModal
        isOpen={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        quoteThoughts={quoteThoughts}
        setQuoteThoughts={setQuoteThoughts}
        onExecuteRepost={handleExecuteRepost}
        originalPostAuthorHandle={authorHandle}
        isReposting={isReposting}
      />
      <ShareStoryModal isOpen={showShareStoryModal} onClose={() => setShowShareStoryModal(false)} post={post} />
      <PostLikesModal postId={post.id} isOpen={showLikesModal} onClose={() => setShowLikesModal(false)} />
      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}
