"use client";

import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { Share2, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface CommunityEmbedProps {
  slugOrId: string;
}

interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  membersCount?: number;
  members?: any[];
}

export function CommunityEmbed({ slugOrId }: CommunityEmbedProps) {
  const { data: communitiesList, isLoading } = useSWR<Community[]>(
    "/api/communities",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const community = useMemo(() => {
    if (!communitiesList || !Array.isArray(communitiesList)) return null;
    const clean = slugOrId.toLowerCase().replace(/^c\//, "");
    return (
      communitiesList.find(
        (c) => c.id === slugOrId || c.name.toLowerCase().replace(/\s+/g, "-") === clean || c.name.toLowerCase() === clean
      ) || communitiesList.find((c) => c.id.includes(clean))
    );
  }, [communitiesList, slugOrId]);

  if (isLoading) {
    return (
      <div className="mt-3 p-3.5 rounded-2xl border border-border/40 bg-card/40 animate-pulse flex items-center gap-3">
        <div className="size-10 rounded-2xl bg-muted/60" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted/60 rounded-md w-28" />
          <div className="h-3 bg-muted/40 rounded-md w-40" />
        </div>
      </div>
    );
  }

  if (!community) return null;

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    haptics.light();
    const url = `${window.location.origin}/c/${community.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${community.name} on CampusLoop`,
        text: `Join the ${community.name} community on CampusLoop!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Community link copied to clipboard 📋");
    }
  }

  const memberCount = community.membersCount ?? community.members?.length ?? 12;

  return (
    <Link
      href={`/app/communities/${community.id}`}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 block rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-all p-3.5 shadow-xs group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-lg font-black shrink-0 shadow-2xs">
            {community.icon || "👥"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs text-foreground truncate group-hover:underline">
                c/{community.name}
              </h4>
            </div>

            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
              <Users className="size-3 shrink-0 text-muted-foreground" />
              <span>{memberCount} members</span>
              {community.description && (
                <span className="truncate">· {community.description}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleShare}
            className="size-8 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Share Community"
          >
            <Share2 className="size-3.5" />
          </Button>

          <JoinCommunityButton communityId={community.id} />
        </div>
      </div>
    </Link>
  );
}
