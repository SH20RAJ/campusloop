"use client";

import { Sparkles } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MyProfile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  institution?: { name: string } | null;
}

const fetcher = <T,>(url: string): Promise<T> =>
  fetch(url).then((r) => r.json() as Promise<T>);

export function RightSidebar() {
  const { data: profile } = useSWR<MyProfile>("/api/profile/me", fetcher);

  return (
    <div className="sticky top-20 space-y-4">
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
