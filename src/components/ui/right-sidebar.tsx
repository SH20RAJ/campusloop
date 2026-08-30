"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import type { Institution,UserProfile } from "@/db/schema";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MoreHorizontal, RotateCw, Search, ShieldCheck } from "lucide-react";
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

  const [isRefreshingPeers, setIsRefreshingPeers] = useState(false);

  // Dynamic live trends from real database
  const { data: trendsData } = useSWR<TrendsResponse>(
    "/api/trends?scope=CAMPUS",
    fetcher,
    { revalidateIfStale: true, dedupingInterval: 15000 }
  );

  // Suggested peers from real database (excludes already followed users)
  const { data: suggestedPeers, mutate: mutateSuggested } = useSWR<SuggestedPeer[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateIfStale: true, dedupingInterval: 10000 }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  async function handleRefreshPeers() {
    setIsRefreshingPeers(true);
    try {
      await mutateSuggested();
    } finally {
      setIsRefreshingPeers(false);
    }
  }

  async function handleFollowToggle(peer: SuggestedPeer) {
    const isCurrentlyFollowed = Boolean(followedIds[peer.id]);
    const nextState = !isCurrentlyFollowed;

    setFollowedIds((prev) => ({ ...prev, [peer.id]: nextState }));

    try {
      if (nextState) {
        toast.success(`Following @${peer.username}`);
        await fetch(`/api/profile/${peer.username}/follow`, { method: "POST" });
        // Optimistically remove followed peer from suggested list and refresh in background
        mutateSuggested((current) => current?.filter((p) => p.id !== peer.id), false);
      } else {
        toast.info(`Unfollowed @${peer.username}`);
        await fetch(`/api/profile/${peer.username}/follow`, { method: "DELETE" });
      }
      setTimeout(() => mutateSuggested(), 500);
    } catch {
      setFollowedIds((prev) => ({ ...prev, [peer.id]: isCurrentlyFollowed }));
      toast.error("Failed to update follow status");
    }
  }

  const trends = (trendsData?.trends || []).slice(0, 4);
  const peers = (suggestedPeers || []).slice(0, 4);

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
        <section className="space-y-1">
          <div className="px-1 pb-1">
            <h3 className="text-[17px] font-black tracking-tight text-foreground">
              What&apos;s happening
            </h3>
          </div>

          <div className="divide-y divide-border/20">
            {trends.map((trend) => (
              <Link
                key={trend.topic}
                href={trend.href}
                className="flex items-start justify-between px-2 py-2.5 hover:bg-muted/25 rounded-xl transition-colors group cursor-pointer"
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
          </div>

          <Link
            href="/app/discover"
            className="block px-2 pt-1 text-xs font-bold text-primary hover:underline transition-colors cursor-pointer"
          >
            Show more
          </Link>
        </section>
      )}

      {trends.length > 0 && peers.length > 0 && (
        <hr className="border-border/30 my-3" />
      )}

      {/* ─── COMPONENT 2: Who to follow (Classmates & Peers) ─── */}
      {peers.length > 0 && (
        <section className="space-y-1">
          <div className="px-1 pb-1 flex items-center justify-between">
            <h3 className="text-[17px] font-black tracking-tight text-foreground">
              Who to follow
            </h3>
            <button
              type="button"
              onClick={handleRefreshPeers}
              disabled={isRefreshingPeers}
              title="Shuffle suggestions"
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer active:scale-95"
            >
              <RotateCw className={cn("size-3.5 transition-transform", isRefreshingPeers && "animate-spin text-primary")} />
            </button>
          </div>

          <div className="divide-y divide-border/20">
            {peers.map((peer) => {
              const isFollowed = Boolean(followedIds[peer.id]);
              return (
                <div
                  key={peer.id}
                  className="flex items-center justify-between gap-3 px-2 py-2.5 hover:bg-muted/25 rounded-xl transition-colors"
                >
                  <Link
                    href={`/@${peer.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group cursor-pointer"
                  >
                    <Avatar className="size-10 shrink-0 border border-border/30">
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
                    onClick={() => handleFollowToggle(peer)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 active:scale-95",
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
          </div>

          <Link
            href="/app/discover"
            className="block px-2 pt-1 text-xs font-bold text-primary hover:underline transition-colors cursor-pointer"
          >
            Show more
          </Link>
        </section>
      )}

      <hr className="border-border/30 my-3" />


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
