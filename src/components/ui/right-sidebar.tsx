"use client";

import useSWR from "swr";
import { Sparkles, Flame, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  name: string;
  state: string | null;
  district: string | null;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json() as Promise<T>);

export function RightSidebar() {
  const { data: profile } = useSWR<MyProfile>("/api/profile/me", fetcher);
  const { data: colleges } = useSWR<College[]>("/api/colleges?limit=5", fetcher);

  const points = profile?.points || 0;
  const referrals = profile?.referralCount || 0;

  return (
    <div className="sticky top-20 space-y-5">
      {/* User Stats Snippet */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your Stats</span>
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 border border-border/40 p-2.5 text-center">
            <p className="text-lg font-black text-foreground leading-none">{points}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Points</p>
          </div>
          <div className="rounded-xl bg-muted/40 border border-border/40 p-2.5 text-center">
            <p className="text-lg font-black text-foreground leading-none">{referrals}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Invites</p>
          </div>
        </div>
      </div>

      {/* Trending Campuses */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trending Campuses</span>
        </div>
        <div className="space-y-2">
          {colleges?.slice(0, 4).map((college, idx) => (
            <Link
              key={college.id}
              href={`/college/${college.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 hover:bg-muted/40 hover:border-primary/15 transition-all group"
            >
              <span className="text-[10px] font-black text-muted-foreground/40 w-4 text-center">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {college.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium truncate">
                  {college.state}{college.district ? ` • ${college.district}` : ""}
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
          {!colleges && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-4 w-4 rounded bg-muted/60 shimmer-effect" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-24 bg-muted/60 rounded shimmer-effect" />
                    <div className="h-2 w-16 bg-muted/40 rounded shimmer-effect" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Virality Booster: Share / Invite Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm group">
        <div className="absolute right-[-10%] top-[-30%] h-24 w-24 rounded-full bg-primary/10 blur-xl group-hover:bg-primary/25 transition-colors pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Gatekeep? Nah, invite.
          </h4>
          <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
            Invite your campus group chat. Let&apos;s get the whole college yapping before the tea gets cold.
          </p>
          <button
            onClick={() => {
              const college = profile?.institution?.name?.split(",")[0] || "campus";
              const username = profile?.username || "student";
              const inviteText = `yo, ${college} is going crazy on CampusLoop right now. verified students only, join before the tea gets cold: https://campusloop.space/join?invite=${username} 🔥`;
              navigator.clipboard.writeText(inviteText);
              toast.success("Copied to clipboard! Share it in your college WhatsApp group chat 🚀");
            }}
            className={cn(
              "w-full rounded-xl bg-primary text-white text-[10px] font-bold px-3 py-2 hover:opacity-90 active:scale-95 shadow-md shadow-primary/15 transition-all cursor-pointer flex items-center justify-center gap-1"
            )}
          >
            Copy Invite Copypasta
          </button>
        </div>
      </div>
    </div>
  );
}
