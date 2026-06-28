"use client";

import { Post, UserProfile, Institution } from "@/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface FeedCardProps {
  post: Post & {
    author: UserProfile;
    institution: Institution;
  };
}

export function FeedCard({ post }: FeedCardProps) {
  // If the post is anonymous, we hide the author profile
  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarFallback = post.isAnonymous ? "A" : post.author.displayName[0];
  const avatarUrl = post.isAnonymous ? "" : post.author.avatarUrl;

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold flex items-center gap-1">
              {authorName}
              {!post.isAnonymous && <span className="text-blue-500 text-xs">●</span>}
            </span>
            <span className="text-xs text-muted-foreground">@{authorHandle} • {post.institution.name}</span>
          </div>
        </div>
        
        <button className="rounded-md p-2 hover:bg-muted text-muted-foreground transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        <Link href={`/app/post/${post.id}`}>
          <p className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap hover:underline">
            {post.body}
          </p>
        </Link>
        {post.title && (
          <p className="mt-3 text-xs font-semibold text-primary">#{post.title.replace(/\s+/g, '')}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 px-6 py-4 border-t border-border mt-4 text-muted-foreground">
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm">
          <Heart className="h-4 w-4" />
          <span>1.2k</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm">
          <MessageCircle className="h-4 w-4" />
          <span>124</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
