"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import type { Institution,UserProfile } from "@/db/schema";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
Check,
MoreHorizontal,
Search,
ShieldCheck,
UserPlus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type SuggestedPeer = UserProfile & { institution?: Institution | null };

const CAMPUS_TRENDS = [
  {
    category: "Trending in Campus",
    topic: "#EndSemExams",
    posts: "1.8K posts",
    href: "/app/hashtag/EndSemExams",
  },
  {
    category: "Campus Buzz • Placements",
    topic: "#PlacementSeason",
    posts: "940 posts",
    href: "/app/hashtag/PlacementSeason",
  },
  {
    category: "Campus Life • Secret Crush",
    topic: "#SecretCrushVault",
    posts: "620 posts",
    href: "/app/crush",
  },
  {
    category: "Trending • Confessions",
    topic: "#HostelDiaries",
    posts: "410 posts",
    href: "/app/hashtag/HostelDiaries",
  },
];

export function RightSidebar() {
  const router = useRouter();
  const { profile } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});

  const { data: suggestedPeers } = useSWR<SuggestedPeer[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const points = profile?.loopPoints || profile?.points || 0;
  const isVerified = points >= 150;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  function handleCopyInvite() {
    const college = profile?.institution?.name?.split(",")[0] || "campus";
    const username = profile?.username || "student";
    const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🚀`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
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

  return (
    <aside className="sticky top-4 space-y-4 text-foreground w-full select-none">
      {/* ─── 1. Twitter/X Style Search Bar ─── */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
        <input
          type="text"
          placeholder="Search CampusLoop"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-11 pr-4 rounded-full bg-muted/50 border border-transparent focus:border-border/60 focus:bg-background text-xs font-medium placeholder:text-muted-foreground/60 outline-none transition-all"
        />
      </form>

      {/* ─── 2. Twitter "Subscribe to Premium" / Get Verified Card ─── */}
      {!isVerified && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2 shadow-xs">
          <h3 className="text-sm font-black tracking-tight text-foreground">
            Get Verified on Campus
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn 150 Loop Points or invite classmates to unlock the verified blue tick and secret match vault.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <Link
              href="/app/settings"
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-4 py-2 text-xs font-black hover:opacity-90 transition-opacity cursor-pointer shadow-xs active:scale-95"
            >
              Get Verified
            </Link>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted px-3.5 py-2 text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <UserPlus className="size-3" />}
              <span>{copied ? "Copied" : "Invite"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. Twitter "What's happening" Trends Card ─── */}
      <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/25">
        <div className="px-4 py-3">
          <h3 className="text-sm font-black tracking-tight text-foreground">
            What&apos;s happening
          </h3>
        </div>

        {CAMPUS_TRENDS.map((trend) => (
          <Link
            key={trend.topic}
            href={trend.href}
            className="flex items-start justify-between px-4 py-2.5 hover:bg-muted/35 transition-colors group cursor-pointer"
          >
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {trend.category}
              </p>
              <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors truncate">
                {trend.topic}
              </p>
              <p className="text-[10px] text-muted-foreground/80">
                {trend.posts}
              </p>
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5" />
          </Link>
        ))}

        <Link
          href="/app/discover"
          className="block px-4 py-3 text-xs font-semibold text-primary hover:bg-muted/30 transition-colors"
        >
          Show more
        </Link>
      </div>

      {/* ─── 4. Twitter "Who to follow" Card ─── */}
      {suggestedPeers && suggestedPeers.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xs divide-y divide-border/25">
          <div className="px-4 py-3">
            <h3 className="text-sm font-black tracking-tight text-foreground">
              Who to follow
            </h3>
          </div>

          {suggestedPeers.slice(0, 3).map((peer) => {
            const isFollowed = Boolean(followedIds[peer.id]);
            return (
              <div
                key={peer.id}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/35 transition-colors"
              >
                <Link
                  href={`/@${peer.username}`}
                  className="flex items-center gap-2.5 min-w-0 flex-1 group"
                >
                  <Avatar className="size-9 shrink-0 border border-border/40">
                    <AvatarImage src={peer.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                      {peer.displayName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-foreground truncate group-hover:underline flex items-center gap-1">
                      <span>{peer.displayName}</span>
                      {peer.points >= 150 && (
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{peer.username}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => handleFollowToggle(peer.id, peer.displayName)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shrink-0 active:scale-95 shadow-2xs",
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

      {/* ─── 5. Twitter Style Clean Footer ─── */}
      <footer className="px-3 pt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground/60 leading-relaxed">
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <span>·</span>
        <Link href="/safety" className="hover:underline">Safety Guidelines</Link>
        <span>·</span>
        <Link href="/contact" className="hover:underline">Contact Support</Link>
        <span>·</span>
        <span>© {new Date().getFullYear()} CampusLoop</span>
      </footer>
    </aside>
  );
}
