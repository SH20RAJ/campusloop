"use client";

import { ArrowRight, Compass, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { LandingSection } from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { FINAL_CTA_CONTENT } from "@/constants/landing";

interface FinalCTASectionProps {
  isAuthenticated: boolean;
}

export function FinalCTASection({ isAuthenticated }: FinalCTASectionProps) {
  return (
    <LandingSection bg="muted" className="relative overflow-hidden py-24 sm:py-32">
      {/* Background Ambient Spotlight & Shapes */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[700px] rounded-full bg-gradient-to-tr from-[#1D9BF0]/15 via-purple-600/10 to-transparent blur-3xl" />
      </div>

      <ElegantShape
        delay={0.2}
        width={320}
        height={80}
        rotate={-12}
        y={15}
        gradient="from-[#1D9BF0]/20"
        className="left-[5%] bottom-[10%] pointer-events-none hidden md:block"
      />
      <ElegantShape
        delay={0.4}
        width={240}
        height={60}
        rotate={18}
        y={10}
        gradient="from-purple-500/20"
        className="right-[8%] top-[15%] pointer-events-none hidden md:block"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 dark:border-white/10 bg-card/85 dark:bg-card/50 backdrop-blur-xl p-8 sm:p-14 text-center space-y-8 shadow-2xl">
            {/* Ambient Radial Gradient Inside Card */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(29,155,240,0.15),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/25 font-mono text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                <ShieldCheck className="size-3.5" />
                <span>{FINAL_CTA_CONTENT.badge}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                {FINAL_CTA_CONTENT.headline}
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                {FINAL_CTA_CONTENT.subheadline}
              </p>
            </div>

            {/* Dual CTA Actions */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#1D9BF0]/25 transition-all active:scale-98 cursor-pointer"
                >
                  <span>{FINAL_CTA_CONTENT.ctaPrimaryAuthenticated}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              ) : (
                <Link
                  href="/handler/sign-up"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#1D9BF0]/25 transition-all active:scale-98 cursor-pointer"
                >
                  <span>{FINAL_CTA_CONTENT.ctaPrimary}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              )}

              <Link
                href="/app/colleges"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/60 bg-muted/50 hover:bg-muted px-6 text-sm sm:text-base font-bold text-foreground transition-all active:scale-98 cursor-pointer backdrop-blur-sm"
              >
                <Compass className="mr-2 size-4 text-[#1D9BF0]" />
                <span>{FINAL_CTA_CONTENT.ctaSecondary}</span>
              </Link>
            </div>

            {/* Credible Footer Attribution */}
            <div className="relative z-10 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-[#1D9BF0]" />
                <span>{FINAL_CTA_CONTENT.footerAttribution}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                100% Student-Only Verification
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </LandingSection>
  );
}
