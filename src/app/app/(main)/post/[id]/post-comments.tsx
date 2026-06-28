"use client";

import { useState } from "react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Comment, UserProfile } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";

type CommentWithAuthor = Comment & {
  author: UserProfile;
};

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<any>;
});

export function PostComments({ postId }: { postId: string }) {
  const { data: comments, error, isLoading, mutate } = useSWR<CommentWithAuthor[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
      mutate(); // Trigger SWR revalidation
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <textarea
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              id="anon-comment"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="anon-comment" className="text-xs font-medium text-muted-foreground select-none">
              Comment Anonymously
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="rounded-md bg-primary h-8 px-4 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Comment"}
          </button>
        </div>

        {submitError && (
          <p className="text-xs text-destructive font-medium">{submitError}</p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Comments</h3>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load comments.</p>
        ) : comments && comments.length > 0 ? (
          <div className="divide-y divide-border border rounded-lg bg-card overflow-hidden">
            {comments.map((comment) => {
              const displayName = comment.isAnonymous ? "Anonymous Student" : comment.author.displayName;
              const handle = comment.isAnonymous ? "anonymous" : comment.author.username;
              const avatarFallback = comment.isAnonymous ? "A" : comment.author.displayName[0];
              const avatarUrl = comment.isAnonymous ? "" : comment.author.avatarUrl;

              return (
                <div key={comment.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border">
                      <AvatarImage src={avatarUrl || ""} />
                      <AvatarFallback className="text-[10px]">{avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        {displayName}
                        {!comment.isAnonymous && <span className="text-blue-500 text-[10px] ml-1">●</span>}
                      </span>
                      <span className="text-[10px] text-muted-foreground">@{handle}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground pl-8 whitespace-pre-wrap">{comment.body}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 border rounded-lg border-dashed text-muted-foreground text-sm">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  );
}
