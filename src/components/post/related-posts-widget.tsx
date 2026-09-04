"use client";

import { MessageSquare, Zap, ThumbsUp } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetcher } from "@/lib/api";
import type { RelatedPostItem } from "@/lib/recommendations/related-posts";
import { cn } from "@/lib/utils";

interface RelatedPostsWidgetProps {
  postId: string;
  currentUserId?: string;
  initialItems?: RelatedPostItem[];
}

export function RelatedPostsWidget({ postId, currentUserId, initialItems }: RelatedPostsWidgetProps) {
  const { data, isLoading } = useSWR<{ related: RelatedPostItem[] }>(
    `/api/posts/${postId}/related`,
    fetcher,
    {
      fallbackData: initialItems ? { related: initialItems } : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

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
    <section className="rounded-2xl border border-border/40 bg-card/60 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Zap className="size-3.5 text-primary" />
          <span>More like this</span>
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground/70">
          From other campuses
        </span>
      </div>

      <div className="divide-y divide-border/20">
        {items.map(({ post }) => {
          const isAnon = post.isAnonymous;
          const authorName = isAnon
            ? post.pseudonym || "Anonymous Student"
            : post.author?.displayName || "Student";
          const snippet = post.body.length > 110 ? `${post.body.slice(0, 108)}...` : post.body;

          return (
            <Link
              key={post.id}
              href={`/app/post/${post.id}`}
              className="block py-2.5 first:pt-1 last:pb-1 group hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <Avatar className="size-7 rounded-full border border-border/40 shrink-0 mt-0.5">
                    <AvatarImage src={isAnon ? "" : post.author?.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                      {authorName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {authorName}
                      </p>
                      {post.institution?.name && (
                        <span className="text-[10px] text-muted-foreground/80 truncate">
                          · {post.institution.name.split(",")[0]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                      {snippet}
                    </p>

                    <div className="flex items-center gap-3.5 mt-2 text-[10px] font-semibold text-muted-foreground/80">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3" /> {post.votesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="size-3" /> {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
