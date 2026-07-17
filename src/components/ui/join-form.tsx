"use client";

import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@hexclave/next";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function JoinForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

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
