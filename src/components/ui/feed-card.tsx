"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Lock, BarChart3, HelpCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { FeedPost } from "@/hooks/use-feed";
import { PollCard } from "./poll-card";
import { ReportDialog } from "./report-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deletePost } from "@/app/app/(main)/post/actions";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarFallback = post.isAnonymous ? "A" : post.author.displayName[0];
  const avatarUrl = post.isAnonymous ? "" : post.author.avatarUrl;

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
      // Sync state with server response just in case
      setUserVote(data.userVote);
    } catch (error) {
      console.error(error);
      // Revert on error
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
    toast.success("Share link copied! Paste it in your WhatsApp group or Instagram story to spread the word 🚀");
  }

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {!post.isAnonymous ? (
            <Link href={`/@${authorHandle}`}>
              <Avatar className="h-10 w-10 border hover:opacity-85 transition-opacity cursor-pointer">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold flex items-center gap-1">
              {!post.isAnonymous ? (
                <Link href={`/@${authorHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
              {!post.isAnonymous && <span className="text-blue-500 text-xs">●</span>}
            </span>
            <span className="text-xs text-muted-foreground">
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
        
        <div className="flex items-center gap-2">
          {post.community && (
            <Link href={`/app/communities/${post.community.id}`}>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer">
                c/{post.community.name}
              </span>
            </Link>
          )}
          {post.type !== "NORMAL" && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1",
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
          )}

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-md p-2 hover:bg-muted text-muted-foreground transition-colors"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-20 py-1 animate-in fade-in slide-in-from-top-1">
                {currentUserId && post.authorId === currentUserId && (
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      const confirmed = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
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
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Post
                    </span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReport(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-muted transition-colors cursor-pointer"
                >
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        <Link href={`/app/post/${post.id}`}>
          <p className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap hover:underline">
            {renderPostBody(post.body)}
          </p>
        </Link>
        {post.type === "POLL" && (
          <PollCard post={post} />
        )}
        {post.title && (
          <Link
            href={`/app/hashtag/${post.title.replace(/\s+/g, '')}`}
            className="mt-3 inline-block text-xs font-semibold text-primary hover:underline cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            #{post.title.replace(/\s+/g, '')}
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 px-6 py-4 border-t border-border mt-4 text-muted-foreground">
        <button 
          onClick={handleVote}
          disabled={isLoading}
          className={`flex items-center gap-1.5 transition-colors text-sm ${userVote === 1 ? "text-red-500 hover:text-red-600" : "hover:text-foreground"}`}
        >
          <Heart className={`h-4 w-4 ${userVote === 1 ? "fill-red-500" : ""}`} />
          <span>{votesCount}</span>
        </button>
        
        <Link href={`/app/post/${post.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm">
          <MessageCircle className="h-4 w-4" />
          <span>{post.commentsCount || 0}</span>
        </Link>

        <button 
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}
