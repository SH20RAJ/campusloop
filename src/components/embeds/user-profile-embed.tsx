"use client";

import { Check, School, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils";

interface UserProfileEmbedProps {
  username: string;
}

interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  institution?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  branch?: string | null;
  year?: number | null;
  points?: number;
  isFollowing?: boolean;
}

export function UserProfileEmbed({ username }: UserProfileEmbedProps) {
  const { data: profile, isLoading } = useSWR<PublicProfile>(
    username ? `/api/profile/${username}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-3 p-3 rounded-2xl border border-border/40 bg-card/40 animate-pulse flex items-center gap-3">
        <div className="size-10 rounded-full bg-muted/60" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted/60 rounded-md w-32" />
          <div className="h-3 bg-muted/40 rounded-md w-24" />
        </div>
      </div>
    );
  }

  if (!profile || (profile as any).error) return null;

  async function handleToggleFollow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isMutating) return;

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setIsMutating(true);

    try {
      if (nextState) {
        await fetch(`/api/profile/${username}/follow`, { method: "POST" });
        toast.success(`Following @${username}`);
      } else {
        await fetch(`/api/profile/${username}/follow`, { method: "DELETE" });
        toast.info(`Unfollowed @${username}`);
      }
      mutate("/api/profile/suggested");
      mutate("/api/profile/following");
    } catch {
      setIsFollowing(!nextState);
      toast.error("Failed to update follow status");
    } finally {
      setIsMutating(false);
    }
  }

  const avatar = getAvatarUrl(profile.avatarUrl, profile.username);

  return (
    <Link
      href={`/@${profile.username}`}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 block rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-all p-3.5 shadow-xs group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-11 shrink-0 border border-border/50">
            <AvatarImage src={avatar} alt={profile.displayName} />
            <AvatarFallback className="font-bold text-xs">{profile.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs text-foreground truncate group-hover:underline">
                {profile.displayName}
              </h4>
              <span className="text-[11px] font-bold text-muted-foreground truncate">
                @{profile.username}
              </span>
            </div>

            {profile.institution?.name ? (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate mt-0.5 font-medium">
                <School className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{profile.institution.name.split(",")[0]}</span>
                {profile.branch && <span>· {profile.branch}</span>}
              </p>
            ) : profile.bio ? (
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{profile.bio}</p>
            ) : null}
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleToggleFollow}
          disabled={isMutating}
          className={`h-8 px-3.5 text-xs font-black rounded-full shrink-0 transition-all cursor-pointer ${
            isFollowing
              ? "bg-muted hover:bg-destructive/10 hover:text-destructive text-foreground border border-border/60"
              : "bg-foreground text-background hover:opacity-90 shadow-2xs"
          }`}
        >
          {isFollowing ? (
            <>
              <Check className="size-3 mr-1" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="size-3 mr-1" />
              <span>Follow</span>
            </>
          )}
        </Button>
      </div>
    </Link>
  );
}
