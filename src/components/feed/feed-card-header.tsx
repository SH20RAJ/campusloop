"use client";

import { Archive, Copy, Flag, Link2, MoreHorizontal, School } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { archivePost, deletePost } from "@/app/app/(main)/post/actions";
import {
  AnimatedIcon,
  AnimateRepeat2,
  AnimateShieldCheck,
  AnimateTrash2,
} from "@/components/ui/animated-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { FeedPost } from "@/hooks/use-feed";
import { formatTimeAgo } from "@/lib/utils";

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
      toast.success(
        res.isArchived ? "Post moved to your private archive 📦" : "Post restored to public feeds 🚀"
      );
      router.refresh();
    } catch {
      toast.error("Failed to update post archive status");
    } finally {
      setIsArchiving(false);
    }
  }

  const authorName = post.isAnonymous
    ? post.pseudonym
      ? `🫣 @${post.pseudonym}`
      : "🫣 Anonymous"
    : post.author?.displayName || "Student";
  const authorHandle = post.isAnonymous ? null : `@${post.author?.username || "student"}`;
  const isVerified = Boolean(
    !post.isAnonymous && ((post.author?.points || 0) >= 150 || post.author?.role === "ADMIN")
  );

  const institutionDisplayName =
    post.institution?.name?.split(",")?.[0]?.replace(/^(Birla Institute of Technology)/i, "BIT") || null;

  return (
    <div className="space-y-0.5 min-w-0 select-none">
      {/* Primary Author & Time Row */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {!post.isAnonymous ? (
            <Link
              href={`/@${post.author?.username || "student"}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-[14px] sm:text-[15px] text-foreground hover:underline truncate max-w-[130px] sm:max-w-[200px] shrink-0 sm:shrink"
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-bold text-[14px] sm:text-[15px] text-foreground truncate max-w-[130px] sm:max-w-[200px] shrink-0 sm:shrink">
              {authorName}
            </span>
          )}

          {isVerified && (
            <AnimatedIcon
              icon={AnimateShieldCheck}
              animation="pop"
              size={14}
              className="text-[#a170ff] shrink-0"
            />
          )}

          {authorHandle && (
            <span className="text-muted-foreground text-xs sm:text-[13px] truncate max-w-[90px] sm:max-w-[130px] shrink-0 sm:shrink">
              {authorHandle}
            </span>
          )}

          <span className="text-muted-foreground/40 text-xs shrink-0">·</span>

          <span className="text-muted-foreground text-xs shrink-0 whitespace-nowrap">
            {formatTimeAgo(post.createdAt)}
          </span>
        </div>

        {/* Right Actions: Confession/Meme Pill & More Menu */}
        <div className="flex items-center gap-1 shrink-0">
          {post.type === "CONFESSION" && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Confession
            </span>
          )}
          {post.type === "MEME" && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1">
              <span>Meme</span>
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
              className="size-7 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-[#a170ff] hover:bg-[#a170ff]/10 transition-colors cursor-pointer"
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
                    <AnimatedIcon
                      icon={AnimateRepeat2}
                      animation="nudge-right"
                      size={16}
                      className="text-emerald-500"
                    />
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
                    onClick={async () => {
                      setShowMenu(false);
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        try {
                          await navigator.clipboard.writeText(post.body || "");
                          toast.success("Post text copied to clipboard! 📋");
                        } catch {
                          toast.error("Failed to copy text");
                        }
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Copy className="size-4 text-purple-500" />
                    <span>Copy Text</span>
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
                        <AnimatedIcon icon={AnimateTrash2} animation="shake" size={16} />
                        <span>Delete Post</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Optional Context Sub-Row: Community & College */}
      {(post.community || (!post.isAnonymous && institutionDisplayName)) && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 font-medium truncate pt-0.5">
          {post.community && (
            <Link
              href={`/app/communities/${post.community.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary font-bold hover:underline truncate max-w-[180px] sm:max-w-[260px] inline-flex items-center gap-1"
              title={`c/${post.community.name}`}
            >
              <span>c/{post.community.name}</span>
            </Link>
          )}

          {post.community && !post.isAnonymous && institutionDisplayName && (
            <span className="text-muted-foreground/40">·</span>
          )}

          {!post.isAnonymous && institutionDisplayName && (
            <Link
              href={`/app/college/${post.institution?.slug || post.institutionId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-foreground truncate max-w-[140px] sm:max-w-[200px] inline-flex items-center gap-1 transition-colors"
              title={post.institution?.name || ""}
            >
              <School className="size-3 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{institutionDisplayName}</span>
            </Link>
          )}
        </div>
      )}

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
