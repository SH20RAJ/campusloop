"use client";

import { Post, UserProfile, Institution } from "@/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { FavouriteIcon, Comment01Icon, Share01Icon, MoreHorizontalIcon } from "@hugeicons/react";

interface FeedCardProps {
  post: Post & {
    author: UserProfile;
    institution: Institution;
  };
}

export function FeedCard({ post }: FeedCardProps) {
  // If there's an image, we'd use it. For now we use a generic gradient or image placeholder.
  // The design calls for large image-based cards with glassmorphism overlays.
  return (
    <div className="relative w-full overflow-hidden rounded-[32px] bg-card shadow-lg mb-6">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-background z-0" />
      
      {/* Content Container */}
      <div className="relative z-10 p-4 min-h-[400px] flex flex-col justify-between">
        
        {/* Top Header - Glassmorphism */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 rounded-full bg-black/40 px-3 py-2 backdrop-blur-md">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarImage src={post.author.avatarUrl || ""} />
              <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {post.author.displayName}
                {/* Verified icon placeholder */}
                <span className="text-blue-400 ml-1">●</span>
              </span>
              <span className="text-xs text-white/70">@{post.author.username}</span>
            </div>
          </div>
          
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60">
            <MoreHorizontalIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom Content - Overlaid text and actions */}
        <div className="mt-auto flex flex-col gap-4">
          
          {/* Post Text */}
          <div className="rounded-3xl bg-black/40 p-4 backdrop-blur-md">
            <p className="text-sm text-white md:text-base line-clamp-3">
              {post.body}
            </p>
            {post.title && (
              <p className="mt-2 text-xs font-semibold text-primary">#{post.title.replace(/\s+/g, '')}</p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 rounded-full bg-black/40 px-4 py-3 backdrop-blur-md text-white/90">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FavouriteIcon className="h-5 w-5" />
              <span className="text-sm font-medium">1.2k</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Comment01Icon className="h-5 w-5" />
              <span className="text-sm font-medium">124</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Share01Icon className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
