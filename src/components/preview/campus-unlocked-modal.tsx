"use client";

import { Button } from "@/components/ui/button";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Mail,
  School,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CampusUnlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface JourneyStats {
  savedPostsCount: number;
  collegeName: string;
}

export function CampusUnlockedModal({
  isOpen,
  onClose,
  onSuccess,
}: CampusUnlockedModalProps) {
  const router = useRouter();
  const [collegeEmail, setCollegeEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journeyStats, setJourneyStats] = useState<JourneyStats | null>(null);

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile/upgrade-campus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify college email");
      }

      sounds.pop();
      setJourneyStats(data.journeyStats);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEnterCampus() {
    onClose();
    router.refresh();
    window.location.href = "/app";
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 size-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* ─── STAGE 2: CELEBRATION MOMENT ─── */}
        {journeyStats ? (
          <div className="space-y-6 py-4 relative z-10 animate-in zoom-in-95 duration-300">
            {/* Emblem */}
            <div className="mx-auto size-20 rounded-3xl bg-linear-to-tr from-amber-500/20 via-primary/20 to-emerald-500/20 border border-primary/40 flex items-center justify-center shadow-lg">
              <GraduationCap className="size-10 text-primary animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="size-3.5" /> Verification Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                CAMPUS UNLOCKED
              </h2>
              <p className="text-sm font-extrabold text-primary">
                {journeyStats.collegeName}
              </p>
            </div>

            {/* Journey Narrative Card */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-5 space-y-2 text-center shadow-xs">
              <p className="text-xs text-muted-foreground font-medium">
                You started as an aspirant exploring from the outside.
              </p>
              {journeyStats.savedPostsCount > 0 && (
                <p className="text-xs font-bold text-foreground">
                  You saved {journeyStats.savedPostsCount} {journeyStats.savedPostsCount === 1 ? "post" : "posts"} in your vault.
                </p>
              )}
              <p className="text-sm font-black text-foreground pt-1">
                Today, you&apos;re officially inside.
              </p>
            </div>

            {/* What's Unlocked Grid */}
            <div className="grid grid-cols-2 gap-2 text-left text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/40">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Student Feed &amp; Posts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/40">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Campus Match Deck</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/40">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Direct Messaging</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border/40">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Saved Vault Kept</span>
              </div>
            </div>

            <Button
              onClick={handleEnterCampus}
              className="w-full h-12 text-sm font-black rounded-2xl bg-foreground text-background hover:opacity-90 transition-all gap-2 cursor-pointer shadow-lg"
            >
              <span>Enter Your Campus</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : (
          /* ─── STAGE 1: EMAIL VERIFICATION INPUT ─── */
          <div className="space-y-5 relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-2 -right-2 size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="mx-auto size-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <School className="size-7" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <GraduationCap className="size-3" /> Upgrade to Student Mode
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Unlock Your Campus
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Connect your accredited university email (@bitmesra.ac.in, @iitb.ac.in, etc.) to participate in discussions and matchmaking.
              </p>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Official College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="student@bitmesra.ac.in"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-muted/40 border border-border/60 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  All your past saved posts and profile preferences will be 100% preserved.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !collegeEmail.trim()}
                  className="w-full h-11 text-xs font-black rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? "Verifying Campus..." : "Verify & Unlock Campus"}
                  <ArrowRight className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="w-full h-9 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Continue in Preview Mode
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
