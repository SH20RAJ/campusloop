"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import type { Institution,UserProfile } from "@/db/schema";
import { useColleges } from "@/hooks/use-colleges";
import { useProfile } from "@/hooks/use-profile";
import { fetcher } from "@/lib/api";
import { getCloutTier } from "@/lib/gamification";
import {
ArrowUpRight,
Cake,
Check,
Flame,
MessageCircle,
ShieldCheck,
Sparkles,
Trophy,
UserPlus,
Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

type SuggestedPeer = UserProfile & { institution?: Institution | null };

export function RightSidebar() {
  const { profile } = useProfile();
  const { colleges } = useColleges(4);
  const [copied, setCopied] = useState(false);

  const { data: suggestedPeers } = useSWR<SuggestedPeer[]>(
    "/api/profile/suggested",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  const points = profile?.loopPoints || profile?.points || 0;
  const referrals = profile?.referralCount || 0;
  const tier = getCloutTier(points);
  const progressPercent = Math.min(100, Math.round((points / 150) * 100));

  function handleCopyInvite() {
    const college = profile?.institution?.name?.split(",")[0] || "campus";
    const username = profile?.username || "student";
    const inviteText = `yo, ${college} is live on CampusLoop. verified students only, join our campus feed: https://campusloop.space/join?invite=${username} 🔥`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite link copied! Share with your batchmates 🚀");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <aside className="sticky top-20 space-y-4 text-foreground w-full select-none">
      {/* ─── 1. Minimal Campus Clout Capsule ─── */}
      <div className="rounded-2xl bg-card p-4 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy className="size-3.5 text-amber-500" />
            <span className="text-xs font-black text-foreground">Campus Clout</span>
          </div>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="size-2.5 fill-primary" /> {points} LP · {tier.tierName.split(" ")[0]}
          </span>
        </div>

        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
            <span>
              Invites: <strong className="text-foreground">{referrals}</strong>
            </span>
            <span>
              {points >= 150 ? (
                <span className="text-blue-500 font-bold">Verified Star ✓</span>
              ) : (
                `${150 - points} LP to Star`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 2. Minimal Campus Birthdays Shortcut ─── */}
      <Link
        href="/app/birthdays"
        className="flex items-center justify-between p-3 rounded-2xl bg-card hover:bg-muted/40 transition-all shadow-2xs group cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
            <Cake className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
              <span>Campus Birthdays</span>
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Celebrations, wishes &amp; DOB
            </p>
          </div>
        </div>
        <ArrowUpRight className="size-3 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
      </Link>

      {/* ─── 3. Suggested Campus Peers ─── */}
      {suggestedPeers && suggestedPeers.length > 0 && (
        <div className="rounded-2xl bg-card p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Suggested Peers
            </span>
            <Link
              href="/app/discover"
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Discover
            </Link>
          </div>

          <div className="space-y-2">
            {suggestedPeers.slice(0, 4).map((peer) => (
              <div key={peer.id} className="flex items-center justify-between gap-2 py-0.5">
                <Link
                  href={`/@${peer.username}`}
                  className="flex items-center gap-2.5 min-w-0 group flex-1"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={peer.avatarUrl || ""} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {peer.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                      {peer.displayName}
                      {peer.points >= 150 && (
                        <ShieldCheck className="size-3 text-blue-500 shrink-0" />
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {peer.institution?.name
                        ? peer.institution.name.split(",")[0]
                        : `@${peer.username}`}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/app/chat?userId=${peer.id}`}
                  className="size-7 rounded-full bg-muted/50 hover:bg-primary hover:text-primary-foreground text-muted-foreground flex items-center justify-center transition-colors shrink-0"
                  title="Direct Message"
                >
                  <MessageCircle className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 3. Trending Campus Hubs ─── */}
      <div className="rounded-2xl bg-card p-4 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-foreground flex items-center gap-1.5">
            <Flame className="size-3.5 text-rose-500" /> Trending Campuses
          </span>
          <Link
            href="/app/colleges"
            className="text-[10px] font-bold text-primary hover:underline"
          >
            All 1.3K+
          </Link>
        </div>

        <div className="space-y-1">
          {colleges?.slice(0, 4).map((college) => (
            <Link
              key={college.id}
              href={`/app/college/${college.slug || college.id}`}
              className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {college.name.split(",")[0]}
                </span>
              </div>
              <ArrowUpRight className="size-3 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* ─── 4. Quick WhatsApp Class Invite ─── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-card to-indigo-500/5 p-3.5 space-y-2 text-center shadow-2xs">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Invite batchmates to unlock Verified Campus Star (+20 LP/invite).
        </p>
        <button
          type="button"
          onClick={handleCopyInvite}
          className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
        >
          {copied ? <Check className="size-3.5 text-white" /> : <UserPlus className="size-3.5" />}
          <span>{copied ? "Link Copied! 🚀" : "Copy WhatsApp Invite"}</span>
        </button>
      </div>

      {/* ─── Subtle Footer Links ─── */}
      <div className="px-2 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground/70">
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        <span>•</span>
        <Link href="/safety" className="hover:text-foreground transition-colors">Safety</Link>
        <span>•</span>
        <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
        <span>•</span>
        <span>© {new Date().getFullYear()} CampusLoop</span>
      </div>
    </aside>
  );
}
