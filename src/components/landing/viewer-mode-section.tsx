import { ArrowRight, Bookmark, Eye, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { VIEWER_MODE_CONTENT } from "@/constants/landing";

const STEP_ICONS = [Eye, Bookmark, ShieldCheck];

export function ViewerModeSection() {
  return (
    <LandingSection bg="muted">
      <LandingContainer>
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={VIEWER_MODE_CONTENT.eyebrow}
          headlineMain={VIEWER_MODE_CONTENT.headlineMain}
          headlineSub={VIEWER_MODE_CONTENT.headlineSub}
          description={VIEWER_MODE_CONTENT.description}
        />

        {/* Funnel Visual Strip */}
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
              <span className="font-mono text-xs font-bold text-foreground">
                College Aspirant Access
              </span>
              <span className="font-mono text-[11px] text-[#1D9BF0] font-bold">
                Explore · Bookmark · Join on Admission
              </span>
            </div>

            {/* 3 Funnel Steps */}
            <div className="grid gap-5 md:grid-cols-3">
              {VIEWER_MODE_CONTENT.steps.map((item, idx) => {
                const Icon = STEP_ICONS[idx % STEP_ICONS.length];
                return (
                  <div key={item.step} className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Strict Boundary Callout */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1D9BF0]/15 text-[#1D9BF0]">
                  <Lock className="size-4" />
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                  <strong className="text-foreground">{VIEWER_MODE_CONTENT.callout.title}</strong>{" "}
                  {VIEWER_MODE_CONTENT.callout.desc}
                </p>
              </div>

              <Link
                href="/colleges"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <span>{VIEWER_MODE_CONTENT.callout.cta}</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </LandingContainer>
    </LandingSection>
  );
}
