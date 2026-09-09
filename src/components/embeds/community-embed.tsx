"use client";

import { ChevronRight, Link2, Share2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useMemo } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { JoinCommunityButton } from "@/app/app/(main)/communities/join-community-button";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

interface CommunityEmbedProps {
  slugOrId: string;
}

interface Community {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  icon: string | null;
  avatarUrl?: string | null;
  membersCount?: number;
  members?: any[];
  category?: string;
  tags?: string[];
}

const DEFAULT_AVATARS = [
  "https://api.dicebear.com/7.x/initials/svg?seed=Priya&backgroundColor=db2777&textColor=ffffff&fontWeight=800",
  "https://api.dicebear.com/7.x/initials/svg?seed=Kabir&backgroundColor=2563eb&textColor=ffffff&fontWeight=800",
  "https://api.dicebear.com/7.x/initials/svg?seed=Aarav&backgroundColor=7c3aed&textColor=ffffff&fontWeight=800",
];

const KNOWN_COMMUNITIES: Record<string, Partial<Community> & { tags?: string[] }> = {
  comm_placements: {
    id: "comm_placements",
    name: "Placement & Internships",
    slug: "comm_placements",
    description: "Discussions, opportunities, resources and experiences for placements.",
    membersCount: 16,
    tags: ["#Placements", "#Internships", "#Career"],
  },
  comm_coding: {
    id: "comm_coding",
    name: "Coders Club & Hackers",
    slug: "coders-club",
    description: "LeetCode daily grinds, system design & HackBIT squads 💻",
    membersCount: 18,
    tags: ["#Coding", "#Tech", "#Hackathons"],
  },
  comm_music: {
    id: "comm_music",
    name: "Campus Jams & Music Society",
    slug: "campus-jams",
    description: "Acoustic jams, Bitotsav battle of bands, and indie chords 🎸",
    membersCount: 14,
    tags: ["#Music", "#Bands", "#Jamming"],
  },
};

export function CommunityEmbed({ slugOrId }: CommunityEmbedProps) {
  const router = useRouter();
  const { data: communitiesList, isLoading } = useSWR<Community[]>("/api/communities", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const community = useMemo(() => {
    const clean = slugOrId.toLowerCase().replace(/^c\//, "");
    const found = communitiesList?.find(
      (c) =>
        c.id === slugOrId ||
        c.id === clean ||
        c.name.toLowerCase().replace(/\s+/g, "-") === clean ||
        c.name.toLowerCase() === clean ||
        c.id.includes(clean)
    );
    const fallback = KNOWN_COMMUNITIES[clean] || KNOWN_COMMUNITIES[slugOrId];

    if (!found && !fallback) return null;

    const isPlacements = clean === "comm_placements" || slugOrId === "comm_placements";

    const name = isPlacements
      ? "Placement & Internships"
      : found?.name || fallback?.name || "Campus Community";

    const description = isPlacements
      ? "Discussions, opportunities, resources and experiences for placements."
      : found?.description ||
        fallback?.description ||
        "Connect, share advice, and explore campus opportunities.";

    const membersCount = found?.membersCount ?? found?.members?.length ?? fallback?.membersCount ?? 16;

    let tags = fallback?.tags;
    if (!tags) {
      if (isPlacements || name.toLowerCase().includes("placement")) {
        tags = ["#Placements", "#Internships", "#Career"];
      } else if (name.toLowerCase().includes("code") || name.toLowerCase().includes("tech")) {
        tags = ["#Coding", "#Tech", "#Projects"];
      } else {
        const words = name.split(/\s+/).slice(0, 3);
        tags = words.map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, "")}`).filter((t) => t.length > 2);
      }
    }

    return {
      id: found?.id || fallback?.id || slugOrId,
      name,
      slug: found?.slug || fallback?.slug || clean,
      description,
      icon: found?.icon || fallback?.icon || null,
      avatarUrl: found?.avatarUrl || fallback?.avatarUrl || null,
      membersCount,
      members: found?.members || fallback?.members || [],
      tags,
    };
  }, [communitiesList, slugOrId]);

  if (isLoading && !KNOWN_COMMUNITIES[slugOrId.replace(/^c\//, "")]) {
    return (
      <div className="mt-3.5 p-4 rounded-3xl border border-purple-500/20 bg-[#12111d]/60 animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-purple-950/40" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-purple-900/40 rounded w-20" />
            <div className="h-4 bg-purple-900/50 rounded w-36" />
            <div className="h-3 bg-purple-900/30 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!community) return null;

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!community) return;
    haptics.light();
    sounds.tap();
    const url = `${window.location.origin}/c/${community.slug || community.id}`;
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

  function handleCardClick(e: React.MouseEvent) {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    sounds.tap();
    haptics.light();
    router.push(`/app/communities/${community?.id}`);
  }

  const memberCount = community.membersCount ?? 16;
  const avatars =
    community.members && community.members.length > 0
      ? community.members
          .map((m: any) => m.user?.avatarUrl || m.avatarUrl)
          .filter(Boolean)
          .slice(0, 3)
      : DEFAULT_AVATARS;

  const displayAvatars = avatars.length > 0 ? avatars : DEFAULT_AVATARS;

  return (
    <div
      onClick={handleCardClick}
      className="mt-3.5 block overflow-hidden rounded-3xl border border-purple-500/20 bg-[#12111d]/95 backdrop-blur-xl p-4 sm:p-5 shadow-xl shadow-purple-950/20 space-y-4 select-none cursor-pointer group/comm hover:border-purple-500/40 hover:bg-[#151322] transition-all no-card-nav"
      data-no-nav="true"
    >
      {/* Top Row: Community Icon, Badge, Share, Title & Description */}
      <div className="flex items-start gap-3.5">
        {/* Squircle Icon Container */}
        <div className="size-14 sm:size-16 rounded-2xl bg-gradient-to-br from-purple-700/30 to-purple-950/60 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
          {community.avatarUrl ? (
            <img
              src={community.avatarUrl}
              alt={community.name}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <Users className="size-7 sm:size-8 text-purple-200 fill-purple-300/30" />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Community
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="size-8 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Share Community"
              aria-label="Share community"
            >
              <Share2 className="size-3.5" />
            </button>
          </div>

          <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-snug truncate group-hover/comm:text-purple-200 transition-colors">
            {community.name}
          </h3>

          <p className="text-xs text-white/65 line-clamp-2 leading-relaxed">{community.description}</p>
        </div>
      </div>

      {/* Middle Row: Member Avatars + Count & Join Button */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center -space-x-2 shrink-0">
            {displayAvatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Member avatar"
                className="size-6 sm:size-6.5 rounded-full border-2 border-[#12111d] object-cover ring-1 ring-white/10"
                loading="lazy"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-white/85 truncate">{memberCount} members</span>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <JoinCommunityButton
            communityId={community.id}
            className="h-8.5 px-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-purple-900/30 border-0"
          />
        </div>
      </div>

      {/* Topic Tags Row */}
      {community.tags && community.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
          {community.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] sm:text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Row: Link Capsule Bar */}
      <div className="rounded-2xl border border-white/10 bg-black/40 hover:bg-black/60 transition-colors px-3.5 py-2.5 flex items-center justify-between group/link">
        <div className="flex items-center gap-2 min-w-0 text-xs font-medium">
          <Link2 className="size-3.5 text-white/60 shrink-0" />
          <span className="font-semibold text-white truncate">campusloop.space</span>
          <span className="text-white/45 truncate">/c/{community.slug || community.id}</span>
        </div>
        <ChevronRight className="size-4 text-white/40 group-hover/link:text-white transition-colors shrink-0" />
      </div>
    </div>
  );
}
