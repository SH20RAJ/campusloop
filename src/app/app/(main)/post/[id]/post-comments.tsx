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

export function PostComments({ postId, currentUser }: { postId: string; currentUser: UserProfile }) {
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
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
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
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "An error occurred");
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
      <form onSubmit={handleRootSubmit} className="space-y-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/20">
        <div className="flex gap-3 items-start">
          <Avatar className="h-9 w-9 border shrink-0">
            {isAnonymous ? (
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                <Lock className="h-3.5 w-3.5" />
              </AvatarFallback>
            ) : (
              <>
                <AvatarImage src={currentUser.avatarUrl || ""} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                  {currentUser.displayName[0].toUpperCase()}
                </AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <textarea
              placeholder={isAnonymous ? "Share anonymously..." : "Share your thoughts..."}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={2}
              className="w-full bg-muted/20 hover:bg-muted/40 focus:bg-background border border-border/60 focus:border-primary/45 rounded-xl px-4 py-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none font-medium leading-relaxed transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pl-12">
          {/* Anonymity Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer select-none",
              isAnonymous 
                ? "bg-primary/10 border-primary/25 text-primary shadow-2xs" 
                : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {isAnonymous ? (
              <>
                <Lock className="h-3 w-3 text-primary animate-[pulse_2s_infinite]" />
                <span>Posting Anonymously</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                <span>Go Anonymous</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="rounded-xl bg-primary text-white h-8 px-4 text-xs font-bold shadow-md shadow-primary/10 hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>

        {submitError && (
          <p className="text-[10px] text-destructive font-bold pl-12">{submitError}</p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/30 pb-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" /> Discussions ({comments?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Skeleton className="h-8.5 w-8.5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-2/3 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Skeleton className="h-8.5 w-8.5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-1/2 rounded-2xl" />
              </div>
            </div>
          </div>
        ) : error ? (
          <p className="text-xs font-bold text-destructive">Failed to load comments.</p>
        ) : rootComments.length > 0 ? (
          <div className="space-y-5">
            {rootComments.map((comment) => {
              const rootDisplayName = comment.isAnonymous ? "Anonymous Student" : comment.author.displayName;
              const rootHandle = comment.isAnonymous ? "anonymous" : comment.author.username;
              const rootFallback = comment.isAnonymous ? "A" : comment.author.displayName[0].toUpperCase();
              const rootAvatar = comment.isAnonymous ? "" : comment.author.avatarUrl;
              const replies = getRepliesFor(comment.id);

              return (
                <div key={comment.id} className="space-y-2">
                  {/* Root Comment Container */}
                  <div className="flex gap-3 items-start group">
                    {/* Avatar */}
                    {!comment.isAnonymous ? (
                      <Link href={`/app/profile/${rootHandle}`} className="shrink-0">
                        <Avatar className="h-8.5 w-8.5 border hover:opacity-85 transition-opacity cursor-pointer">
                          <AvatarImage src={rootAvatar || ""} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{rootFallback}</AvatarFallback>
                        </Avatar>
                      </Link>
                    ) : (
                      <Avatar className="h-8.5 w-8.5 border shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          <Lock className="h-3.5 w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Bubble Content */}
                    <div className="flex-1 min-w-0">
                      <div className="inline-block rounded-2xl rounded-tl-none bg-muted/30 border border-border/20 px-4 py-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!comment.isAnonymous ? (
                            <Link href={`/app/profile/${rootHandle}`} className="text-xs font-bold text-foreground hover:text-primary transition-colors hover:underline cursor-pointer">
                              {rootDisplayName}
                            </Link>
                          ) : (
                            <span className="text-xs font-bold text-foreground">
                              {rootDisplayName}
                            </span>
                          )}
                          {!comment.isAnonymous && <span className="text-blue-500 text-[8px]">●</span>}
                          <span className="text-[9px] font-medium text-muted-foreground/75">@{rootHandle}</span>
                        </div>
                        
                        <p className="text-xs leading-relaxed text-foreground font-medium mt-1 select-text break-words whitespace-pre-wrap">
                          {comment.body}
                        </p>
                      </div>

                      {/* Action buttons under bubble */}
                      <div className="flex items-center gap-4 pl-1 mt-1 text-[10px] font-bold text-muted-foreground/75">
                        <span className="cursor-default select-none font-medium">
                          {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        
                        <button
                          onClick={() => {
                            setReplyingToId(comment.id);
                            setReplyBody("");
                            setReplyIsAnon(false);
                          }}
                          className="hover:text-primary hover:underline transition-all cursor-pointer font-bold flex items-center gap-0.5"
                        >
                          <Reply className="h-2.5 w-2.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Replies List */}
                  {replies.length > 0 && (
                    <div className="pl-4 ml-4.5 border-l border-border/30 space-y-3.5 mt-2">
                      {replies.map((reply) => {
                        const replyDisplayName = reply.isAnonymous ? "Anonymous Student" : reply.author.displayName;
                        const replyHandle = reply.isAnonymous ? "anonymous" : reply.author.username;
                        const replyFallback = reply.isAnonymous ? "A" : reply.author.displayName[0].toUpperCase();
                        const replyAvatar = reply.isAnonymous ? "" : reply.author.avatarUrl;

                        return (
                          <div key={reply.id} className="flex gap-2.5 items-start group">
                            {/* Avatar */}
                            {!reply.isAnonymous ? (
                              <Link href={`/app/profile/${replyHandle}`} className="shrink-0">
                                <Avatar className="h-7 w-7 border hover:opacity-85 transition-opacity cursor-pointer">
                                  <AvatarImage src={replyAvatar || ""} />
                                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">{replyFallback}</AvatarFallback>
                                </Avatar>
                              </Link>
                            ) : (
                              <Avatar className="h-7 w-7 border shrink-0">
                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                  <Lock className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}

                            {/* Bubble */}
                            <div className="flex-1 min-w-0">
                              <div className="inline-block rounded-2xl rounded-tl-none bg-muted/20 border border-border/15 px-3.5 py-2 shadow-2xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {!reply.isAnonymous ? (
                                    <Link href={`/app/profile/${replyHandle}`} className="text-[11px] font-bold text-foreground hover:text-primary transition-colors hover:underline cursor-pointer">
                                      {replyDisplayName}
                                    </Link>
                                  ) : (
                                    <span className="text-[11px] font-bold text-foreground">
                                      {replyDisplayName}
                                    </span>
                                  )}
                                  {!reply.isAnonymous && <span className="text-blue-500 text-[7px]">●</span>}
                                  <span className="text-[8.5px] font-medium text-muted-foreground/75">@{replyHandle}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-foreground font-medium mt-0.5 select-text break-words whitespace-pre-wrap">
                                  {reply.body}
                                </p>
                              </div>
                              <div className="pl-1 mt-0.5 text-[9px] font-bold text-muted-foreground/75">
                                <span className="cursor-default select-none font-medium">
                                  {new Date(reply.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Reply Composer Form */}
                  {replyingToId === comment.id && (
                    <div className="pl-4 ml-4.5 border-l border-primary/20 mt-2.5 animate-in slide-in-from-top-1 duration-200">
                      <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="space-y-2.5 bg-muted/20 border border-border/50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-primary flex items-center gap-1">
                            <CornerDownRight className="h-2.5 w-2.5" /> Replying to @{rootHandle}
                          </span>
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="h-5 w-5 hover:bg-muted rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex gap-2.5 items-start">
                          <Avatar className="h-7 w-7 border shrink-0">
                            {replyIsAnon ? (
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                <Lock className="h-3 w-3" />
                              </AvatarFallback>
                            ) : (
                              <>
                                <AvatarImage src={currentUser.avatarUrl || ""} />
                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                  {currentUser.displayName[0].toUpperCase()}
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                          <textarea
                            placeholder="Type your reply..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            required
                            rows={1}
                            className="flex min-h-[32px] w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-medium leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center justify-between pl-9.5">
                          <button
                            type="button"
                            onClick={() => setReplyIsAnon(!replyIsAnon)}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-md border text-[9px] font-bold transition-all cursor-pointer select-none",
                              replyIsAnon 
                                ? "bg-primary/10 border-primary/20 text-primary" 
                                : "bg-background border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {replyIsAnon ? (
                              <>
                                <Lock className="h-2.5 w-2.5 text-primary animate-[pulse_2s_infinite]" />
                                <span>Anonymously</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-2.5 w-2.5" />
                                <span>Go Anonymous</span>
                              </>
                            )}
                          </button>

                          <button
                            type="submit"
                            disabled={isReplying || !replyBody.trim()}
                            className="rounded-lg bg-primary text-white h-7 px-3 text-[10px] font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isReplying ? "Replying..." : "Post"}
                          </button>
                        </div>
                        {replyError && (
                          <p className="text-[9px] text-destructive font-bold pl-9.5">{replyError}</p>
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
