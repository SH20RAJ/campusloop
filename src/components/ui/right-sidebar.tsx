"use client";

import { Flame, ArrowUpRight, UserPlus, Sparkles, Trophy, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { getCloutTier } from "@/lib/gamification";
import { useProfile } from "@/hooks/use-profile";
import { useColleges } from "@/hooks/use-colleges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile, Institution } from "@/db/schema";
import { fetcher } from "@/lib/api";

type SuggestedPeer = UserProfile & { institution?: Institution | null };

export function RightSidebar() {
  const { profile } = useProfile();
  const { colleges } = useColleges(4);

  const { data: suggestedPeers } = useSWR<SuggestedPeer[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const points = profile?.loopPoints || profile?.points || 0;
  const referrals = profile?.referralCount || 0;
  const tier = getCloutTier(points);

  return (
    <aside className="sticky top-20 space-y-5 text-foreground w-full select-none">
      {/* 1. Profile Status & Clout Tier */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Trophy className="size-3.5 text-amber-500" /> My Clout
          </span>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            {points} LP · {tier.tierName}
          </span>
        </div>

        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((points / 150) * 100))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground pt-0.5">
            <span>Invites: <strong className="text-foreground">{referrals}</strong></span>
            <span>{points >= 150 ? "Verified Star 🔵" : `${150 - points} LP to Verified`}</span>
          </div>
        </div>
      </div>

      {/* 2. Suggested Campus Peers / Classmates */}
      {suggestedPeers && suggestedPeers.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-rose-500" /> Suggested Peers
            </span>
            <Link href="/app/discover" className="text-[10px] font-bold text-primary hover:underline">
              Discover
            </Link>
          </div>

          <div className="space-y-2">
            {suggestedPeers.slice(0, 4).map((peer) => (
              <div key={peer.id} className="flex items-center justify-between gap-2 py-1">
                <Link href={`/@${peer.username}`} className="flex items-center gap-2.5 min-w-0 group flex-1">
                  <Avatar className="size-8 border border-border shrink-0">
                    <AvatarImage src={peer.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold">{peer.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                      {peer.displayName}
                      {peer.points >= 150 && <ShieldCheck className="size-3 text-blue-500 shrink-0" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {peer.institution?.name ? peer.institution.name.split(",")[0] : `@${peer.username}`}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/app/chat?userId=${peer.id}`}
                  className="size-7 rounded-lg bg-muted/60 hover:bg-primary hover:text-primary-foreground text-muted-foreground flex items-center justify-center transition-colors shrink-0 shadow-2xs"
                  title="Direct Message"
                >
                  <MessageCircle className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Trending Campuses */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Flame className="size-3.5 text-orange-500" /> Trending Campuses
          </span>
          <Link href="/app/colleges" className="text-[10px] font-bold text-primary hover:underline">
            All 1.3K+
          </Link>
        </div>

        <div className="space-y-1">
          {colleges?.slice(0, 4).map((college) => (
            <Link
              key={college.id}
              href={`/app/college/${college.slug || college.id}`}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {college.name.split(",")[0]}
              </span>
              <ArrowUpRight className="size-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Class Invite Link Button */}
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-3.5 space-y-2 text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Invite classmates to unlock Verified Campus Star status (+20 LP/invite).
        </p>
        <button
          type="button"
          onClick={() => {
            const college = profile?.institution?.name?.split(",")[0] || "campus";
            const username = profile?.username || "student";
            const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🔥`;
            navigator.clipboard.writeText(inviteText);
            toast.success("Invite link copied! Share with your college WhatsApp group 🚀");
          }}
          className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
        >
          <UserPlus className="size-3.5" /> Copy WhatsApp Invite
        </button>
      </div>
    </aside>
  );
}
