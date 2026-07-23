"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Lock, BarChart3, HelpCircle, Repeat2, Link2, Flag, Trash2 } from "lucide-react";
import { cn, getAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";
import { deletePost } from "@/app/app/(main)/post/actions";
import { FeedPost } from "@/hooks/use-feed";

interface FeedCardHeaderProps {
  post: FeedPost;
  currentUserId?: string;
  onOpenRepostModal: () => void;
  onOpenReportModal: () => void;
  onShare: () => void;
}

export function FeedCardHeader({
  post,
  currentUserId,
  onOpenRepostModal,
  onOpenReportModal,
  onShare,
}: FeedCardHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarFallback = post.isAnonymous ? "A" : post.author.displayName[0];
  const avatarUrl = post.isAnonymous ? "" : getAvatarUrl(post.author.avatarUrl, post.author.username);

  return (
    <div className="p-5 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {!post.isAnonymous ? (
          <Link href={`/@${authorHandle}`}>
            <Avatar className="h-10 w-10 border hover:opacity-80 transition-opacity shrink-0">
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
            {post.isEdited && <span className="text-[10px] text-muted-foreground/70 ml-1 font-normal">(edited)</span>}
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
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenRepostModal();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
              >
                <Repeat2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Repost or Quote</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onShare();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
              >
                <Link2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Copy Share Link</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenReportModal();
                }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 border-t border-border/40 mt-1 pt-2"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Report Post</span>
              </button>

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
  );
}
