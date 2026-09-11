import { ArrowRight, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LandingSection } from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { FINAL_CTA_CONTENT } from "@/constants/landing";

interface FinalCTASectionProps {
  isAuthenticated: boolean;
}

export function FinalCTASection({ isAuthenticated }: FinalCTASectionProps) {
  return (
    <LandingSection bg="muted">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 sm:p-14 text-center space-y-8">
            <div className="max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20 font-mono text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>{FINAL_CTA_CONTENT.badge}</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                {FINAL_CTA_CONTENT.headline}
              </h2>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
                {FINAL_CTA_CONTENT.subheadline}
              </p>
            </div>

            {/* Dual CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#1D9BF0]/20 transition-all active:scale-98 cursor-pointer"
                >
                  <span>{FINAL_CTA_CONTENT.ctaPrimaryAuthenticated}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              ) : (
                <Link
                  href="/handler/sign-up"
                  className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-8 text-sm sm:text-base font-bold text-white shadow-lg shadow-[#1D9BF0]/20 transition-all active:scale-98 cursor-pointer"
                >
                  <span>{FINAL_CTA_CONTENT.ctaPrimary}</span>
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              )}

              <Link
                href="/colleges"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/60 bg-muted/40 hover:bg-muted px-6 text-sm sm:text-base font-bold text-foreground transition-all active:scale-98 cursor-pointer"
              >
                <Compass className="mr-2 size-4 text-[#1D9BF0]" />
                <span>{FINAL_CTA_CONTENT.ctaSecondary}</span>
              </Link>
            </div>

            {/* Credible Footer Attribution */}
            <div className="pt-4 border-t border-border/40 font-mono text-xs text-muted-foreground">
              <span>{FINAL_CTA_CONTENT.footerAttribution}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </LandingSection>
  );
}
