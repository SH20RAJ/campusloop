"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Repeat2, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedPost } from "@/hooks/use-feed";
import { PollCard } from "./poll-card";
import { ReportDialog } from "./report-dialog";
import { ShareStoryModal } from "./share-story-modal";
import { toast } from "sonner";
import { voteOnPost, repostPost } from "@/lib/api";

import { FeedCardHeader } from "@/components/feed/feed-card-header";
import { FeedCardActions } from "@/components/feed/feed-card-actions";
import { FeedCardRepostModal } from "@/components/feed/feed-card-repost-modal";
import { RichText } from "@/components/ui/rich-text";

interface FeedCardProps {
  post: FeedPost;
  currentUserId?: string;
  disableNavigation?: boolean;
}

export function FeedCard({ post, currentUserId, disableNavigation }: FeedCardProps) {
  const router = useRouter();
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? post.pseudonym || "anonymous" : post.author?.username || "student";

  async function handleVote() {
    if (isLoading) return;
    const isUpvoted = userVote === 1;
    const newValue = isUpvoted ? 0 : 1;
    const newCount = isUpvoted ? votesCount - 1 : votesCount + 1;

    setUserVote(newValue);
    setVotesCount(newCount);
    setIsLoading(true);

    try {
      const data = await voteOnPost(post.id, newValue);
      setUserVote(data.userVote);
    } catch (error) {
      console.error(error);
      setUserVote(userVote);
      setVotesCount(votesCount);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCardClick() {
    if (disableNavigation) return;
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return;
    }
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      router.push(`/app/post/${post.id}`);
    }, 220);
  }

  function handleDoubleTap(e: React.MouseEvent) {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    if (userVote !== 1) handleVote();
    if (typeof window !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(15);
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 900);
  }

  async function handleSharePost() {
    const postUrl = typeof window !== "undefined" ? `${window.location.origin}/app/post/${post.id}` : `https://campusloop.space/app/post/${post.id}`;
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "CampusLoop Post",
          text: `Check out this campus post: "${post.body.slice(0, 100)}${post.body.length > 100 ? "..." : ""}"`,
          url: postUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setShowShareStoryModal(true);
        }
        return;
      }
    }
    setShowShareStoryModal(true);
  }

  async function handleExecuteRepost(withCommentary: boolean) {
    if (isReposting) return;
    setIsReposting(true);

    try {
      await repostPost(post.id, withCommentary ? quoteThoughts : undefined);
      toast.success(withCommentary ? "Reshared with your thoughts! 🎉" : "Reposted to campus feed! 🔁");
      setShowRepostModal(false);
      setQuoteThoughts("");
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

      {/* Repost Banner Header */}
      {post.repostOfId && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-5 pt-3 -mb-1 select-none">
          <Repeat2 className="size-3.5 text-emerald-500" />
          <span>{authorName} Reposted</span>
        </div>
      )}

      {/* Card Header */}
      <FeedCardHeader
        post={post}
        currentUserId={currentUserId}
        onOpenRepostModal={() => setShowRepostModal(true)}
        onOpenReportModal={() => setShowReport(true)}
        onShare={handleSharePost}
      />

      {/* Content Body */}
      <div
        className="px-5 py-1 cursor-pointer select-none"
        onClick={handleCardClick}
        onDoubleClick={handleDoubleTap}
      >
        <RichText content={post.body} className="text-sm md:text-base leading-relaxed text-foreground" />

        {/* Embedded Original Quoted Post */}
        {post.repostOf && (
          <Link href={`/app/post/${post.repostOf.id}`} onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors p-3.5 text-xs space-y-1.5 cursor-pointer">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <span className="font-bold text-foreground">@{post.repostOf.author?.username || "student"}</span>
                {post.repostOf.institution?.name && (
                  <>
                    <span>•</span>
                    <span className="truncate text-[11px]">{post.repostOf.institution.name}</span>
                  </>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2">{post.repostOf.body}</p>
            </div>
          </Link>
        )}

        {/* Poll Component */}
        {post.type === "POLL" && post.pollOptions && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <PollCard post={post} />
          </div>
        )}
      </div>

      {/* Card Actions */}
      <FeedCardActions
        post={post}
        userVote={userVote}
        votesCount={votesCount}
        onVote={handleVote}
        onInstantRepost={() => handleExecuteRepost(false)}
        onShare={handleSharePost}
      />

      {/* Dialog Modals */}
      <FeedCardRepostModal
        isOpen={showRepostModal}
        onClose={() => setShowRepostModal(false)}
        quoteThoughts={quoteThoughts}
        setQuoteThoughts={setQuoteThoughts}
        isReposting={isReposting}
        onExecuteRepost={handleExecuteRepost}
        originalPostAuthorHandle={authorHandle}
      />

      <ReportDialog
        postId={post.id}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />

      <ShareStoryModal
        post={post}
        isOpen={showShareStoryModal}
        onClose={() => setShowShareStoryModal(false)}
      />
    </div>
  );
}
