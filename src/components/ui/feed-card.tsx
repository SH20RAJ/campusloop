"use client";

import { FastCommentsModal } from "@/components/feed/fast-comments-modal";
import { FeedCardActions } from "@/components/feed/feed-card-actions";
import { FeedCardHeader } from "@/components/feed/feed-card-header";
import { FeedCardRepostModal } from "@/components/feed/feed-card-repost-modal";
import { PostLikesModal } from "@/components/post/post-likes-modal";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { RichText } from "@/components/ui/rich-text";
import { FeedPost } from "@/hooks/use-feed";
import { repostPost,voteOnPost } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { getAvatarUrl } from "@/lib/utils";
import { AnimatePresence,motion } from "framer-motion";
import { Heart,Repeat2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PollCard } from "./poll-card";
import { ReportDialog } from "./report-dialog";
import { ShareStoryModal } from "./share-story-modal";

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
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  useEffect(() => {
    setUserVote(post.userVote);
    setVotesCount(post.votesCount);
    setCommentsCount(post.commentsCount);
  }, [post.userVote, post.votesCount, post.commentsCount]);

  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? post.pseudonym || "anonymous" : post.author?.username || "student";
  const avatarFallback = post.isAnonymous ? "🙈" : (post.author?.displayName?.[0] ?? "S");
  const avatarUrl = post.isAnonymous ? "" : getAvatarUrl(post.author?.avatarUrl, post.author?.username ?? "student");

  async function handleVote() {
    if (isLoading) return;
    const isUpvoted = userVote === 1;
    const newValue = isUpvoted ? 0 : 1;
    const newCount = isUpvoted ? votesCount - 1 : votesCount + 1;

    if (newValue === 1) {
      sounds.pop();
      haptics.medium();
    } else {
      haptics.light();
    }

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
    sounds.pop();
    haptics.heartbeat();
    if (userVote !== 1) handleVote();
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 900);
  }

  async function handleSharePost() {
    sounds.tap();
    haptics.success();
    const postUrl = typeof window !== "undefined" ? `${window.location.origin}/app/post/${post.id}` : `https://campusloop.space/app/post/${post.id}`;
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${authorName} on CampusLoop`,
          text: post.body.slice(0, 100),
          url: postUrl,
        });
      } catch {
        // Fallback to copy
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard! 📋");
      }
    } else {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard! 📋");
    }
  }

  async function handleExecuteRepost(isQuote: boolean) {
    setIsReposting(true);
    try {
      await repostPost(post.id, isQuote ? quoteThoughts : undefined);

      // Light, quick feedback — the button itself carries the animation
      sounds.tap();
      haptics.light();

      toast.success(isQuote ? "Quote posted" : "Reposted", {
        description: isQuote ? undefined : "Shared to your followers' feeds",
      });
      setShowRepostModal(false);
      setQuoteThoughts("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to repost");
    } finally {
      setIsReposting(false);
    }
  }

  return (
    <article className="border-b border-border/30 hover:bg-muted/[0.12] transition-colors relative cursor-pointer select-none px-4 py-3.5">
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold pl-12 pb-1.5 select-none">
          <Repeat2 className="size-3.5 text-emerald-500" />
          <span>{authorName} Reposted</span>
        </div>
      )}

      {/* Twitter 2-Column Layout */}
      <div className="flex gap-3">
        {/* Left Column: Author Avatar */}
        <div className="shrink-0 pt-0.5">
          {!post.isAnonymous ? (
            <Link
              href={`/@${authorHandle}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="size-10 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="size-10 rounded-full border border-border/40 bg-muted">
              <AvatarFallback className="font-bold text-xs text-muted-foreground">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Right Column: Header, Body, Media, Actions */}
        <div className="flex-1 min-w-0 space-y-1">
          <FeedCardHeader
            post={post}
            currentUserId={currentUserId}
            onOpenRepostModal={() => setShowRepostModal(true)}
            onOpenReportModal={() => setShowReport(true)}
            onShare={handleSharePost}
          />

          {/* Minimal clean divider before post content */}
          <hr className="border-t border-border/25 my-1.5" />

          {/* Content Body */}
          <div
            className="text-[15px] leading-normal text-foreground font-normal break-words pt-0.5"
            onClick={handleCardClick}
            onDoubleClick={handleDoubleTap}
          >
            <RichText content={post.body} />
          </div>


          {/* Embedded Original Quoted Post */}
          {post.repostOf && (
            <Link
              href={`/app/post/${post.repostOf.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mt-2.5 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <span className="font-bold text-foreground">@{post.repostOf.author?.username || "student"}</span>
                  {post.repostOf.institution?.name && (
                    <>
                      <span>·</span>
                      <span className="truncate text-[11px]">{post.repostOf.institution.name.split(",")[0]}</span>
                    </>
                  )}
                </div>
                <p className="text-foreground/90 line-clamp-3 leading-relaxed">{post.repostOf.body}</p>
              </div>
            </Link>
          )}

          {/* Poll Component */}
          {post.type === "POLL" && post.pollOptions && (
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <PollCard post={post} />
            </div>
          )}

          {/* Facebook / Twitter Style Liked By Row */}
          {votesCount > 0 && disableNavigation && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowLikesModal(true);
              }}
              className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer group w-fit"
            >
              <div className="size-4 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Heart className="size-2.5 fill-white text-white" />
              </div>
              <span className="font-semibold group-hover:underline">
                {votesCount === 1 ? "1 person liked this" : `${votesCount} people liked this`}
              </span>
            </div>
          )}

          {/* Action Bar */}
          <FeedCardActions
            post={post}
            userVote={userVote}
            votesCount={votesCount}
            commentsCount={commentsCount}
            onVote={handleVote}
            onInstantRepost={() => handleExecuteRepost(false)}
            onShare={handleSharePost}
            onOpenComments={() => setShowCommentsModal(true)}
            onOpenLikes={() => setShowLikesModal(true)}
          />
        </div>
      </div>

      {/* Post Likes Modal (Facebook-style who liked list) */}
      <PostLikesModal
        postId={post.id}
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        currentUserId={currentUserId}
      />

      {/* Fast Instagram-Style Comments Modal */}
      <FastCommentsModal

        post={post}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        onCommentCountChange={(newCount) => setCommentsCount(newCount)}
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
    </article>
  );
}
