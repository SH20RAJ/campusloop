"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Globe,
  EyeOff,
  Share2,
  Check,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  MessageSquare,
  FileText,
} from "lucide-react";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { recordCommunityInviteShare } from "@/app/app/(main)/communities/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  memberStatus?: string; // 'ACTIVE' | 'PENDING' | 'NONE'
}

export function CommunityHeader({
  community,
  membersCount,
  postsCount,
  isMember,
  isAdmin,
  memberStatus = "NONE",
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
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/app/communities/${identifier}`
      : `https://campusloop.space/app/communities/${identifier}`;

    const shareText = `🚀 Join c/${community.name} on CampusLoop!\n${community.description || "Student-only sub-hub"}\n\n👉 ${shareUrl}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Community invite link copied! +10 LP awarded 🚀");
      setTimeout(() => setCopied(false), 2500);

      // Trigger gamified LP reward
      recordCommunityInviteShare(community.id).catch(() => {});
    }
  }

  return (
    <header className="space-y-3 select-none">
      {/* ─── Top Navigation Bar ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/communities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft className="size-3.5" /> All Communities
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href={`${baseUrl}/settings`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full shadow-2xs"
            >
              <Settings className="size-3.5" />
              <span>Settings</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleShareInvite}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer bg-muted/40 hover:bg-muted px-3.5 py-1.5 rounded-full shadow-2xs"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5 text-primary" />}
            <span>{copied ? "Copied!" : "Invite (+10 LP)"}</span>
          </button>
        </div>
      </div>

      {/* ─── Grand Community Header Card ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-card shadow-2xs">
        {/* Banner Area */}
        <div className="relative h-36 sm:h-44 w-full bg-muted/30 overflow-hidden">
          {community.bannerUrl ? (
            <img
              src={community.bannerUrl}
              alt={`${community.name} Banner`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${getInitialsGradient(community.name)} opacity-30`} />
          )}

          {/* Privacy Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            {community.privacy === "PRIVATE" ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-background/90 text-amber-600 dark:text-amber-400 backdrop-blur-md shadow-xs flex items-center gap-1">
                <Lock className="size-3" /> Private Hub
              </span>
            ) : community.privacy === "UNLISTED" ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-background/90 text-purple-600 dark:text-purple-400 backdrop-blur-md shadow-xs flex items-center gap-1">
                <EyeOff className="size-3" /> Secret Hub
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-background/90 text-foreground backdrop-blur-md shadow-xs flex items-center gap-1">
                <Globe className="size-3" /> Public Hub
              </span>
            )}
          </div>
        </div>

        {/* Hero Content Body */}
        <div className="px-5 pb-5 pt-0 space-y-3.5">
          {/* Identity & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 -mt-12 sm:-mt-14">
            <div className="flex items-end gap-3.5 min-w-0">
              {/* Emblem */}
              <div
                className={`size-20 sm:size-24 rounded-2xl border-4 border-card bg-gradient-to-br ${getInitialsGradient(
                  community.name
                )} shadow-xl flex items-center justify-center text-white text-xl font-black shrink-0 z-10`}
              >
                {community.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-0.5 min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight truncate">
                    c/{community.name}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
                  <span className="text-primary font-bold">{community.category || "General"}</span>
                  <span>•</span>
                  <span>
                    Founded by{" "}
                    <Link
                      href={`/@${community.creator?.username || "admin"}`}
                      className="text-foreground hover:underline"
                    >
                      @{community.creator?.username || "admin"}
                    </Link>
                  </span>
                </p>
              </div>
            </div>

            {/* CTAs Row */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pb-1">
              <JoinCommunityButton communityId={community.id} initialIsMember={isMember} />
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {community.description}
            </p>
          )}

          {/* Horizontal Stats Row */}
          <div className="flex items-center gap-4 py-2 px-4 rounded-2xl bg-muted/30 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">
              <strong className="text-foreground font-black">{membersCount}</strong> Members
            </span>
            <span>•</span>
            <span className="text-foreground">
              <strong className="text-foreground font-black">{postsCount}</strong> Discussions
            </span>
            <span>•</span>
            <span className="text-foreground">
              <strong className="text-foreground font-black">{community.points || 0}</strong> LP Clout
            </span>
            <span>•</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Verified Hub
            </span>
          </div>
        </div>
      </div>

      {/* ─── Sticky Subpage Navigation Tabs ─── */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-background/85 backdrop-blur-xl border-b border-border/20">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Link
            href={baseUrl}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              pathname === baseUrl
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <MessageSquare className="size-3.5" />
            <span>Discussions</span>
            <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", pathname === baseUrl ? "bg-background/20 text-background" : "bg-muted text-muted-foreground")}>
              {postsCount}
            </span>
          </Link>

          <Link
            href={`${baseUrl}/members`}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              pathname === `${baseUrl}/members`
                ? "bg-foreground text-background font-black"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Users className="size-3.5" />
            <span>Members ({membersCount})</span>
          </Link>

          {isAdmin && (
            <Link
              href={`${baseUrl}/settings`}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
                pathname === `${baseUrl}/settings`
                  ? "bg-foreground text-background font-black"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Settings className="size-3.5" />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
