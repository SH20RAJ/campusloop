"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reply, Heart } from "lucide-react";
import Link from "next/link";
import { Comment } from "@/db/schema";
import { getAvatarUrl, formatTimeAgo } from "@/lib/utils";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";

export type CommentWithAuthor = Omit<Comment, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt?: Date | string;
  author: {
    id?: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    points?: number | null;
  } | null;
};

interface CommentItemProps {
  comment: CommentWithAuthor;
  depth?: number;
  onReply: (id: string) => void;
  replyingToId: string | null;
  replyBody: string;
  setReplyBody: (v: string) => void;
  setReplyingToId: (v: string | null) => void;
  replyIsAnon: boolean;
  setReplyIsAnon: (v: boolean) => void;
  isSubmitting: boolean;
  submitReply: (parentId: string) => void;
}

export function CommentItem({
  comment,
  depth = 0,
  onReply,
  replyingToId,
  replyBody,
  setReplyBody,
  setReplyingToId,
  replyIsAnon,
  setReplyIsAnon,
  isSubmitting,
  submitReply,
}: CommentItemProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const isAnon = comment.isAnonymous;
  const displayName = isAnon ? "Anonymous Student" : comment.author?.displayName || "Student";
  const handle = isAnon ? comment.pseudonym || "anonymous" : comment.author?.username || "student";
  const fallback = isAnon ? "🙈" : (comment.author?.displayName?.[0] ?? "S").toUpperCase();
  const avatarUrl = isAnon ? "" : getAvatarUrl(comment.author?.avatarUrl, comment.author?.username ?? "student");
  const isVerified = Boolean(!isAnon && (comment.author?.points || 0) >= 150);

  function handleToggleLike() {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`group relative flex gap-2.5 text-xs ${
        depth > 0
          ? "ml-6 sm:ml-9 pl-3 border-l-2 border-primary/20 mt-2"
          : "pt-1"
      }`}
    >
      <div className="shrink-0 pt-0.5">
        {!isAnon ? (
          <Link href={`/@${handle}`}>
            <Avatar className="size-8 rounded-xl border border-border hover:opacity-85 transition-opacity">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="size-8 rounded-xl border border-border">
            <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
              {fallback}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        {/* Comment Bubble (Matching Reference 3 Thread Replies) */}
        <div className="rounded-2xl bg-card hover:border-border transition-colors p-3.5 border border-border/60 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {!isAnon ? (
                <Link
                  href={`/@${handle}`}
                  className="font-bold text-foreground hover:underline truncate text-xs flex items-center gap-1"
                >
                  <span className="truncate">{displayName}</span>
                  {isVerified && (
                    <span className="text-blue-500 text-[10px] font-bold" title="Verified Student">
                      ✓
                    </span>
                  )}
                </Link>
              ) : (
                <span className="font-bold text-foreground truncate text-xs">
                  {displayName} 🙈
                </span>
              )}
              <span className="text-muted-foreground/60 text-[10px]">@{handle}</span>
            </div>

            <span className="text-muted-foreground/60 text-[10px] shrink-0 font-medium">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <div className="text-xs text-foreground/90 leading-relaxed font-normal">
            <RichText content={comment.body} />
          </div>
        </div>

        {/* Comment Actions (Like / Reply) */}
        <div className="flex items-center gap-4 px-2 text-[11px] font-bold text-muted-foreground select-none">
          <button
            type="button"
            onClick={handleToggleLike}
            className={cn(
              "hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer py-0.5",
              liked && "text-rose-500 font-extrabold"
            )}
          >
            <Heart className={cn("size-3.5", liked && "fill-rose-500 text-rose-500")} />
            <span>{likesCount > 0 ? `${likesCount}` : "Like"}</span>
          </button>

          {depth < 3 && (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer py-0.5"
            >
              <Reply className="size-3.5" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Inline Facebook-Style Nested Reply Box */}
        {replyingToId === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 space-y-2 bg-card p-3 rounded-2xl border border-border/80 shadow-xs"
          >
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  submitReply(comment.id);
                }
              }}
              placeholder={`Write a reply to @${handle}...`}
              rows={2}
              className="w-full rounded-xl border border-border/60 bg-muted/20 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary resize-none font-medium leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReplyIsAnon(!replyIsAnon)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  replyIsAnon
                    ? "bg-pink-500/10 text-pink-500 border-pink-500/30"
                    : "bg-muted/40 text-muted-foreground border-border/50"
                }`}
              >
                {replyIsAnon ? "🔒 Anon Reply" : "👤 Public Reply"}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitReply(comment.id)}
                  disabled={isSubmitting || !replyBody.trim()}
                  className="px-3.5 py-1 text-[11px] font-bold rounded-xl bg-primary text-primary-foreground disabled:opacity-40 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
