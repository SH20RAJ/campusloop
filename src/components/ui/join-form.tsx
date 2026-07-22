"use client";

import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@hexclave/next";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserPlus } from "lucide-react";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [referrerProfile, setReferrerProfile] = useState<ReferrerProfile | null>(null);
  const [isLoadingReferrer, setIsLoadingReferrer] = useState(false);

  useEffect(() => {
    const initialMode = searchParams.get("mode");
    if (initialMode === "signup") {
      setMode("signup");
    } else {
      setMode("signin");
    }

    const invite = searchParams.get("invite");
    if (invite) {
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
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-black shadow-md shadow-primary/5">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {mode === "signin" ? "Welcome back to the loop" : "Create your student passport"}
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs">
          {mode === "signin" 
            ? "Sign in to view your campus feed and connect with peers."
            : "Verify your college email to access confessions, polls, and matches."}
        </p>
      </div>

      {/* Referrer Card */}
      {searchParams.get("invite") && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          {isLoadingReferrer ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted/60 shimmer-effect" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-muted/60 rounded shimmer-effect" />
                <div className="h-2.5 w-32 bg-muted/40 rounded shimmer-effect" />
              </div>
            </div>
          ) : referrerProfile ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-orange-500/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {referrerProfile.displayName?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  You were invited by <span className="text-primary">@{referrerProfile.username}</span>
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {referrerProfile.displayName}
                  {referrerProfile.institution?.name ? ` • ${referrerProfile.institution.name}` : ""}
                </p>
              </div>
              <UserPlus className="h-4 w-4 text-primary shrink-0" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              You were invited by a CampusLoop student
            </p>
          )}
        </div>
      )}

      {/* Card Wrapper */}
      <div className="rounded-[28px] border border-border/80 bg-card p-6 shadow-xl relative overflow-hidden">
        {/* Toggle Switcher */}
        <div className="flex rounded-xl bg-muted p-0.5 border border-border/50 text-xs font-bold mb-6">
          <button
            onClick={() => setMode("signin")}
            className={cn(
              "flex-1 py-2 rounded-lg transition-all cursor-pointer",
              mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={cn(
              "flex-1 py-2 rounded-lg transition-all cursor-pointer",
              mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Form rendering */}
        <div className="min-h-[300px] flex flex-col justify-center animate-in fade-in duration-300">
          {mode === "signin" ? (
            <SignIn />
          ) : (
            <SignUp />
          )}
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-xs text-muted-foreground">
        By joining, you agree to our{" "}
        <Link href="/" className="hover:text-foreground underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/" className="hover:text-foreground underline">Safety Guidelines</Link>.
      </p>
    </div>
  );
}
