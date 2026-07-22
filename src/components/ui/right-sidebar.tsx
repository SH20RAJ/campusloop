"use client";

import useSWR from "swr";
import { Flame, ArrowUpRight, Award, UserPlus, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getCloutTier } from "@/lib/gamification";

interface MyProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
  points?: number | null;
  referralCount?: number | null;
  role?: string | null;
}

interface College {
  id: string;
  slug?: string | null;
  name: string;
  state: string | null;
  district: string | null;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json() as Promise<T>);

export function RightSidebar() {
  const { data: profile } = useSWR<MyProfile>("/api/profile/me", fetcher);
  const { data: collegeData } = useSWR<{ colleges: College[] } | College[]>("/api/colleges?limit=5", fetcher);

  const colleges = Array.isArray(collegeData)
    ? collegeData
    : (collegeData?.colleges || []);

  const points = profile?.points || 0;
  const referrals = profile?.referralCount || 0;
  const tier = getCloutTier(points);

  return (
    <aside className="sticky top-20 space-y-4 text-foreground w-full select-none">
      {/* 1. Clout Rank & Level Card */}
      <div className="rounded-3xl border border-border/40 bg-card/40 p-4 backdrop-blur-md shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Trophy className="size-4 text-amber-500" />
            <span>Clout & Verification</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tier.badgeColor}`}>
            {tier.iconSymbol} Level {tier.level}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-muted/20 p-2.5 text-center border border-border/30">
            <p className="text-base font-black text-foreground">{points}</p>
            <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider">Loop Points</p>
          </div>
          <div className="rounded-2xl bg-muted/20 p-2.5 text-center border border-border/30">
            <p className="text-base font-black text-foreground">{referrals}</p>
            <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider">Invites</p>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="rounded-xl border border-border/30 bg-muted/10 p-2.5 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-semibold">Blue Tick Badge:</span>
          {points >= 150 || profile?.role === "ADMIN" ? (
            <span className="text-blue-500 font-bold flex items-center gap-1">
              Verified Star 🔵
            </span>
          ) : (
            <span className="text-muted-foreground/70 font-semibold">
              Unlock at 150 LP
            </span>
          )}
        </div>
      </div>

      {/* 2. Minimal Trending Campuses */}
      <div className="rounded-3xl border border-border/40 bg-card/40 p-4 backdrop-blur-md shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Flame className="size-4 text-orange-500" />
            <span>Trending Campuses</span>
          </div>
          <Link href="/app/colleges" className="text-[10px] font-bold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-1">
          {colleges?.slice(0, 4).map((college, idx) => (
            <Link
              key={college.id}
              href={`/app/college/${college.slug || college.id}`}
              className="flex items-center justify-between rounded-2xl px-2.5 py-2 hover:bg-muted/40 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground/50 w-3.5 text-center shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {college.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 truncate font-medium">
                    {college.state}{college.district ? ` · ${college.district}` : ""}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Class WhatsApp Invite Pill */}
      <div className="rounded-3xl border border-border/40 bg-card/40 p-4 backdrop-blur-md shadow-xs space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Sparkles className="size-4 text-primary" />
          <span>Classroom Invite</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
          Earn +20 LP for every classmate that joins your college feed.
        </p>
        <button
          onClick={() => {
            const college = profile?.institution?.name?.split(",")[0] || "campus";
            const username = profile?.username || "student";
            const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🔥`;
            navigator.clipboard.writeText(inviteText);
            toast.success("Invite link copied! Share with your college WhatsApp group 🚀");
          }}
          className="w-full h-9 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
        >
          <UserPlus className="size-3.5" /> Copy Invite Link
        </button>
      </div>
    </aside>
  );
}
