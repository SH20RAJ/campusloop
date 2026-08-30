"use client";

import { Flame, MessageCircle, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TopCommentPreview as TopCommentType } from "@/hooks/use-feed";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

interface TopCommentCardProps {
  topComment: TopCommentType;
  commentsCount: number;
  onClick: () => void;
  className?: string;
}

export function TopCommentCard({ topComment, commentsCount, onClick, className }: TopCommentCardProps) {
  const isAnon = topComment.isAnonymous;
  const displayName = isAnon ? "Anonymous Student" : topComment.author?.displayName || "Student";
  const handle = isAnon ? topComment.pseudonym || "anonymous" : topComment.author?.username || "student";
  const avatarUrl = isAnon
    ? ""
    : getAvatarUrl(topComment.author?.avatarUrl, topComment.author?.username ?? "student");

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "mx-4 sm:mx-5 mb-1.5 mt-1 rounded-2xl bg-muted/40 hover:bg-muted/65 border border-border/30 p-2.5 sm:p-3 transition-colors cursor-pointer group select-none",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {isAnon ? (
            <div className="size-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/30">
              <Shield className="size-2.5" />
            </div>
          ) : (
            <Avatar className="size-5 rounded-full border border-border/40 shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-[8px] font-bold">{displayName[0] || "U"}</AvatarFallback>
            </Avatar>
          )}

          <span className="text-[11px] font-bold text-foreground truncate max-w-[120px]">{displayName}</span>
          <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">@{handle}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">
            • {formatTimeAgo(topComment.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
            <Flame className="size-2.5 fill-amber-500" />
            <span>Top Comment</span>
          </span>
        </div>
      </div>

      {/* Snippet */}
      <p className="text-xs text-foreground/80 font-medium line-clamp-2 pl-7 leading-relaxed group-hover:text-foreground transition-colors">
        {topComment.body}
      </p>

      {commentsCount > 1 && (
        <div className="pl-7 pt-1 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
          <MessageCircle className="size-3" />
          <span>View all {commentsCount} comments</span>
        </div>
      )}
    </div>
  );
}
