"use client";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  LandingContainer,
  LandingSection,
} from "@/components/landing/landing-design-system";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClosingCTAProps {
  isAuthenticated?: boolean;
}

export function ClosingCTA({ isAuthenticated = false }: ClosingCTAProps) {
  return (
    <LandingSection id="join" bg="default" className="py-24 sm:py-32">
      <LandingContainer>
        <div className="relative rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-linear-to-b from-white to-zinc-50 dark:from-[#111622] dark:to-[#0B0F17] p-8 sm:p-16 text-center space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Background subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[450px] rounded-full bg-radial from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Sparkles className="size-3.5" />
              1,350+ Campuses Across India
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              Your campus is already talking.{" "}
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Join the loop.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Verify your institutional email in 30 seconds. Connect with your actual
              classmates, speak freely, and experience college on its own private
              network.
            </p>
          </div>

          <div className="relative flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-all hover:shadow-[0_4px_20px_rgba(0,145,255,0.35)]"
                )}
              >
                Open Campus Feed <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-all hover:shadow-[0_4px_20px_rgba(0,145,255,0.35)]"
                )}
              >
                Join CampusLoop <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full px-7 border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-card/80 font-semibold text-foreground hover:bg-muted/60"
              )}
            >
              Explore Campus Hubs
            </Link>
          </div>

          <div className="relative flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Free for students • Institutional email verification required</span>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
