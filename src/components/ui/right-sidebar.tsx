"use client";

import useSWR from "swr";
import { Flame, ArrowUpRight, UserPlus, Sparkles, Trophy } from "lucide-react";
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
    <aside className="sticky top-20 space-y-6 text-foreground w-full select-none">
      {/* 1. Minimal Profile Status */}
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Trophy className="size-3.5 text-amber-500" /> My Clout
          </span>
          <span className="text-[10px] font-bold text-primary">
            {points} LP · Level {tier.level}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 pt-0.5">
          <span>Invites: <strong className="text-foreground">{referrals}</strong></span>
          <span>{points >= 150 ? "Verified Star 🔵" : "Star @ 150 LP"}</span>
        </div>
      </div>

      <div className="h-px bg-border/40" />

      {/* 2. Minimal Trending Campuses */}
      <div className="space-y-2.5 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Flame className="size-3.5 text-orange-500" /> Trending Campuses
          </span>
          <Link href="/app/colleges" className="text-[10px] font-semibold text-primary hover:underline">
            All
          </Link>
        </div>

        <div className="space-y-0.5">
          {colleges?.slice(0, 4).map((college) => (
            <Link
              key={college.id}
              href={`/app/college/${college.slug || college.id}`}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer"
            >
              <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {college.name}
              </span>
              <ArrowUpRight className="size-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      <div className="h-px bg-border/40" />

      {/* 3. Class Invite Link Button */}
      <div className="space-y-2 px-1">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Invite classmates to join your campus feed (+20 LP/invite).
        </p>
        <button
          onClick={() => {
            const college = profile?.institution?.name?.split(",")[0] || "campus";
            const username = profile?.username || "student";
            const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🔥`;
            navigator.clipboard.writeText(inviteText);
            toast.success("Invite link copied! Share with your college WhatsApp group 🚀");
          }}
          className="w-full py-2 rounded-xl border border-border/60 bg-muted/30 text-foreground text-xs font-semibold hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <UserPlus className="size-3.5" /> Copy Invite Link
        </button>
      </div>
    </aside>
  );
}
