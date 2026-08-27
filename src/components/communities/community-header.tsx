"use client";

import { recordCommunityInviteShare } from "@/app/app/(main)/communities/actions";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  EyeOff,
  Globe,
  Lock,
  MessageSquare,
  Settings,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CommunityHeaderProps {
  community: {
    id: string;
    slug?: string | null;
    name: string;
    description?: string | null;
    category?: string;
    privacy?: string;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    points?: number;
    allowAnonymousPosts?: boolean;
    creatorId: string;
    inviteCode?: string | null;
    creator?: {
      id: string;
      username: string;
      displayName: string;
    } | null;
  };
  membersCount: number;
  postsCount: number;
  isMember: boolean;
  isAdmin: boolean;
  memberStatus?: string;
}

export function CommunityHeader({
  community,
  membersCount,
  postsCount,
  isMember,
  isAdmin,
}: CommunityHeaderProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const identifier = community.slug || community.id;
  const baseUrl = `/app/communities/${identifier}`;

  function getInitialsGradient(name: string) {
    const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-indigo-500 to-violet-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-violet-500 to-fuchsia-500",
      "from-fuchsia-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-cyan-500 to-blue-500",
    ];
    return gradients[charCodeSum % gradients.length];
  }

  async function handleShareInvite() {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/app/communities/${identifier}`
        : `https://campusloop.space/app/communities/${identifier}`;

    const shareText = `🚀 Join c/${community.name} on CampusLoop!\n${
      community.description || "Verified student sub-hub"
    }\n\n👉 ${shareUrl}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Community invite link copied! +10 LP awarded 🚀");
      setTimeout(() => setCopied(false), 2500);
      recordCommunityInviteShare(community.id).catch(() => {});
    }
  }

  return (
    <header className="select-none">
      {/* ─── Sticky Twitter/X Top Navigation Bar ─── */}
      <div className="sticky top-0 z-40 bg-background/80 px-4 py-2.5 backdrop-blur-xl border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/app/communities"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back to communities"
          >
            <ArrowLeft className="size-4.5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-foreground truncate max-w-[200px] sm:max-w-xs">
                c/{community.name}
              </h1>
              {community.privacy === "PRIVATE" ? (
                <Lock className="size-3 text-amber-500 shrink-0" />
              ) : community.privacy === "UNLISTED" ? (
                <EyeOff className="size-3 text-purple-500 shrink-0" />
              ) : (
                <Globe className="size-3 text-muted-foreground shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground font-normal truncate">
              {membersCount} {membersCount === 1 ? "member" : "members"} · {postsCount}{" "}
              {postsCount === 1 ? "discussion" : "discussions"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link
              href={`${baseUrl}/settings`}
              className={cn(
                "flex size-8 items-center justify-center rounded-full border transition-colors cursor-pointer",
                pathname === `${baseUrl}/settings`
                  ? "bg-foreground text-background border-foreground font-black"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              title="Community Settings"
            >
              <Settings className="size-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleShareInvite}
            className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shadow-2xs"
            title="Share Community"
          >
            {copied ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* ─── Hero Banner Area ─── */}
      <div className="relative h-36 sm:h-48 w-full bg-neutral-900 overflow-hidden">
        {community.bannerUrl ? (
          <img
            src={community.bannerUrl}
            alt={`${community.name} Banner`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 relative">
            <div
              className={`w-full h-full bg-gradient-to-r ${getInitialsGradient(
                community.name
              )} opacity-25`}
            />
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {community.privacy === "PRIVATE" ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-background/90 text-amber-600 dark:text-amber-400 backdrop-blur-md shadow-xs flex items-center gap-1">
              <Lock className="size-3" /> Private
            </span>
          ) : community.privacy === "UNLISTED" ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-background/90 text-purple-600 dark:text-purple-400 backdrop-blur-md shadow-xs flex items-center gap-1">
              <EyeOff className="size-3" /> Secret
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-md shadow-xs flex items-center gap-1">
              <Globe className="size-3" /> Public Hub
            </span>
          )}
        </div>
      </div>

      {/* ─── Community Avatar & Action Row (Row 1) ─── */}
      <div className="px-4 sm:px-5">
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-3">
          {community.avatarUrl ? (
            <Avatar className="size-22 sm:size-26 rounded-2xl sm:rounded-3xl border-4 border-background bg-card shadow-md shrink-0">
              <AvatarImage src={community.avatarUrl} alt={community.name} className="object-cover" />
              <AvatarFallback className="bg-neutral-800 text-foreground text-2xl font-black">
                {community.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={`size-22 sm:size-26 rounded-2xl sm:rounded-3xl border-4 border-background bg-gradient-to-br ${getInitialsGradient(
                community.name
              )} shadow-xl flex items-center justify-center text-white text-2xl font-black shrink-0 overflow-hidden ring-1 ring-border/20`}
            >
              {community.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="flex items-center gap-2 pb-1">
            <JoinCommunityButton communityId={community.id} initialIsMember={isMember} />
          </div>
        </div>

        {/* ─── Community Info & Bio (Row 2 - Strictly Below Avatar) ─── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {community.name}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="size-3" /> Verified Hub
            </span>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium flex-wrap">
            <span className="text-primary font-bold">{community.category || "General"}</span>
            <span>•</span>
            <span>
              Founded by{" "}
              <Link
                href={`/@${community.creator?.username || "admin"}`}
                className="text-foreground hover:underline font-bold"
              >
                @{community.creator?.username || "admin"}
              </Link>
            </span>
          </p>

          {community.description && (
            <p className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed pt-1">
              {community.description}
            </p>
          )}

          {/* Twitter-Style Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-muted-foreground">
            <Link href={`${baseUrl}/members`} className="hover:underline flex items-center gap-1">
              <Users className="size-3.5" />
              <span className="font-bold text-foreground">{membersCount}</span> Members
            </Link>

            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              <span className="font-bold text-foreground">{postsCount}</span> Discussions
            </span>

            <span className="flex items-center gap-1">
              <strong className="text-foreground font-black">{community.points || 0}</strong> LP Clout
            </span>
          </div>
        </div>
      </div>

      {/* ─── Twitter/X Sticky Segmented Tabs ─── */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-[53px] z-30 flex items-center justify-around mt-4">
        <Link
          href={baseUrl}
          className={cn(
            "relative flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5",
            pathname === baseUrl
              ? "text-foreground font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <MessageSquare className="size-3.5" />
          <span>Discussions</span>
          <span className="text-[11px] font-semibold text-muted-foreground">({postsCount})</span>
          {pathname === baseUrl && (
            <span className="absolute bottom-0 inset-x-4 sm:inset-x-8 h-[3px] bg-primary rounded-full" />
          )}
        </Link>

        <Link
          href={`${baseUrl}/members`}
          className={cn(
            "relative flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5",
            pathname === `${baseUrl}/members`
              ? "text-foreground font-black"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          <Users className="size-3.5" />
          <span>Members</span>
          <span className="text-[11px] font-semibold text-muted-foreground">({membersCount})</span>
          {pathname === `${baseUrl}/members` && (
            <span className="absolute bottom-0 inset-x-4 sm:inset-x-8 h-[3px] bg-primary rounded-full" />
          )}
        </Link>

        {isAdmin && (
          <Link
            href={`${baseUrl}/settings`}
            className={cn(
              "relative flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5",
              pathname === `${baseUrl}/settings`
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
          >
            <Settings className="size-3.5" />
            <span>Settings</span>
            {pathname === `${baseUrl}/settings` && (
              <span className="absolute bottom-0 inset-x-4 sm:inset-x-8 h-[3px] bg-primary rounded-full" />
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
