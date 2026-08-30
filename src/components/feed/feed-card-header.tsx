"use client";

import { archivePost,deletePost } from "@/app/app/(main)/post/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FeedPost } from "@/hooks/use-feed";
import { formatTimeAgo } from "@/lib/utils";
import {
Archive,
Flag,
Link2,
MoreHorizontal,
Repeat2,
School,
ShieldCheck,
Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleToggleArchive() {
    setIsArchiving(true);
    setShowMenu(false);
    try {
      const res = await archivePost(post.id);
      toast.success(res.isArchived ? "Post moved to your private archive 📦" : "Post restored to public feeds 🚀");
      router.refresh();
    } catch {
      toast.error("Failed to update post archive status");
    } finally {
      setIsArchiving(false);
    }
  }

  const authorName = post.isAnonymous
    ? (post.pseudonym ? `🫣 @${post.pseudonym}` : "🫣 Anonymous")
    : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? null : `@${post.author?.username || "student"}`;
  const isVerified = Boolean(!post.isAnonymous && ((post.author?.points || 0) >= 150 || post.author?.role === "ADMIN"));

  const institutionDisplayName =
    post.institution?.name?.split(",")?.[0]?.replace(/^(Birla Institute of Technology)/i, "BIT") ||
    null;

  return (
    <div className="flex items-center justify-between gap-2 min-w-0 select-none">
      <div className="flex items-center gap-1.5 flex-wrap text-[15px] leading-tight min-w-0">
        {!post.isAnonymous ? (
          <Link
            href={`/@${post.author?.username || "student"}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-foreground hover:underline truncate"
          >
            {authorName}
          </Link>
        ) : (
          <span className="font-bold text-foreground truncate">{authorName}</span>
        )}

        {isVerified && (
          <ShieldCheck className="size-4 text-[#1d9bf0] shrink-0" />
        )}

        {authorHandle && (
          <span className="text-muted-foreground text-[14px] truncate">
            {authorHandle}
          </span>
        )}

        <span className="text-muted-foreground/60 text-xs">·</span>

        <span className="text-muted-foreground/70 text-xs shrink-0">
          {formatTimeAgo(post.createdAt)}
        </span>

        {institutionDisplayName && (
          <>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <Link
              href={`/app/college/${post.institution?.slug || post.institutionId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground truncate max-w-[120px] sm:max-w-[180px] text-xs font-semibold inline-flex items-center gap-1 transition-colors"
              title={post.institution?.name || ""}
            >
              <School className="size-3 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{institutionDisplayName}</span>
            </Link>
          </>
        )}
      </div>

      {/* Right Side: Category Pill & Twitter 3 Dots */}
      <div className="flex items-center gap-1.5 shrink-0">
        {post.community && (
          <Link
            href={`/app/communities/${post.community.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
              c/{post.community.name}
            </span>
          </Link>
        )}

        {post.type === "CONFESSION" && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Confession
          </span>
        )}

        {/* More Options Button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="size-7 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10 transition-colors cursor-pointer"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div
                className="absolute right-0 mt-1.5 w-48 rounded-2xl border border-border/50 bg-popover text-popover-foreground shadow-2xl z-30 py-1.5 animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenRepostModal();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Repeat2 className="size-4 text-emerald-500" />
                  <span>Repost or Quote</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onShare();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Link2 className="size-4 text-blue-500" />
                  <span>Copy Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenReportModal();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Flag className="size-4" />
                  <span>Report Post</span>
                </button>

                {currentUserId && post.authorId === currentUserId && (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleArchive}
                      disabled={isArchiving}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2 border-t border-border/30 mt-1"
                    >
                      <Archive className="size-4 text-amber-500" />
                      <span>{post.status === "ARCHIVED" ? "Restore to Feed" : "Archive Post"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete Post</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deletePost(post.id);
            toast.success("Post deleted");
            router.refresh();
          } catch {
            toast.error("Failed to delete post");
          } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
          }
        }}
        title="Delete post?"
        description="This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        variant="danger"
      />

    </div>
  );
}
