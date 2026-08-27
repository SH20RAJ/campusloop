"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import type { Institution,UserProfile } from "@/db/schema";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MoreHorizontal,Search,ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type SuggestedPeer = UserProfile & { institution?: Institution | null };

interface TrendItem {
  category: string;
  topic: string;
  postCount: number;
  formattedCount: string;
  href: string;
}

interface TrendsResponse {
  trends: TrendItem[];
}

export function RightSidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  // Dynamic live trends from real database
  const { data: trendsData } = useSWR<TrendsResponse>(
    "/api/trends?scope=CAMPUS",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  // Suggested peers from real database
  const { data: suggestedPeers } = useSWR<SuggestedPeer[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  function handleFollowToggle(peerId: string, peerName: string) {
    setFollowedIds((prev) => {
      const nextState = !prev[peerId];
      if (nextState) {
        toast.success(`Connected with ${peerName}!`);
      }
      return { ...prev, [peerId]: nextState };
    });
  }

  const trends = (trendsData?.trends || []).slice(0, 4);
  const peers = (suggestedPeers || []).slice(0, 3);

  return (
    <aside className="sticky top-3 space-y-4 text-foreground w-full select-none">
      {/* ─── Search Bar ─── */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-full bg-muted/60 border border-transparent focus:border-border/80 focus:bg-background text-[13px] font-normal placeholder:text-muted-foreground/70 outline-none transition-all"
        />
      </form>

      {/* ─── COMPONENT 1: What's happening (Trending on Campus) ─── */}
      {trends.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
          <div className="px-4 pt-3.5 pb-2">
            <h3 className="text-[15px] font-black tracking-tight text-foreground">
              What&apos;s happening
            </h3>
          </div>

          {trends.map((trend) => (
            <Link
              key={trend.topic}
              href={trend.href}
              className="flex items-start justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground font-medium truncate">
                  {trend.category}
                </p>
                <p className="text-[14px] font-bold text-foreground group-hover:underline truncate">
                  {trend.topic}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {trend.formattedCount}
                </p>
              </div>
              <MoreHorizontal className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 mt-1" />
            </Link>
          ))}

          <Link
            href="/app/discover"
            className="block px-4 py-3 text-xs font-semibold text-primary hover:bg-muted/30 transition-colors"
          >
            Show more
          </Link>
        </div>
      )}

      {/* ─── COMPONENT 2: Who to follow (Classmates & Peers) ─── */}
      {peers.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/20">
          <div className="px-4 pt-3.5 pb-2">
            <h3 className="text-[15px] font-black tracking-tight text-foreground">
              Who to follow
            </h3>
          </div>

          {peers.map((peer) => {
            const isFollowed = Boolean(followedIds[peer.id]);
            return (
              <div
                key={peer.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <Link
                  href={`/@${peer.username}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <Avatar className="size-10 shrink-0 border border-border/40">
                    <AvatarImage src={peer.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                      {peer.displayName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-black text-foreground truncate group-hover:underline flex items-center gap-1">
                      <span>{peer.displayName}</span>
                      {peer.points >= 150 && (
                        <ShieldCheck className="size-3.5 text-[#1d9bf0] shrink-0" />
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      @{peer.username}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleFollowToggle(peer.id, peer.displayName)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs",
                    isFollowed
                      ? "border border-border/60 bg-transparent text-foreground hover:border-destructive/40 hover:text-destructive"
                      : "bg-foreground text-background hover:opacity-90"
                  )}
                >
                  {isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}

          <Link
            href="/app/discover"
            className="block px-4 py-3 text-xs font-semibold text-primary hover:bg-muted/30 transition-colors"
          >
            Show more
          </Link>
        </div>
      )}

      {/* ─── Twitter Minimal Footer ─── */}
      <footer className="px-3 pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/60 leading-relaxed">
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <span>·</span>
        <Link href="/safety" className="hover:underline">Safety</Link>
        <span>·</span>
        <Link href="/about" className="hover:underline">About</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} CampusLoop</span>
      </footer>
    </aside>
  );
}
