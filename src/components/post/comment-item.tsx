"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatedIcon,
  AnimateHeart,
  AnimateMessageCircle,
  AnimateShieldCheck,
  useIconHandle,
} from "@/components/ui/animated-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  detectMentionTrigger,
  MentionSuggestions,
  type TriggerContext,
} from "@/components/ui/mention-autocomplete";
import { RichText } from "@/components/ui/rich-text";
import type { Comment } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

export type CommentWithAuthor = Omit<Comment, "createdAt" | "updatedAt"> & {
  createdAt: Date | string;
  updatedAt?: Date | string;
  author: {
    id?: string;
    username?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    points?: number | null;
    institutionId?: string | null;
  } | null;
};

interface CommentItemProps {
  comment: CommentWithAuthor;
  depth?: number;
  isPostAuthor?: boolean;
  hasReplies?: boolean;
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
  isPostAuthor = false,
  hasReplies = false,
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
  const [replyMentionTrigger, setReplyMentionTrigger] = useState<TriggerContext | null>(null);
  const replyInputRef = useRef<HTMLTextAreaElement | null>(null);
  const reply = useIconHandle();
  const like = useIconHandle();

  const isAnon = comment.isAnonymous;
  const displayName = isAnon ? "Anonymous Student" : comment.author?.displayName || "Student";
  const handle = isAnon ? comment.pseudonym || "anonymous" : comment.author?.username || "student";
  const fallback = isAnon ? "🙈" : (comment.author?.displayName?.[0] ?? "S").toUpperCase();
  const avatarUrl = isAnon
    ? ""
    : getAvatarUrl(comment.author?.avatarUrl, comment.author?.username ?? "student");
  const isVerified = Boolean(!isAnon && (comment.author?.points || 0) >= 150);

  const isReplying = replyingToId === comment.id;

  function handleToggleLike() {
    if (liked) {
      sounds.tap();
      haptics.light();
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      sounds.pop();
      haptics.medium();
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  }

  function handleReplyInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setReplyBody(val);
    const cursor = e.target.selectionStart ?? val.length;
    setReplyMentionTrigger(detectMentionTrigger(val, cursor));
  }

  function handleSelectReplySuggestion(replacement: string, trigger: TriggerContext) {
    const before = replyBody.slice(0, trigger.startIndex);
    const after = replyBody.slice(trigger.endIndex);
    const newText = `${before}${replacement}${after}`;
    setReplyBody(newText);
    setReplyMentionTrigger(null);
    setTimeout(() => {
      if (replyInputRef.current) {
        replyInputRef.current.focus();
        const newPos = before.length + replacement.length;
        replyInputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  }

  return (
    <div className="relative group">
      {/* Twitter Vertical Thread Connector Line */}
      {hasReplies && depth === 0 && (
        <div className="absolute left-5 top-11 bottom-0 w-0.5 bg-border/40 -z-0" />
      )}

      <div
        className={cn(
          "flex gap-3 py-3 text-foreground transition-colors",
          depth > 0 &&
            "pl-8 sm:pl-10 relative before:absolute before:left-3.5 before:top-0 before:bottom-6 before:w-0.5 before:bg-border/40"
        )}
      >
        {/* Avatar */}
        <div className="shrink-0 relative z-10">
          {!isAnon ? (
            <Link href={`/@${handle}`}>
              <Avatar className="size-9 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                  {fallback}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="size-9 rounded-full border border-border/40 bg-muted">
              <AvatarFallback className="text-xs font-bold">{fallback}</AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Comment Body & Header */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap text-[13px] leading-none">
              {!isAnon ? (
                <Link href={`/@${handle}`} className="font-bold text-foreground hover:underline truncate">
                  {displayName}
                </Link>
              ) : (
                <span className="font-bold text-foreground truncate">{displayName}</span>
              )}

              {isVerified && (
                <AnimatedIcon
                  icon={AnimateShieldCheck}
                  animation="pop"
                  size={14}
                  className="text-[#a170ff] shrink-0"
                />
              )}

              {/* OP / Author Badge */}
              {isPostAuthor && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-black text-primary border border-primary/20">
                  Author
                </span>
              )}

              <span className="text-xs text-muted-foreground truncate">@{handle}</span>

              <span className="text-muted-foreground/60">·</span>

              <span className="text-xs text-muted-foreground/70 shrink-0">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>

            <button
              type="button"
              className="size-7 rounded-full hover:bg-muted text-muted-foreground/50 hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </div>

          {/* Comment Content */}
          <div className="text-[14px] leading-relaxed text-foreground break-words font-normal">
            <RichText content={comment.body} />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-6 pt-1 text-xs text-muted-foreground select-none">
            {/* Reply Button */}
            <button
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                if (isReplying) {
                  setReplyingToId(null);
                } else {
                  onReply(comment.id);
                  setReplyBody(`@${handle} `);
                }
              }}
              {...reply.handlers}
              className="flex items-center gap-1.5 hover:text-[#a170ff] transition-colors cursor-pointer group/reply"
            >
              <div className="size-7 rounded-full group-hover/reply:bg-[#a170ff]/10 flex items-center justify-center transition-colors">
                <AnimatedIcon
                  ref={reply.ref}
                  icon={AnimateMessageCircle}
                  animation="pop"
                  size={15}
                  animateOnHover={false}
                />
              </div>
              <span className="text-[11px] font-semibold">Reply</span>
            </button>

            {/* Like / Heart Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              {...like.handlers}
              className={cn(
                "flex items-center gap-1.5 transition-colors cursor-pointer group/like",
                liked ? "text-rose-500" : "hover:text-rose-500"
              )}
            >
              <div className="size-7 rounded-full group-hover/like:bg-rose-500/10 flex items-center justify-center transition-colors">
                <AnimatedIcon
                  ref={like.ref}
                  icon={AnimateHeart}
                  animation="beat"
                  size={15}
                  animateOnHover={false}
                  playKey={liked}
                  iconClassName={cn(
                    "transition-colors",
                    liked
                      ? "fill-rose-500 text-rose-500"
                      : "text-muted-foreground group-hover/like:text-rose-500"
                  )}
                />
              </div>
              {likesCount > 0 && <span className="text-[11px] font-semibold">{likesCount}</span>}
            </button>
          </div>

          {/* Inline Reply Composer */}
          {isReplying && (
            <div className="relative pt-2 space-y-2">
              <MentionSuggestions
                trigger={replyMentionTrigger}
                onSelect={handleSelectReplySuggestion}
                onClose={() => setReplyMentionTrigger(null)}
                className="bottom-full mb-2 left-0"
              />

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 space-y-2.5">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Replying to <span className="text-primary font-bold">@{handle}</span>
                </p>

                <textarea
                  ref={replyInputRef}
                  value={replyBody}
                  onChange={handleReplyInputChange}
                  placeholder="Post your reply..."
                  rows={2}
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none resize-none leading-relaxed"
                  autoFocus
                />

                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <button
                    type="button"
                    onClick={() => setReplyIsAnon(!replyIsAnon)}
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer",
                      replyIsAnon
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {replyIsAnon ? "🕶️ Anon" : "👤 Public"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingToId(null)}
                      className="px-3 py-1 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || !replyBody.trim()}
                      onClick={() => {
                        sounds.send();
                        haptics.medium();
                        submitReply(comment.id);
                      }}
                      className="px-3.5 py-1 rounded-full bg-foreground text-background text-xs font-black disabled:opacity-40 hover:opacity-90 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
