"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CornerDownRight, Reply } from "lucide-react";
import Link from "next/link";
import { Comment, UserProfile } from "@/db/schema";
import { getAvatarUrl } from "@/lib/utils";

export type CommentWithAuthor = Comment & {
  author: UserProfile;
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
  const isAnon = comment.isAnonymous;
  const displayName = isAnon ? "Anonymous Student" : comment.author.displayName;
  const handle = isAnon ? "anonymous" : comment.author.username;
  const fallback = isAnon ? "A" : comment.author.displayName[0].toUpperCase();
  const avatarUrl = isAnon ? "" : getAvatarUrl(comment.author.avatarUrl, comment.author.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`group relative flex gap-3 text-xs ${depth > 0 ? "ml-4 sm:ml-8 pl-3 border-l-2 border-border/40 mt-3" : "pt-3 border-t border-border/30"}`}
    >
      <div className="shrink-0">
        {!isAnon ? (
          <Link href={`/@${handle}`}>
            <Avatar className="h-7 w-7 border hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="text-[10px] font-bold">{fallback}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-7 w-7 border">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="text-[10px] font-bold">{fallback}</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {!isAnon ? (
              <Link href={`/@${handle}`} className="font-bold text-foreground hover:underline truncate">
                {displayName}
              </Link>
            ) : (
              <span className="font-bold text-foreground truncate">{displayName}</span>
            )}
            <span className="text-muted-foreground/60 text-[10px]">@{handle}</span>
          </div>

          {depth < 3 && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <Reply className="size-3" /> Reply
            </button>
          )}
        </div>

        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.body}</p>

        {/* Inline Reply Form */}
        {replyingToId === comment.id && (
          <div className="mt-2.5 space-y-2 bg-muted/20 p-2.5 rounded-xl border border-border/40">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Reply to @${handle}...`}
              rows={2}
              className="w-full rounded-lg border border-border/60 bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary resize-none"
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReplyIsAnon(!replyIsAnon)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
                  replyIsAnon ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-muted/40 text-muted-foreground border-border/40"
                }`}
              >
                {replyIsAnon ? "🔒 Anon Reply" : "👤 Public Reply"}
              </button>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => submitReply(comment.id)}
                  disabled={isSubmitting || !replyBody.trim()}
                  className="px-3 py-1 text-[10px] font-semibold rounded-lg bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
