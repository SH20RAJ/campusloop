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
  const [quoteThoughts, setQuoteThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  function handleShare() {
    const postUrl = `${window.location.origin}/app/post/${post.id}`;
    let shareText = "";
    if (post.type === "CONFESSION") {
      shareText = `🤫 Anonymous Confession on CampusLoop:\n"${post.body.slice(0, 100)}${post.body.length > 100 ? "..." : ""}"\n\nRead the full tea at: ${postUrl}`;
    } else if (post.type === "POLL") {
      shareText = `📊 Campus Poll on CampusLoop:\n"${post.body.slice(0, 100)}${post.body.length > 100 ? "..." : ""}"\n\nCast your vote at: ${postUrl}`;
    } else {
      shareText = `🔥 Hot topic on CampusLoop:\n"${post.body.slice(0, 100)}${post.body.length > 100 ? "..." : ""}"\n\nJoin the discussion at: ${postUrl}`;
    }

    navigator.clipboard.writeText(shareText);
    toast.success("Share link copied! Paste it in your WhatsApp group or Instagram story 🚀");
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
    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-xs hover:border-border/80 transition-all relative">
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

      {/* Content Body */}
      <div className="px-5 py-1">
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
        <button 
          onClick={handleVote}
          disabled={isLoading}
          className={`flex items-center gap-1.5 transition-colors cursor-pointer font-semibold ${userVote === 1 ? "text-rose-500" : "hover:text-foreground"}`}
        >
          <AnimateIcon animateOnHover animation="path">
            <Heart className={`h-4 w-4 ${userVote === 1 ? "fill-rose-500" : ""}`} />
          </AnimateIcon>
          <span>{votesCount}</span>
        </button>
        
        <Link href={`/app/post/${post.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold">
          <AnimateIcon animateOnHover animation="path">
            <MessageCircle className="h-4 w-4" />
          </AnimateIcon>
          <span>{post.commentsCount || 0}</span>
        </Link>

        {/* Repost Quick Action */}
        <button
          onClick={() => setShowRepostModal(true)}
          className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors font-semibold cursor-pointer"
          title="Repost or Reshare"
        >
          <AnimateIcon animateOnHover animation="path">
            <Repeat2 className="h-4 w-4 text-emerald-500/80" />
          </AnimateIcon>
          <span>Repost</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Repeat2 className="h-5 w-5 text-emerald-500" /> Repost to Campus
              </h3>
              <button
                onClick={() => setShowRepostModal(false)}
                className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quoted Original Post Preview */}
            <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-1">
              <p className="font-bold text-foreground">@{authorHandle}</p>
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">{post.body}</p>
            </div>

            {/* Add Thoughts Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Add your thoughts (optional)</label>
              <textarea
                value={quoteThoughts}
                onChange={(e) => setQuoteThoughts(e.target.value)}
                placeholder="What's your take on this?..."
                rows={3}
                className="w-full rounded-2xl border border-border bg-muted/40 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-all resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleExecuteRepost(false)}
                disabled={isReposting}
                className="flex-1 py-2.5 rounded-xl border border-border bg-muted/60 text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
              >
                Instant Repost
              </button>
              <button
                onClick={() => handleExecuteRepost(true)}
                disabled={isReposting || !quoteThoughts.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="h-3.5 w-3.5" /> Quote Reshare
              </button>
            </div>
          </div>
        </div>
      )}

      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}
