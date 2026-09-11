"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Repeat2, VenetianMask } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FastCommentsModal } from "@/components/feed/fast-comments-modal";
import { FeedCardActions } from "@/components/feed/feed-card-actions";
import { FeedCardHeader } from "@/components/feed/feed-card-header";
import { FeedCardRepostModal } from "@/components/feed/feed-card-repost-modal";
import { PostLikesModal } from "@/components/post/post-likes-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RichText } from "@/components/ui/rich-text";
import { startRouteProgress } from "@/components/ui/route-progress";
import type { FeedPost } from "@/hooks/use-feed";
import { repostPost, voteOnPost } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, getAvatarUrl, getCollegeShortName } from "@/lib/utils";
import { PollCard } from "./poll-card";
import { RedditAttribution } from "@/components/reddit/reddit-attribution";
import { RedditGallery } from "@/components/reddit/reddit-gallery";
import { RedditVideo } from "@/components/reddit/reddit-video";
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
  const collegeDisplayName = getCollegeShortName(post.institution);
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
  const avatarFallback = post.author?.displayName?.[0] ?? "S";
  const avatarUrl = post.isAnonymous
    ? ""
    : getAvatarUrl(post.author?.avatarUrl, post.author?.username ?? "student");

  const extractedHashtags = useMemo(() => {
    const text = post.body || "";
    const tags: string[] = [];
    const hashtagRegex = /#([\w-]+)/g;
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      if (!tags.includes(match[1])) {
        tags.push(match[1]);
      }
    }
    return tags;
  }, [post.body]);

  const displayContent = useMemo(() => {
    if (!post.externalPost) return post.body;
    if (post.externalPost.contentType === "VIDEO" || post.externalPost.contentType === "GALLERY") {
      return (post.body || "")
        .replace(/!\[video\]\([^)]+\)/gi, "")
        .replace(/!\[image:[^\]]*\]\([^)]+\)/gi, "")
        .replace(/!\[image\]\([^)]+\)/gi, "")
        .trim();
    }
    return post.body;
  }, [post.body, post.externalPost]);

  async function handleVote() {
    if (isLoading) return;
    const isUpvoted = userVote === 1;
    const newValue = isUpvoted ? 0 : 1;
    const newCount = isUpvoted ? Math.max(0, votesCount - 1) : votesCount + 1;

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

  function handleCardClick(e?: React.MouseEvent) {
    if (disableNavigation) return;

    if (e) {
      const target = e.target as HTMLElement;
      if (
        target.closest("img") ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[data-no-nav]") ||
        target.closest(".no-card-nav")
      ) {
        return;
      }
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return;
    }
    sounds.tap();
    startRouteProgress();
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      router.push(`/app/post/${post.id}`);
    }, 120);
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
    const postUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/app/post/${post.id}`
        : `https://campusloop.space/app/post/${post.id}`;
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${authorName} on CampusLoop`,
          text: post.body?.slice(0, 100),
          url: postUrl,
        });
      } catch {}
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
    <article
      onMouseEnter={() => router.prefetch(`/app/post/${post.id}`)}
      onTouchStart={() => router.prefetch(`/app/post/${post.id}`)}
      className="border-b border-border/30 hover:bg-muted/[0.12] transition-colors relative cursor-pointer select-none px-4 py-3.5"
    >
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
          {!post.isAnonymous && post.author?.username ? (
            <Link
              href={`/@${post.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="relative block cursor-pointer group"
            >
              <Avatar className="size-10 rounded-full border border-border/40 group-hover:opacity-90 transition-opacity">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              {post.externalPost && (
                <div
                  className="absolute -bottom-1 -right-1 size-4 rounded-full bg-[#FF4500] border-2 border-background flex items-center justify-center text-white shadow-xs"
                  title={`From r/${post.externalPost.subreddit || "reddit"}`}
                >
                  <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                  </svg>
                </div>
              )}
            </Link>
          ) : post.externalPost ? (
            <a
              href={post.externalPost.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block cursor-pointer"
              title={`From r/${post.externalPost.subreddit || "reddit"}`}
            >
              <div className="size-10 rounded-full border border-orange-500/30 bg-orange-500/10 flex items-center justify-center text-orange-500 hover:scale-105 hover:bg-orange-500/20 transition-all shadow-xs">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
              </div>
            </a>
          ) : !post.isAnonymous ? (
            <Link href={`/@${authorHandle}`} onClick={(e) => e.stopPropagation()}>
              <Avatar className="size-10 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="font-bold text-xs bg-muted text-foreground">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="size-10 rounded-full border border-purple-500/30 bg-purple-500/10">
              <AvatarFallback className="bg-transparent flex items-center justify-center">
                <VenetianMask className="size-5 text-purple-400" />
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

          {/* Content Body */}
          <div
            className="text-[15px] leading-relaxed text-foreground font-normal break-words pt-1 space-y-1.5"
            onClick={(e) => handleCardClick(e)}
            onDoubleClick={handleDoubleTap}
          >
            {post.title && (
              <h3 className="text-[16px] font-black text-foreground tracking-tight leading-snug">
                {post.title}
              </h3>
            )}
            {displayContent && (
              <RichText content={displayContent} createdAt={post.createdAt} collegeName={collegeDisplayName} />
            )}
          </div>

          {/* External Reddit Media Renderers (HTML5 Video / Gallery) */}
          {post.externalPost && post.externalPost.contentType === "VIDEO" && post.externalPost.media[0] && (
            <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
              <RedditVideo
                media={post.externalPost.media[0]}
                externalPost={post.externalPost}
              />
            </div>
          )}

          {post.externalPost && post.externalPost.contentType === "GALLERY" && post.externalPost.media.length > 0 && (
            <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
              <RedditGallery
                mediaList={post.externalPost.media}
                externalPost={post.externalPost}
              />
            </div>
          )}

          {/* Hashtags Row (matching Image 2) */}
          {extractedHashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5" onClick={(e) => e.stopPropagation()}>
              {extractedHashtags.map((tag, idx) => (
                <Link
                  key={tag}
                  href={`/app/hashtag/${tag}`}
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors shrink-0",
                    idx === 0
                      ? "border border-purple-500/40 bg-purple-950/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)] hover:bg-purple-900/50"
                      : "border border-border/50 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Embedded Original Quoted Post (only when user provided separate quote thoughts) */}
          {post.repostOf &&
            Boolean(post.repostComment) &&
            post.body?.trim() !== post.repostOf.body?.trim() && (
              <Link href={`/app/post/${post.repostOf.id}`} onClick={(e) => e.stopPropagation()}>
                <div className="mt-2.5 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <span className="font-bold text-foreground">
                      @{post.repostOf.author?.username || "student"}
                    </span>
                    {post.repostOf.institution?.name && (
                      <>
                        <span>·</span>
                        <span className="truncate text-[11px]">
                          {getCollegeShortName(post.repostOf.institution)}
                        </span>
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
          {(() => {
            const effectiveVotesCount = userVote === 1 && votesCount <= 0 ? 1 : votesCount;
            return (
              <>
                {effectiveVotesCount > 0 && disableNavigation && (
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
                      {effectiveVotesCount === 1
                        ? "1 person liked this"
                        : `${effectiveVotesCount} people liked this`}
                    </span>
                  </div>
                )}

                {/* Action Bar */}
                <FeedCardActions
                  post={post}
                  userVote={userVote}
                  votesCount={effectiveVotesCount}
                  commentsCount={commentsCount}
                  onVote={handleVote}
                  onInstantRepost={() => handleExecuteRepost(false)}
                  onShare={handleSharePost}
                  onOpenComments={() => setShowCommentsModal(true)}
                  onOpenLikes={() => setShowLikesModal(true)}
                />
              </>
            );
          })()}
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

      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />

      <ShareStoryModal
        post={post}
        isOpen={showShareStoryModal}
        onClose={() => setShowShareStoryModal(false)}
      />
    </article>
  );
}
