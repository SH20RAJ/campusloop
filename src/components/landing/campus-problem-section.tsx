import { ArrowRight, MessageSquare, ShieldAlert, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { CAMPUS_PROBLEM_CONTENT } from "@/constants/landing";

const CARD_ICONS = [MessageSquare, ShieldAlert, ShoppingBag];

export function CampusProblemSection() {
  return (
    <LandingSection bg="muted">
      <LandingContainer>
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={CAMPUS_PROBLEM_CONTENT.eyebrow}
          headlineMain={CAMPUS_PROBLEM_CONTENT.headlineMain}
          headlineSub={CAMPUS_PROBLEM_CONTENT.headlineSub}
          description={CAMPUS_PROBLEM_CONTENT.description}
        />

        {/* 3 Problem Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {CAMPUS_PROBLEM_CONTENT.cards.map((item, idx) => {
            const Icon = CARD_ICONS[idx % CARD_ICONS.length];
            return (
              <Reveal key={item.title} delay={idx * 0.08}>
                <div className="group relative h-full rounded-2xl border border-border/40 bg-card p-6 shadow-xs transition-all hover:border-border hover:bg-muted/10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Card Badge */}
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                        {item.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-destructive">{item.problem}</p>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{item.tag}</span>
                    <span className="text-destructive font-bold flex items-center gap-1">
                      <X className="size-3" />
                      <span>Not working</span>
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Resolution Banner */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 max-w-2xl">
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#1D9BF0]">
                {CAMPUS_PROBLEM_CONTENT.resolution.eyebrow}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {CAMPUS_PROBLEM_CONTENT.resolution.headline}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {CAMPUS_PROBLEM_CONTENT.resolution.description}
              </p>
            </div>
            <Link
              href="/handler/sign-up"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-6 text-xs font-bold text-white transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <span>{CAMPUS_PROBLEM_CONTENT.resolution.cta}</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </div>
        </Reveal>
      </LandingContainer>
    </LandingSection>
  );
}
