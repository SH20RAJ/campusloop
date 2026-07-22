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

function CommentItem({
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
}: {
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
}) {
  const isAnon = comment.isAnonymous;
  const displayName = isAnon ? "Anonymous Student" : comment.author.displayName;
  const handle = isAnon ? "anonymous" : comment.author.username;
  const fallback = isAnon ? "A" : comment.author.displayName[0].toUpperCase();
  const avatarUrl = isAnon ? "" : comment.author.avatarUrl;

  return (
    <div className={cn("flex gap-2.5 items-start", depth > 0 && "ml-8 pl-3 border-l border-border/30")}>
      <div className="shrink-0">
        {!isAnon ? (
          <Link href={`/@${handle}`}>
            <Avatar className="h-7 w-7 border hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">{fallback}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-7 w-7 border">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
              <Lock className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {!isAnon ? (
            <Link href={`/@${handle}`} className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1">
              <span>{displayName}</span>
              {(comment.author?.points >= 150 || comment.author?.role === "ADMIN") && (
                <svg className="size-3 text-blue-500 fill-blue-500/20 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </Link>
          ) : (
            <span className="text-xs font-bold text-foreground">{displayName}</span>
          )}
          <span className="text-[10px] text-muted-foreground/70 font-medium">
            @{handle} · {new Date(comment.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        </div>

        <p className="text-xs text-foreground/90 leading-relaxed mt-0.5 whitespace-pre-wrap break-words select-text">
          {comment.body}
        </p>

        <button
          onClick={() => onReply(comment.id)}
          className="mt-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          <Reply className="h-2.5 w-2.5" /> Reply
        </button>

        {replyingToId === comment.id && (
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-primary flex items-center gap-1">
                <CornerDownRight className="h-2.5 w-2.5" /> Replying to @{handle}
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
              <Avatar className="h-6 w-6 border shrink-0">
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  <Lock className="h-2.5 w-2.5" />
                </AvatarFallback>
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

            <div className="flex items-center justify-between pl-8">
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
                onClick={() => submitReply(comment.id)}
                disabled={isSubmitting || !replyBody.trim()}
                className="rounded-lg bg-primary text-white h-7 px-3 text-[10px] font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Replying..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PostComments({ postId, currentUser }: { postId: string; currentUser: UserProfile }) {
  const { data: comments, error, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyIsAnon, setReplyIsAnon] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

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

  async function handleReplySubmit(parentId: string) {
    if (!replyBody.trim()) return;

    setIsReplying(true);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, isAnonymous: replyIsAnon, parentId }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to post reply");
      }

      setReplyBody("");
      setReplyingToId(null);
      mutate();
    } finally {
      setIsReplying(false);
    }
  }

  const rootComments = comments ? comments.filter(c => !c.parentId) : [];

  return (
    <div className="space-y-5">
      {/* Root Comment Form */}
      <form onSubmit={handleRootSubmit} className="flex gap-3 items-start">
        <Avatar className="h-8 w-8 border shrink-0">
          {isAnonymous ? (
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
              <Lock className="h-3 w-3" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage src={currentUser.avatarUrl || ""} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {currentUser.displayName[0].toUpperCase()}
              </AvatarFallback>
            </>
          )}
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">
          <textarea
            placeholder="Share your thoughts..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={1}
            className="w-full bg-transparent border-b border-border/60 focus:border-primary/40 rounded-none px-1 py-2 text-xs placeholder:text-muted-foreground focus:outline-none resize-none font-medium leading-relaxed transition-colors"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer select-none",
                isAnonymous
                  ? "bg-primary/10 border-primary/25 text-primary"
                  : "bg-transparent border-border/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {isAnonymous ? (
                <>
                  <Lock className="h-3 w-3 text-primary animate-[pulse_2s_infinite]" />
                  <span>Anonymous</span>
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
              className="rounded-lg bg-primary text-white h-7 px-4 text-[10px] font-bold shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Posting..." : "Comment"}
            </button>
          </div>
          {submitError && (
            <p className="text-[10px] text-destructive font-bold">{submitError}</p>
          )}
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> Discussions ({comments?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32 rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs font-bold text-destructive">Failed to load comments.</p>
        ) : rootComments.length > 0 ? (
          <div className="space-y-5">
            {rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                onReply={(id) => {
                  setReplyingToId(replyingToId === id ? null : id);
                  setReplyBody("");
                  setReplyIsAnon(false);
                }}
                replyingToId={replyingToId}
                replyBody={replyBody}
                setReplyBody={setReplyBody}
                setReplyingToId={setReplyingToId}
                replyIsAnon={replyIsAnon}
                setReplyIsAnon={setReplyIsAnon}
                isSubmitting={isReplying}
                submitReply={handleReplySubmit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl border-border bg-muted/10 text-muted-foreground text-xs font-semibold">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
