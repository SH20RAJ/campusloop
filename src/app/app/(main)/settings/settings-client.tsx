"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { toast } from "sonner";
import {
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  LogOut,
  Bell,
  Sliders,
  Check,
  School,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
  profile: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    course: string | null;
    branch: string | null;
    year: number | null;
    role: string;
    points: number;
    institutionName: string;
  };
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultScope, setDefaultScope] = useState<"GLOBAL" | "CAMPUS">("GLOBAL");
  const [notifyUpvotes, setNotifyUpvotes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);

  const currentAvatar = getAvatarUrl(avatarUrl, profile.username);

  function handleResetToDefaultAvatar() {
    const defaultSvg = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(profile.username)}`;
    setAvatarUrl(defaultSvg);
    toast.success("Avatar reset to personalized DiceBear SVG!");
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully! ✨");
      router.refresh();
    } catch {
      toast.error("Could not save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 px-4 py-4 backdrop-blur-xl border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
            <Sliders className="h-5 w-5 text-primary" /> Settings & Account
          </h1>
          <p className="text-xs text-muted-foreground">Manage your campus identity, preferences, & privacy.</p>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Card Section */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Campus Identity
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Verified Student
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="relative group shrink-0">
              <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
                <AvatarImage src={currentAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-lg">
                  {displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <p className="text-base font-black text-foreground">@{profile.username}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <School className="h-3.5 w-3.5 text-primary" /> {profile.institutionName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetToDefaultAvatar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5 text-primary" /> Reset to DiceBear SVG DP
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-4 border-t border-border/60">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Bio / Campus Vibe</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your interests, department, or goals..."
                rows={3}
                className="w-full rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-foreground outline-none focus:border-primary focus:bg-background transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="h-4 w-4" /> Save Profile Changes
            </button>
          </form>
        </section>

        {/* Preferences Section */}
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> Platform Preferences
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground">Default Feed Scope</p>
                <p className="text-[11px] text-muted-foreground">Select what you see first when opening CampusLoop.</p>
              </div>

              <div className="flex rounded-xl bg-muted p-1 text-xs font-bold border border-border/40">
                <button
                  type="button"
                  onClick={() => setDefaultScope("GLOBAL")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    defaultScope === "GLOBAL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultScope("CAMPUS")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    defaultScope === "CAMPUS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  My College
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-primary" /> Upvote Alerts
                </p>
                <p className="text-[11px] text-muted-foreground">Receive real-time alerts when students upvote your posts.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyUpvotes}
                onChange={(e) => setNotifyUpvotes(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-muted/20">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-primary" /> Comment & DM Alerts
                </p>
                <p className="text-[11px] text-muted-foreground">Notify when someone replies or sends a direct message.</p>
              </div>
              <input
                type="checkbox"
                checked={notifyComments}
                onChange={(e) => setNotifyComments(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Verification & Rewards Status */}
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Loop Points & Star Badge
            </h2>
            <span className="text-xs font-extrabold text-primary">{profile.points} LP</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Earn +20 LP for every classmate who joins CampusLoop using your referral link. Unlock blue-tick verified star badges at 150 LP!
          </p>

          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
          >
            View Verification Badges & Invites →
          </Link>
        </section>

        {/* Danger Zone */}
        <section className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-destructive flex items-center gap-2">
            <Lock className="h-4 w-4" /> Security & Account Session
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Sign out of your active student session on this device.
            </p>

            <Link
              href="/handler/sign-out"
              className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:bg-destructive/90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
