"use client";

import { useState, useEffect } from "react";
import { SignIn, SignUp, useUser } from "@hexclave/next";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Sparkles, ShieldCheck, UserPlus, ArrowRight, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";

interface ReferrerProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  institution?: { name: string } | null;
  referralCount: number;
  points: number;
}

export function JoinForm() {
  const searchParams = useSearchParams();
  const hexclaveUser = useUser();
  const { profile } = useProfile();

  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<"signin" | "signup">(() =>
    modeParam === "signup" ? "signup" : "signin"
  );

  const [referrerProfile, setReferrerProfile] = useState<ReferrerProfile | null>(null);
  const [isLoadingReferrer, setIsLoadingReferrer] = useState(false);

  // User is logged in if Hexclave user or campus profile is resolved
  const isLoggedIn = Boolean(hexclaveUser || profile);
  const needsOnboarding = isLoggedIn && profile && !profile.onboardingCompleted;

  // Handle URL mode query changes if explicitly modified
  useEffect(() => {
    if (modeParam === "signup") {
      setMode("signup");
    } else if (modeParam === "signin") {
      setMode("signin");
    }
  }, [modeParam]);

  // Handle referrer cookie and profile fetch
  const invite = searchParams.get("invite");
  useEffect(() => {
    if (!invite) return;

    document.cookie = `cl_referred_by=${encodeURIComponent(invite)}; path=/; max-age=604800; SameSite=Lax`;
    setIsLoadingReferrer(true);

    fetch(`/api/profile/${encodeURIComponent(invite)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<ReferrerProfile>;
      })
      .then((data) => {
        setReferrerProfile(data);
      })
      .catch(() => {
        setReferrerProfile(null);
      })
      .finally(() => {
        setIsLoadingReferrer(false);
      });
  }, [invite]);

  return (
    <div className="w-full max-w-sm space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Hero Badge & Brand Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Badge
          variant="outline"
          className="rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md gap-1.5 shadow-xs"
        >
          <Sparkles className="size-3.5 fill-primary text-primary" />
          <span>Verified Student Network</span>
        </Badge>

        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-black border border-white/20 shadow-md transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="CampusLoop" className="size-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-xl font-black tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>

        <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-tight">
          {mode === "signin" ? "Welcome Back to Loop" : "Join Your Campus Feed"}
        </h1>

        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          {mode === "signin"
            ? "Sign in with your verified college credentials."
            : "Connect with classmates, confessions, polls & campus matchmaking."}
        </p>
      </div>

      {/* Referrer Invitation Card */}
      {invite && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-3.5 shadow-xs">
          {isLoadingReferrer ? (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-2 w-28 bg-muted/60 rounded animate-pulse" />
              </div>
            </div>
          ) : referrerProfile ? (
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                {referrerProfile.displayName?.[0] || "S"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  Invited by <span className="text-primary">@{referrerProfile.username}</span>
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {referrerProfile.institution?.name ? referrerProfile.institution.name.split(",")[0] : "Verified Student"}
                </p>
              </div>
              <UserPlus className="size-4 text-primary shrink-0" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center font-medium">
              🎁 Special Invitation Access Active
            </p>
          )}
        </div>
      )}

      {/* Logged-in shortcut: skip auth entirely */}
      {isLoggedIn ? (
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-card to-card p-6 shadow-xl backdrop-blur-xl space-y-4 text-center">
          <div className="size-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto">
            <LayoutDashboard className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-foreground">You&apos;re already signed in</h2>
            <p className="text-xs text-muted-foreground">
              {profile?.displayName ? `Welcome back, ${profile.displayName.split(" ")[0]}. ` : ""}
              {needsOnboarding ? "Finish setting up your campus profile." : "Your campus feed is waiting."}
            </p>
          </div>
          <Link
            href={needsOnboarding ? "/app/onboarding" : "/app"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/95 transition-all"
          >
            {needsOnboarding ? "Complete Setup" : "Open CampusLoop"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-card/90 p-5 shadow-xl backdrop-blur-xl relative space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-xl bg-muted/50 p-1 text-xs font-bold border border-border/40">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "py-1.5 rounded-lg transition-all cursor-pointer text-center",
                mode === "signin"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={cn(
                "py-1.5 rounded-lg transition-all cursor-pointer text-center",
                mode === "signup"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Auth Form Container - Stable & Persistent without re-mounts */}
          <div className="flex flex-col justify-center min-h-[260px]">
            {mode === "signin" ? (
              <SignIn key="hexclave-signin" />
            ) : (
              <SignUp key="hexclave-signup" />
            )}
          </div>
        </div>
      )}

      {/* Trust Footer */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Strictly Verified College Domains</span>
        </div>

        <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
          By joining, you accept our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>{" "}
          &{" "}
          <Link href="/safety" className="underline hover:text-foreground">
            Safety Standards
          </Link>.
        </p>
      </div>
    </div>
  );
}
