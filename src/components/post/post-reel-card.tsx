"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Bookmark, Heart, MessageCircle, MoreHorizontal, Repeat2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

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

  const [showReport, setShowReport] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  useEffect(() => {
    setUserVote(post.userVote);
    setVotesCount(post.votesCount);
    setCommentsCount(post.commentsCount);
    setIsSaved(Boolean(post.isSaved));
  }, [post.userVote, post.votesCount, post.commentsCount, post.isSaved]);

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
      toast.success(isQuote ? "Quote posted to your feed! ✨" : "Post reposted to your campus timeline! 🔄");
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
          title: `Post by ${authorName} on CampusLoop`,
          text: post.body.slice(0, 100),
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Post link copied to clipboard! 📋");
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

  return (
    <article
      onDoubleClick={handleDoubleTap}
      className={cn(
        "relative w-full max-w-xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl shadow-2xl p-4 sm:p-5 flex flex-col justify-between max-h-[calc(100dvh-5rem)] overflow-y-auto no-scrollbar select-none transition-all",
        isActive ? "ring-1 ring-primary/25 shadow-primary/5" : "opacity-95"
      )}
    >
      {/* ─── Double Tap Heart Animation (Instagram Reels) ─── */}
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

      <div className="space-y-3">
        {/* ─── Header: Twitter / Facebook Blend ─── */}
        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with active ring */}
            <div className="relative shrink-0">
              <Avatar className="size-10 border border-border/80 shadow-xs">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={authorName} />}
                <AvatarFallback className="bg-muted font-black text-xs text-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              {!post.isAnonymous && (
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </div>

            {/* Author details & campus line */}
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm sm:text-[15px] text-foreground truncate">
                  {authorName}
                </span>
                {!post.isAnonymous && (
                  <BadgeCheck className="size-4 text-foreground shrink-0 fill-foreground/10" />
                )}
                <span className="text-xs text-muted-foreground truncate">@{authorHandle}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {post.institution && (
                  <>
                    <span className="truncate max-w-[140px] sm:max-w-[180px] font-medium">
                      {post.institution.name.split(",")[0]}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span>{formatTimeAgo(new Date(post.createdAt))}</span>
              </div>
            </div>
          </div>

          {/* Right side tag & menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
              {post.type === "CONFESSION" ? "🎭 Confession" : post.type === "POLL" ? "📊 Poll" : "💬 Yap"}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowReport(true);
              }}
              aria-label="More options"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-full hover:bg-muted/40"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* ─── Post Text with Max Height & "Show more" button ─── */}
        <div className="text-[15px] text-foreground leading-relaxed pt-0.5">
          <RichText content={post.body} maxHeight={185} />
        </div>

        {/* ─── Embedded Original Quoted Post (Twitter Style) ─── */}
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

        {/* ─── Poll Component ─── */}
        {post.type === "POLL" && post.pollOptions && (
          <div className="pt-1">
            <PollCard post={post} />
          </div>
        )}
      </div>

      {/* ─── Footer: Facebook Reactions + Twitter Action Row + Reels Drawer ─── */}
      <div className="pt-4 mt-2 border-t border-border/40 space-y-2">
        {/* Facebook-style reaction count bar */}
        {votesCount > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1">
            <button
              type="button"
              onClick={() => setShowLikesModal(true)}
              className="flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="flex -space-x-1 items-center">
                <span className="size-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                  {activeReaction || "❤️"}
                </span>
              </span>
              <span className="font-bold text-foreground ml-1">{votesCount}</span>
              <span>reactions</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenComments(post)}
              className="hover:underline cursor-pointer"
            >
              <span>{commentsCount} comments</span>
            </button>
          </div>
        )}

        {/* Action Row */}
        <div className="relative flex items-center justify-between text-muted-foreground text-xs">
          {/* Reaction Picker Popup (Facebook Style) */}
          <AnimatePresence>
            {showReactionTray && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-11 left-0 z-40 flex items-center gap-1 rounded-full border border-border/80 bg-card/95 backdrop-blur-xl p-1.5 shadow-2xl"
              >
                {QUICK_REACTIONS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => handleVote(r.emoji)}
                    className="size-9 flex items-center justify-center text-lg hover:scale-130 transition-transform cursor-pointer rounded-full hover:bg-muted/40"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. Vote / Like Button (Facebook & Twitter style) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => handleVote()}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowReactionTray((prev) => !prev);
              }}
              onMouseEnter={() => setShowReactionTray(true)}
              className={cn(
                "group flex items-center gap-1.5 py-1.5 px-2.5 rounded-full transition-all cursor-pointer",
                userVote === 1
                  ? "text-rose-500 font-bold bg-rose-500/10"
                  : "hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Heart
                className={cn(
                  "size-4.5 transition-transform group-hover:scale-110",
                  userVote === 1 && "fill-rose-500"
                )}
              />
              <span>{userVote === 1 ? (activeReaction ? activeReaction : "Liked") : "Like"}</span>
            </button>
          </div>

          {/* 2. Comment Button (Instagram Reels style slide-up trigger) */}
          <button
            type="button"
            onClick={() => onOpenComments(post)}
            className="group flex items-center gap-1.5 py-1.5 px-2.5 rounded-full hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer"
          >
            <MessageCircle className="size-4.5 group-hover:scale-110 transition-transform" />
            <span>Comment</span>
            {commentsCount > 0 && <span className="font-bold">({commentsCount})</span>}
          </button>

          {/* 3. Repost Button (Twitter style) */}
          <button
            type="button"
            onClick={() => setShowRepostModal(true)}
            disabled={isReposting}
            className={cn(
              "group flex items-center gap-1.5 py-1.5 px-2.5 rounded-full transition-all cursor-pointer",
              isReposted
                ? "text-emerald-500 font-bold bg-emerald-500/10"
                : "hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Repeat2
              className={cn(
                "size-4.5 group-hover:scale-110 transition-transform",
                isReposted && "rotate-180"
              )}
            />
            <span className="hidden sm:inline">Repost</span>
          </button>

          {/* 4. Bookmark Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            aria-label="Save post"
            className={cn(
              "p-1.5 rounded-full transition-colors cursor-pointer",
              isSaved ? "text-foreground" : "hover:text-foreground hover:bg-muted/40"
            )}
          >
            <Bookmark className={cn("size-4.5", isSaved && "fill-foreground")} />
          </button>

          {/* 5. Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share post"
            className="p-1.5 rounded-full hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <Share2 className="size-4.5" />
          </button>
        </div>
      </div>

      {/* ─── Modals: Repost, Share Story, Likes, Report ─── */}
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

      <ReportDialog
        postId={post.id}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </article>
  );
}
