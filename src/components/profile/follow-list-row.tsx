"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { FollowButton } from "@/components/profile/follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";

export interface FollowListItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  points: number;
  institutionName: string | null;
  isFollowedByViewer: boolean;
  isFriendOfViewer: boolean;
  isMutualWithProfile: boolean;
  isViewer: boolean;
}

export function FollowListRow({
  user,
  showFollowButton,
}: {
  user: FollowListItem;
  showFollowButton: boolean;
}) {
  const subtitle = user.headline || user.bio || user.institutionName;

  return (
    <li className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors">
      <Link href={`/@${user.username}`} className="shrink-0">
        <Avatar className="size-11 rounded-full border border-border/60">
          <AvatarImage
            src={getAvatarUrl(user.avatarUrl, user.username)}
            className="rounded-full object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-black rounded-full">
            {user.displayName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/@${user.username}`} className="block group">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-foreground truncate group-hover:underline">
              {user.displayName}
            </span>
            {user.points >= 150 && (
              <span className="text-brand text-xs font-bold" title="Verified Campus Star">
                ✓
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">@{user.username}</span>
            {user.isFriendOfViewer && !user.isViewer && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Users className="size-2.5" /> Friends
              </span>
            )}
          </div>
        </Link>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2 pt-0.5">{subtitle}</p>
        )}
      </div>

      {!user.isViewer &&
        (showFollowButton ? (
          <FollowButton
            username={user.username}
            displayName={user.displayName}
            initialIsFollowing={user.isFollowedByViewer}
            size="sm"
            className="mt-0.5 shrink-0"
          />
        ) : (
          <Link
            href={`/join?mode=signup&returnUrl=/@${user.username}`}
            className="mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full bg-primary h-8 px-3.5 text-[11px] font-bold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            Follow
          </Link>
        ))}
    </li>
  );
}
