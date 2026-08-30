"use client";

import { CornerDownRight, Loader2, MessageSquare, Send, ShieldCheck, ThumbsUp, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface ArticleCommentsSectionProps {
  articleSlug: string;
  currentProfile?: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export function ArticleCommentsSection({ articleSlug, currentProfile }: ArticleCommentsSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR<{
    comments: any[];
    totalCount: number;
  }>(`/api/articles/${articleSlug}/comments`, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const comments = data?.comments || [];
  const totalCount = data?.totalCount || 0;

  async function handleAddComment(parentId: string | null = null) {
    const textToSend = parentId ? replyText.trim() : commentText.trim();
    if (!textToSend) return;

    if (!currentProfile) {
      toast.info("Please sign in to join the discussion.");
      return;
    }

    setIsSubmitting(true);
    sounds.send();
    haptics.medium();

    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: textToSend,
          parentId,
        }),
      });

      if (!res.ok) {
        const errPayload = (await res.json()) as { error?: string };
        throw new Error(errPayload.error || "Failed to post comment");
      }

      toast.success(parentId ? "Reply posted! 💬" : "Comment added! 💬");
      if (parentId) {
        setReplyingToId(null);
        setReplyText("");
      } else {
        setCommentText("");
      }
      mutate();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post comment";
      toast.error(msg);
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVoteComment(commentId: string) {
    if (!currentProfile) {
      toast.info("Please sign in to upvote comments.");
      return;
    }

    sounds.pop();
    haptics.light();

    try {
      const res = await fetch(`/api/articles/${articleSlug}/comments/${commentId}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote failed");
      mutate();
    } catch {
      toast.error("Failed to upvote comment");
    }
  }

  return (
    <section className="space-y-6 pt-10 border-t border-border/40">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" />
          <span>Discussion &amp; Insights ({totalCount})</span>
        </h3>
      </div>

      {/* ─── Root Comment Composer ─── */}
      <div className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-3 shadow-xs">
        <div className="flex items-start gap-3">
          <Avatar className="size-8 shrink-0 border border-border/40">
            <AvatarImage src={currentProfile?.avatarUrl || ""} />
            <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
              {currentProfile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <textarea
              rows={3}
              placeholder={
                currentProfile
                  ? "Share your perspective, question, or experience on this article..."
                  : "Sign in to join the conversation..."
              }
              disabled={!currentProfile || isSubmitting}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/20">
          <span className="text-[11px] text-muted-foreground">Be respectful &amp; insightful.</span>
          <button
            type="button"
            disabled={!commentText.trim() || isSubmitting}
            onClick={() => handleAddComment(null)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            <span>Comment</span>
          </button>
        </div>
      </div>

      {/* ─── Threaded Comments List ─── */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
            <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((root) => {
            const author = root.author;
            const isVerified = (author?.points || 0) >= 150;
            const formattedDate = root.createdAt
              ? new Date(root.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })
              : "Just now";

            return (
              <div
                key={root.id}
                className="rounded-2xl border border-border/30 bg-card/40 p-4 space-y-3 transition-colors hover:bg-card/70"
              >
                {/* Root Comment Header */}
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/@${author?.username || "student"}`}
                    className="flex items-center gap-2 min-w-0 group cursor-pointer"
                  >
                    <Avatar className="size-7 shrink-0 border border-border/40">
                      <AvatarImage src={author?.avatarUrl || ""} />
                      <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                        {author?.displayName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground group-hover:underline flex items-center gap-1">
                        <span>{author?.displayName || `@${author?.username}`}</span>
                        {isVerified && <ShieldCheck className="size-3 text-blue-500 shrink-0" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        @{author?.username}
                        {author?.institution?.name ? ` · ${author.institution.name.split(",")[0]}` : ""}
                      </p>
                    </div>
                  </Link>

                  <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                    {formattedDate}
                  </span>
                </div>

                {/* Root Comment Body */}
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap pl-9">
                  {root.body}
                </p>

                {/* Root Comment Actions */}
                <div className="flex items-center gap-3 pl-9 pt-1 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => handleVoteComment(root.id)}
                    className={cn(
                      "flex items-center gap-1 font-bold transition-colors cursor-pointer",
                      root.userVote > 0 ? "text-primary font-black" : "hover:text-foreground"
                    )}
                  >
                    <ThumbsUp className="size-3.5" />
                    <span>{root.upvotesCount || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingToId((prev) => (prev === root.id ? null : root.id));
                      setReplyText("");
                    }}
                    className="flex items-center gap-1 hover:text-foreground font-semibold cursor-pointer"
                  >
                    <CornerDownRight className="size-3.5" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply Composer */}
                {replyingToId === root.id && (
                  <div className="ml-9 mt-2 p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2 animate-in fade-in-50">
                    <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                      <span>Replying to @{author?.username}</span>
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        disabled={!replyText.trim() || isSubmitting}
                        onClick={() => handleAddComment(root.id)}
                        className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── Nested Replies ─── */}
                {root.replies && root.replies.length > 0 && (
                  <div className="ml-9 mt-3 pl-3 border-l-2 border-border/40 space-y-3">
                    {root.replies.map((reply: any) => {
                      const replyAuthor = reply.author;
                      const replyVerified = (replyAuthor?.points || 0) >= 150;
                      const replyDate = reply.createdAt
                        ? new Date(reply.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Just now";

                      return (
                        <div key={reply.id} className="space-y-1.5 pt-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/@${replyAuthor?.username || "student"}`}
                              className="flex items-center gap-1.5 group cursor-pointer"
                            >
                              <Avatar className="size-5 shrink-0 border border-border/40">
                                <AvatarImage src={replyAuthor?.avatarUrl || ""} />
                                <AvatarFallback className="text-[8px] font-bold">
                                  {replyAuthor?.displayName?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-[11px] font-bold text-foreground group-hover:underline flex items-center gap-1">
                                <span>{replyAuthor?.displayName || `@${replyAuthor?.username}`}</span>
                                {replyVerified && <ShieldCheck className="size-2.5 text-blue-500 shrink-0" />}
                              </p>
                            </Link>

                            <span className="text-[9px] text-muted-foreground">{replyDate}</span>
                          </div>

                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap pl-6">
                            {reply.body}
                          </p>

                          <div className="pl-6 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleVoteComment(reply.id)}
                              className={cn(
                                "flex items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer",
                                reply.userVote > 0
                                  ? "text-primary font-black"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <ThumbsUp className="size-3" />
                              <span>{reply.upvotesCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2 border border-dashed border-border/40 rounded-2xl p-6">
            <p className="font-bold text-foreground">No comments yet</p>
            <p>Be the first to share your thoughts or ask a question on this article.</p>
          </div>
        )}
      </div>
    </section>
  );
}
