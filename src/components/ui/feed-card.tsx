"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Lock, BarChart3, HelpCircle } from "lucide-react";
import Link from "next/link";
import { FeedPost } from "@/hooks/use-feed";
import { PollCard } from "./poll-card";
import { ReportDialog } from "./report-dialog";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  post: FeedPost;
}

export function FeedCard({ post }: FeedCardProps) {
  const [userVote, setUserVote] = useState(post.userVote);
  const [votesCount, setVotesCount] = useState(post.votesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarFallback = post.isAnonymous ? "A" : post.author.displayName[0];
  const avatarUrl = post.isAnonymous ? "" : post.author.avatarUrl;

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

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          {!post.isAnonymous ? (
            <Link href={`/app/profile?id=${post.authorId}`}>
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
                <Link href={`/app/profile?id=${post.authorId}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
              {!post.isAnonymous && <span className="text-blue-500 text-xs">●</span>}
            </span>
            <span className="text-xs text-muted-foreground">
              {!post.isAnonymous ? (
                <Link href={`/app/profile?id=${post.authorId}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                  @{authorHandle}
                </Link>
              ) : (
                `@${authorHandle}`
              )}
              {" "}• <Link href={`/college/${post.institutionId}`} className="hover:text-primary transition-colors hover:underline">{post.institution.name}</Link>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
            {post.body}
          </p>
        </Link>
        {post.type === "POLL" && (
          <PollCard post={post} />
        )}
        {post.title && (
          <p className="mt-3 text-xs font-semibold text-primary">#{post.title.replace(/\s+/g, '')}</p>
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

        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      <ReportDialog postId={post.id} isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}
