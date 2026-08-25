"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Lock, BarChart3, HelpCircle, Repeat2, Link2, Flag, Trash2 } from "lucide-react";
import { cn, getAvatarUrl, formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { deletePost } from "@/app/app/(main)/post/actions";
import { FeedPost } from "@/hooks/use-feed";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? post.pseudonym || "anonymous" : post.author?.username || "student";
  const avatarFallback = post.isAnonymous ? "A" : (post.author?.displayName?.[0] ?? "S");
  const avatarUrl = post.isAnonymous ? "" : getAvatarUrl(post.author?.avatarUrl, post.author?.username ?? "student");

  return (
    <div className="p-4 sm:p-5 pb-2 flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        {!post.isAnonymous ? (
          <Link href={`/@${authorHandle}`}>
            <Avatar className="size-10 rounded-2xl hover:opacity-85 transition-opacity shrink-0">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="rounded-2xl font-bold text-xs bg-primary/10 text-primary">{avatarFallback}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="size-10 rounded-2xl shrink-0 bg-muted/50">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="rounded-2xl font-bold text-xs bg-muted text-muted-foreground">{avatarFallback}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            {!post.isAnonymous ? (
              <Link href={`/@${authorHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer flex items-center gap-1 truncate">
                <span className="truncate font-bold text-sm text-foreground">{authorName}</span>
                {(post.author && (post.author.points >= 150 || post.author.role === "ADMIN")) && (
                  <span title="Verified Campus Star (Unlocked at 150+ LP)">
                    <svg className="size-3.5 text-blue-500 fill-blue-500 shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </span>
                )}
              </Link>
            ) : (
              <span className="font-bold text-sm text-foreground truncate">{authorName}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            {!post.isAnonymous ? (
              <Link href={`/@${authorHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                @{authorHandle}
              </Link>
            ) : (
              <span>@{authorHandle}</span>
            )}
            <span>•</span>
            <Link href={`/app/college/${post.institution?.slug || post.institutionId}`} className="hover:text-primary transition-colors hover:underline truncate max-w-[140px]">
              {post.institution?.name?.split(",")[0] || "Campus"}
            </Link>
            <span className="text-[10px] text-muted-foreground/70">• {formatTimeAgo(post.createdAt)}</span>
            {post.isEdited && <span className="text-[10px] text-muted-foreground/70 ml-0.5">(edited)</span>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 shrink-0">
        {post.community && (
          <Link href={`/app/communities/${post.community.id}`}>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md badge-tag-purple hover:opacity-85 transition-opacity cursor-pointer">
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
              "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer",
              post.type === "CONFESSION" && "badge-tag-rose",
              post.type === "POLL" && "badge-tag-cyan",
              post.type === "QUESTION" && "badge-tag-peach"
            )}>
              {post.type === "CONFESSION" && (
                <>
                  <Lock className="size-2.5" />
                  <span>Confession</span>
                </>
              )}
              {post.type === "POLL" && (
                <>
                  <BarChart3 className="size-2.5" />
                  <span>Poll</span>
                </>
              )}
              {post.type === "QUESTION" && (
                <>
                  <HelpCircle className="size-2.5" />
                  <span>Question</span>
                </>
              )}
            </span>
          </Link>
        )}

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
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
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
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

      {/* Modern Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Post?"
        description="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deletePost(post.id);
            toast.success("Post deleted successfully");
            setShowDeleteConfirm(false);
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete post");
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}
