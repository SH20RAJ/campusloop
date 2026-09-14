"use client";

import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";

interface CleanCTAProps {
  isAuthenticated?: boolean;
}

export function CleanCTA({ isAuthenticated = false }: CleanCTAProps) {
  return (
    <section className="py-24 border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6">
          <BadgeCheck className="size-3.5" />
          <span>Strictly for Verified College Students</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Your campus has a story today. <br />
          <span className="text-muted-foreground">Don&apos;t miss the loop.</span>
        </h2>

        <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
          Join thousands of verified students sharing authentic campus moments, solved past-year exam papers, and club updates.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all active:scale-95"
          >
            {isAuthenticated ? "Enter Campus Feed" : "Join with College Email"}
            <ArrowRight className="ml-2 size-4" />
          </Link>

          <Link
            href="/colleges"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border/60 bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            Browse 1,350+ Colleges
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground/70">
          Takes under 30 seconds · Strictly .ac.in / .edu.in verified · 100% free forever
        </p>
      </div>
    </section>
  );
}
