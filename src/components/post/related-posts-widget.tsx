"use client";

import { MessageSquare, Sparkles, ThumbsUp } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RelatedPostItem } from "@/lib/recommendations/related-posts";
import { cn } from "@/lib/utils";

interface RelatedPostsWidgetProps {
  postId: string;
  currentUserId?: string;
  initialItems?: RelatedPostItem[];
}

export function RelatedPostsWidget({ postId, currentUserId, initialItems }: RelatedPostsWidgetProps) {
  const { data, isLoading } = useSWR<{ related: RelatedPostItem[] }>(`/api/posts/${postId}/related`, {
    fallbackData: initialItems ? { related: initialItems } : undefined,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const items = data?.related || initialItems || [];

  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-full bg-muted/65 shimmer-effect" />
          <div className="h-4 w-32 rounded-md bg-muted/65 shimmer-effect" />
        </div>
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 shimmer-effect" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-border/50 bg-card p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span>Similar Campus Discussions</span>
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
          AI Vector Matched
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {items.map(({ post, matchScore, matchReason }) => {
          const isAnon = post.isAnonymous;
          const authorName = isAnon
            ? post.pseudonym || "Anonymous Student"
            : post.author?.displayName || "Student";
          const snippet = post.body.length > 120 ? `${post.body.slice(0, 118)}...` : post.body;

          return (
            <Link
              key={post.id}
              href={`/app/post/${post.id}`}
              className="block py-3 first:pt-1 last:pb-1 group hover:bg-muted/20 -mx-2 px-2 rounded-2xl transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <Avatar className="size-6 rounded-full border border-border/40 shrink-0 mt-0.5">
                    <AvatarImage src={isAnon ? "" : post.author?.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                      {authorName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {authorName}
                      </p>
                      {post.institution?.name && (
                        <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                          · {post.institution.name.split(",")[0]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                      {snippet}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3" /> {post.votesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3" /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {matchScore && matchScore > 0 && (
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                      matchReason === "semantic"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border/50"
                    )}
                  >
                    {matchReason === "semantic" ? `${matchScore}% Vibe` : "Campus"}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
