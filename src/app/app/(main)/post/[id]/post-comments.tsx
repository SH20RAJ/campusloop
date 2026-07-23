"use client";

import { useState } from "react";
import useSWR from "swr";
import { MessageSquare, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { CommentItem, CommentWithAuthor } from "@/components/post/comment-item";
import { toast } from "sonner";

export function PostComments({ postId, currentUser }: { postId: string; currentUser?: unknown }) {
  const { data: comments, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyIsAnon, setReplyIsAnon] = useState(false);

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentText, isAnonymous }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      setCommentText("");
      toast.success("Comment added!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePostReply(parentId: string) {
    if (!replyBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody, isAnonymous: replyIsAnon, parentId }),
      });

      if (!res.ok) throw new Error("Failed to post reply");

      setReplyBody("");
      setReplyingToId(null);
      toast.success("Reply added!");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Organize top-level comments and replies
  const topLevelComments = (comments || []).filter((c) => !c.parentId);
  const getReplies = (parentId: string) => (comments || []).filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-4 pt-2">
      {/* Top Comment Input Box */}
      <form onSubmit={handlePostComment} className="space-y-2 bg-card border border-border p-3.5 rounded-2xl">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Join the discussion... (Be respectful to fellow students)"
          rows={3}
          className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary resize-none font-medium"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isAnonymous ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-muted/30 text-muted-foreground border-border/40"
            }`}
          >
            <Lock className="size-3" />
            {isAnonymous ? "100% Anonymous" : "Post Publicly"}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-1">
              <CommentItem
                comment={comment}
                onReply={(id) => setReplyingToId(id)}
                replyingToId={replyingToId}
                replyBody={replyBody}
                setReplyBody={setReplyBody}
                setReplyingToId={setReplyingToId}
                replyIsAnon={replyIsAnon}
                setReplyIsAnon={setReplyIsAnon}
                isSubmitting={isSubmitting}
                submitReply={handlePostReply}
              />

              {/* Render 1 level of nested replies */}
              {getReplies(comment.id).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={1}
                  onReply={(id) => setReplyingToId(id)}
                  replyingToId={replyingToId}
                  replyBody={replyBody}
                  setReplyBody={setReplyBody}
                  setReplyingToId={setReplyingToId}
                  replyIsAnon={replyIsAnon}
                  setReplyIsAnon={setReplyIsAnon}
                  isSubmitting={isSubmitting}
                  submitReply={handlePostReply}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-xs text-muted-foreground/60">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
