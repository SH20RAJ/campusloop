"use client";

import useSWR from "swr";
import { Flame, ArrowUpRight, Award, UserPlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface MyProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
  points?: number | null;
  referralCount?: number | null;
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

  return (
    <aside className="sticky top-20 space-y-3.5 text-foreground w-full select-none">
      {/* 1. Ultra-Clean Reputation & Clout Card */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-3.5 backdrop-blur-md shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Award className="size-3.5 text-primary" />
            <span>Reputation & Clout</span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Level 1
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/20 p-2 text-center border border-border/30">
            <p className="text-sm font-black text-foreground">{points}</p>
            <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider">Loop Points</p>
          </div>
          <div className="rounded-xl bg-muted/20 p-2 text-center border border-border/30">
            <p className="text-sm font-black text-foreground">{referrals}</p>
            <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider">Invites</p>
          </div>
        </div>
      </div>

      {/* 2. Minimal Trending Campuses */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-3.5 backdrop-blur-md shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Flame className="size-3.5 text-orange-500" />
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
              className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-muted/40 transition-all duration-150 group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-bold text-muted-foreground/50 w-3 text-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {college.name}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 truncate">
                    {college.state}{college.district ? ` · ${college.district}` : ""}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="size-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Sleek Invite Pill */}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-3.5 backdrop-blur-md shadow-xs space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          <span>Classroom Invite</span>
        </div>
        <p className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-medium">
          Earn +20 LP for every classmate that joins your college feed.
        </p>
        <button
          onClick={() => {
            const college = profile?.institution?.name?.split(",")[0] || "campus";
            const username = profile?.username || "student";
            const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🔥`;
            navigator.clipboard.writeText(inviteText);
            toast.success("Invite copypasta copied! Share with your college WhatsApp group 🚀");
          }}
          className="w-full h-8 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
        >
          <UserPlus className="size-3.5" /> Copy Invite Link
        </button>
      </div>
    </aside>
  );
}
