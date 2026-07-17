"use client";

import { useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment, UserProfile } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CornerDownRight, MessageSquare, Lock, X, Reply } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CommentWithAuthor = Comment & {
  author: UserProfile;
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<CommentWithAuthor[]>;
});

export function PostComments({ postId }: { postId: string }) {
  const { data: comments, error, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  // Root level comment state
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reply level comment state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyIsAnon, setReplyIsAnon] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  async function handleRootSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isAnonymous }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to post comment");
      }

      setBody("");
      mutate();
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReplySubmit(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setIsReplying(true);
    setReplyError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: replyBody,
          isAnonymous: replyIsAnon,
          parentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to post reply");
      }

      setReplyBody("");
      setReplyingToId(null);
      mutate();
    } catch (err: any) {
      setReplyError(err.message || "An error occurred");
    } finally {
      setIsReplying(false);
    }
  }

  // Structure flat comments into tree (Root comments and their replies)
  const rootComments = comments ? comments.filter(c => !c.parentId) : [];
  const getRepliesFor = (commentId: string) => {
    return comments ? comments.filter(c => c.parentId === commentId) : [];
  };

  return (
    <div className="space-y-6">
      {/* Root Comment Form */}
      <form onSubmit={handleRootSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <textarea
          placeholder="Share your thoughts..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          className="flex min-h-[70px] w-full rounded-xl border border-border/80 bg-transparent px-3.5 py-2.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-medium leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              id="anon-comment"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-border/80 text-primary focus:ring-ring cursor-pointer"
            />
            <label htmlFor="anon-comment" className="text-xs font-bold text-muted-foreground select-none cursor-pointer flex items-center gap-1">
              <Lock className="h-3 w-3" /> Comment Anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="rounded-xl bg-primary text-white h-8.5 px-4 text-xs font-bold shadow-md shadow-primary/10 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>

        {submitError && (
          <p className="text-xs text-destructive font-bold">{submitError}</p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-muted-foreground" /> Discussions ({comments?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-3.5 w-3/4 rounded pl-10" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <Skeleton className="h-3.5 w-3/4 rounded pl-10" />
            </div>
          </div>
        ) : error ? (
          <p className="text-xs font-bold text-destructive">Failed to load comments.</p>
        ) : rootComments.length > 0 ? (
          <div className="space-y-4">
            {rootComments.map((comment) => {
              const rootDisplayName = comment.isAnonymous ? "Anonymous Student" : comment.author.displayName;
              const rootHandle = comment.isAnonymous ? "anonymous" : comment.author.username;
              const rootFallback = comment.isAnonymous ? "A" : comment.author.displayName[0];
              const rootAvatar = comment.isAnonymous ? "" : comment.author.avatarUrl;
              const replies = getRepliesFor(comment.id);

              return (
                <div key={comment.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                  {/* Root Comment Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {!comment.isAnonymous ? (
                        <Link href={`/app/profile/${rootHandle}`}>
                          <Avatar className="h-8 w-8 border hover:opacity-85 transition-opacity cursor-pointer">
                            <AvatarImage src={rootAvatar || ""} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{rootFallback}</AvatarFallback>
                          </Avatar>
                        </Link>
                      ) : (
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={rootAvatar || ""} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{rootFallback}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1">
                          {!comment.isAnonymous ? (
                            <Link href={`/app/profile/${rootHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                              {rootDisplayName}
                            </Link>
                          ) : (
                            rootDisplayName
                          )}
                          {!comment.isAnonymous && <span className="text-blue-500 text-[9px]">●</span>}
                        </span>
                        <span className="text-[10px] text-muted-foreground">@{rootHandle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReplyingToId(comment.id);
                        setReplyBody("");
                        setReplyIsAnon(false);
                      }}
                      className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Body */}
                  <p className="text-xs leading-relaxed text-foreground font-medium pl-10.5">
                    {comment.body}
                  </p>

                  {/* Replies List */}
                  {replies.length > 0 && (
                    <div className="pl-6 border-l-2 border-border/50 ml-4.5 mt-3 space-y-3.5">
                      {replies.map((reply) => {
                        const replyDisplayName = reply.isAnonymous ? "Anonymous Student" : reply.author.displayName;
                        const replyHandle = reply.isAnonymous ? "anonymous" : reply.author.username;
                        const replyFallback = reply.isAnonymous ? "A" : reply.author.displayName[0];
                        const replyAvatar = reply.isAnonymous ? "" : reply.author.avatarUrl;

                        return (
                          <div key={reply.id} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                              {!reply.isAnonymous ? (
                                <Link href={`/app/profile/${replyHandle}`}>
                                  <Avatar className="h-6.5 w-6.5 border hover:opacity-85 transition-opacity cursor-pointer">
                                    <AvatarImage src={replyAvatar || ""} />
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{replyFallback}</AvatarFallback>
                                  </Avatar>
                                </Link>
                              ) : (
                                <Avatar className="h-6.5 w-6.5 border">
                                  <AvatarImage src={replyAvatar || ""} />
                                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">{replyFallback}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-foreground flex items-center gap-0.5 truncate">
                                  {!reply.isAnonymous ? (
                                    <Link href={`/app/profile/${replyHandle}`} className="hover:text-primary transition-colors hover:underline cursor-pointer">
                                      {replyDisplayName}
                                    </Link>
                                  ) : (
                                    replyDisplayName
                                  )}
                                  {!reply.isAnonymous && <span className="text-blue-500 text-[8px]">●</span>}
                                </span>
                                <span className="text-[9px] text-muted-foreground truncate">@{replyHandle}</span>
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed text-foreground font-medium pl-12">
                              {reply.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Reply Composer Form */}
                  {replyingToId === comment.id && (
                    <div className="pl-6 border-l-2 border-primary/20 ml-4.5 mt-3 animate-in slide-in-from-top-1 duration-200">
                      <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-3 bg-muted/30 border border-border/80 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                            <CornerDownRight className="h-3 w-3" /> Replying to @{rootHandle}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="h-5 w-5 hover:bg-muted rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <textarea
                          placeholder="Type your reply..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          required
                          rows={2}
                          className="flex min-h-[40px] w-full rounded-lg border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-medium leading-relaxed"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input 
                              id={`anon-reply-${comment.id}`}
                              type="checkbox"
                              checked={replyIsAnon}
                              onChange={(e) => setReplyIsAnon(e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-border/80 text-primary focus:ring-ring cursor-pointer"
                            />
                            <label htmlFor={`anon-reply-${comment.id}`} className="text-[10px] font-bold text-muted-foreground select-none cursor-pointer flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" /> Reply Anonymously
                            </label>
                          </div>

                          <button
                            type="submit"
                            disabled={isReplying || !replyBody.trim()}
                            className="rounded-lg bg-primary text-white h-7.5 px-3.5 text-[10px] font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isReplying ? "Replying..." : "Post"}
                          </button>
                        </div>
                        {replyError && (
                          <p className="text-[10px] text-destructive font-bold">{replyError}</p>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-2xl border-border bg-card text-muted-foreground text-xs font-semibold">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
