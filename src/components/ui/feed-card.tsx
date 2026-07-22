"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Lock,
  BarChart3,
  HelpCircle,
  Trash2,
  Repeat2,
  Link2,
  Flag,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { FeedPost } from "@/hooks/use-feed";
import { PollCard } from "./poll-card";
import { ReportDialog } from "./report-dialog";
import { cn, getAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";
import { deletePost } from "@/app/app/(main)/post/actions";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";

import { motion, AnimatePresence } from "framer-motion";

import { ShareStoryModal } from "./share-story-modal";

interface FeedCardProps {
  post: FeedPost;
  currentUserId?: string;
}

export function FeedCard({ post, currentUserId }: FeedCardProps) {
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostSpin, setRepostSpin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarFallback = post.isAnonymous ? "A" : post.author.displayName[0];
  const avatarUrl = post.isAnonymous ? "" : getAvatarUrl(post.author.avatarUrl, post.author.username);

  function renderPostBody(body: string) {
    const parts = body.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        const tag = part.slice(1);
        return (
          <Link
            key={index}
            href={`/app/hashtag/${tag}`}
            className="text-primary font-bold hover:underline cursor-pointer relative z-10"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  }

  async function handleVote() {
    if (isLoading) return;
    
    // Optimistic Update
    const isUpvoted = userVote === 1;
    const newValue = isUpvoted ? 0 : 1;
    const newCount = isUpvoted ? votesCount - 1 : votesCount + 1;

    setUserVote(newValue);
    setVotesCount(newCount);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        throw new Error("Failed to cast vote");
      }
      
      const data = await res.json() as { userVote: number };
      setUserVote(data.userVote);
    } catch (error) {
      console.error(error);
      setUserVote(userVote);
      setVotesCount(votesCount);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDoubleTap() {
    if (userVote !== 1) {
      handleVote();
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 900);
  }

  function handleShare() {
    setShowShareStoryModal(true);
  }

  async function handleExecuteRepost(withCommentary: boolean) {
    if (isReposting) return;
    setIsReposting(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentary: withCommentary ? quoteThoughts : undefined,
        }),
      });

      if (!res.ok) throw new Error("Repost failed");

      toast.success(withCommentary ? "Reshared with your thoughts! 🎉" : "Reposted to campus feed! 🔁");
      setShowRepostModal(false);
      setQuoteThoughts("");
      setShowMenu(false);
    } catch (err) {
      toast.error("Could not repost. Try again.");
      console.error(err);
    } finally {
      setIsReposting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-xs hover:border-border/80 transition-all relative overflow-hidden">
      {/* Double Tap Heart Pop Overlay */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-rose-500/5 backdrop-blur-[1px]">
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
              animate={{ scale: [0.2, 1.4, 1.1], opacity: [0, 1, 0.9], rotate: [0, 10, 0] }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <Heart className="h-20 w-20 fill-rose-500 text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 pb-2 sm:pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {!post.isAnonymous ? (
            <Link href={`/@${authorHandle}`}>
              <Avatar className="h-10 w-10 border hover:opacity-85 transition-opacity cursor-pointer shrink-0">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 border shrink-0">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold flex items-center gap-1 truncate">
              {!post.isAnonymous ? (
                <Link href={`/@${authorHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer flex items-center gap-1 truncate">
                  <span className="truncate">{authorName}</span>
                  {(post.author?.points >= 150 || post.author?.role === "ADMIN") && (
                    <span title="Verified Campus Star (Unlocked at 150+ LP)">
                      <svg className="size-3.5 text-blue-500 fill-blue-500/20 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </span>
                  )}
                </Link>
              ) : (
                authorName
              )}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {!post.isAnonymous ? (
                <Link href={`/@${authorHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                  @{authorHandle}
                </Link>
              ) : (
                `@${authorHandle}`
              )}
              {" "}• <Link href={`/app/college/${post.institution?.slug || post.institutionId}`} className="hover:text-primary transition-colors hover:underline">{post.institution.name}</Link>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {post.community && (
            <Link href={`/app/communities/${post.community.id}`}>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer">
                c/{post.community.name}
              </span>
            </Link>
          )}
          {post.type !== "NORMAL" && (
            <Link
              href={post.type === "CONFESSION" ? "/app/confessions" : `/app?type=${post.type}`}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer",
                post.type === "CONFESSION" && "bg-pink-500/10 text-pink-500 border-pink-500/20",
                post.type === "POLL" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                post.type === "QUESTION" && "bg-orange-500/10 text-orange-500 border-orange-500/20"
              )}>
                {post.type === "CONFESSION" && (
                  <>
                    <Lock className="h-2.5 w-2.5" />
                    <span>Confession</span>
                  </>
                )}
                {post.type === "POLL" && (
                  <>
                    <BarChart3 className="h-2.5 w-2.5" />
                    <span>Poll</span>
                  </>
                )}
                {post.type === "QUESTION" && (
                  <>
                    <HelpCircle className="h-2.5 w-2.5" />
                    <span>Question</span>
                  </>
                )}
              </span>
            </Link>
          )}

          {/* More Options Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-full p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-1">
                {/* Repost Options */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowRepostModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Repeat2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Repost or Quote</span>
                </button>

                {/* Share Link */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleShare();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Link2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Copy Share Link</span>
                </button>

                {/* Report Post */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReport(true);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 border-t border-border/40 mt-1 pt-2"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report Post</span>
                </button>

                {/* Delete Post */}
                {currentUserId && post.authorId === currentUserId && (
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      const confirmed = window.confirm("Are you sure you want to delete this post?");
                      if (!confirmed) return;
                      setIsDeleting(true);
                      try {
                        await deletePost(post.id);
                        toast.success("Post deleted successfully");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed to delete post");
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-muted transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Body (Supports Double-Tap to Like) */}
      <div 
        className="px-5 py-1 cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        <Link href={`/app/post/${post.id}`}>
          <p className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap">
            {renderPostBody(post.body)}
          </p>
        </Link>
        {post.type === "POLL" && (
          <PollCard post={post} />
        )}
        {post.title && (
          <Link
            href={`/app/hashtag/${post.title.replace(/\s+/g, '')}`}
            className="mt-2.5 inline-block text-xs font-semibold text-primary hover:underline cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            #{post.title.replace(/\s+/g, '')}
          </Link>
        )}
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex items-center gap-6 px-5 py-3 border-t border-border/50 mt-3 text-muted-foreground text-xs">
        {/* Animated Particle Burst Like Button */}
        <AnimatedLikeButton
          isLiked={userVote === 1}
          votesCount={votesCount}
          onVote={handleVote}
          isLoading={isLoading}
        />
        
        <Link href={`/app/post/${post.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold">
          <AnimateIcon animateOnHover animation="path">
            <MessageCircle className="h-4 w-4" />
          </AnimateIcon>
          <span>{post.commentsCount || 0}</span>
        </Link>

        {/* Repost Quick Action (1-Tap Twitter/X style with SVG path animation) */}
        <button
          onClick={() => {
            if (!isReposted && !isReposting) {
              setRepostSpin(true);
              setIsReposted(true);
              setTimeout(() => setRepostSpin(false), 700);
              handleExecuteRepost(false);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowRepostModal(true);
          }}
          className={cn(
            "flex items-center gap-1.5 transition-colors font-semibold cursor-pointer select-none",
            isReposted ? "text-emerald-500 font-bold" : "hover:text-emerald-500"
          )}
          title="Click to Repost (Right-click to Quote Reshare)"
        >
          <motion.div
            animate={repostSpin ? { rotate: [0, 180, 360], scale: [1, 1.35, 1] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
          >
            <Repeat2 className={cn("h-4 w-4 transition-all duration-300", isReposted ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "")} />
          </motion.div>
          <span>{isReposted ? "Reposted" : "Repost"}</span>
        </button>

        {/* Share Quick Action */}
        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold cursor-pointer ml-auto"
        >
          <AnimateIcon animateOnHover animation="path">
            <Share2 className="h-4 w-4" />
          </AnimateIcon>
        </button>
      </div>

      {/* Repost Modal */}
      {showRepostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
                <Repeat2 className="h-4 w-4 text-emerald-500" /> Repost to Campus
              </h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quoted Original Post Preview */}
            <div className="rounded-xl border border-border/40 bg-muted/30 p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">@{authorHandle}</p>
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">{post.body}</p>
            </div>

            {/* Add Thoughts Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Add your thoughts (optional)</label>
              <textarea
                value={quoteThoughts}
                onChange={(e) => setQuoteThoughts(e.target.value)}
                placeholder="What's your take on this?..."
                rows={3}
                className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-all resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleExecuteRepost(false)}
                disabled={isReposting}
                className="flex-1 py-2 rounded-xl border border-border/60 bg-muted/40 text-foreground text-xs font-semibold hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
              >
                Instant Repost
              </button>
              <button
                onClick={() => handleExecuteRepost(true)}
                disabled={isReposting || !quoteThoughts.trim()}
                className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" /> Quote Reshare
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
      <ShareStoryModal post={post} isOpen={showShareStoryModal} onClose={() => setShowShareStoryModal(false)} />
    </div>
  );
}

function AnimatedLikeButton({
  isLiked,
  votesCount,
  onVote,
  isLoading,
}: {
  isLiked: boolean;
  votesCount: number;
  onVote: () => void;
  isLoading: boolean;
}) {
  const [showBurst, setShowBurst] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isLiked) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 750);
    }
    onVote();
  }

  const particles = [
    { x: -16, y: -20, color: "bg-rose-500" },
    { x: 0, y: -24, color: "bg-pink-400" },
    { x: 16, y: -20, color: "bg-rose-400" },
    { x: 20, y: 0, color: "bg-amber-400" },
    { x: -20, y: 0, color: "bg-rose-500" },
    { x: 0, y: 20, color: "bg-pink-500" },
  ];

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        whileTap={{ scale: 0.8 }}
        className={cn(
          "flex items-center gap-1.5 transition-colors cursor-pointer font-semibold select-none py-1 px-1.5 rounded-full hover:bg-rose-500/10",
          isLiked ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.45, 0.9, 1.15, 1], rotate: [0, -12, 12, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <Heart className={cn("h-4.5 w-4.5 transition-all duration-300", isLiked ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "")} />
        </motion.div>
        
        <motion.span
          key={votesCount}
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {votesCount}
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {showBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {particles.map((p, idx) => (
              <motion.span
                key={idx}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className={cn("absolute size-1.5 rounded-full shadow-xs", p.color)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
