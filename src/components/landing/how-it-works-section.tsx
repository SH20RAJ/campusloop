"use client";

import { CheckCircle2, MailCheck, School, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HOW_IT_WORKS_CONTENT } from "@/constants/landing";

const ACADEMIC_DOMAIN = /\.(edu|ac\.in|edu\.in|ac\.uk|edu\.au|edu\.sg|ac\.nz)$/;

const STEP_ICONS = [MailCheck, School, Sparkles];

function DomainChecker() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "no">("idle");
  const domain = email.trim().split("@")[1]?.toLowerCase() ?? "";

  function check() {
    if (!domain) return;
    setState(ACADEMIC_DOMAIN.test(domain) ? "ok" : "no");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="verify-email-input" className="sr-only">
            College email
          </label>
          <Input
            id="verify-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setState("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder={HOW_IT_WORKS_CONTENT.domainChecker.placeholder}
            className="bg-background"
          />
        </div>
        <Button onClick={check} className="gap-1.5 cursor-pointer">
          <MailCheck className="size-4" />
          {HOW_IT_WORKS_CONTENT.domainChecker.buttonText}
        </Button>
      </div>

      <div aria-live="polite" className="flex h-5 items-center gap-1.5 text-xs">
        {state === "ok" && (
          <>
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span className="font-medium text-emerald-500">
              {domain} {HOW_IT_WORKS_CONTENT.domainChecker.recognizedMessage}
            </span>
          </>
        )}
        {state === "no" && (
          <>
            <ShieldAlert className="size-3.5 text-amber-500" />
            <span className="font-medium text-amber-500">
              {HOW_IT_WORKS_CONTENT.domainChecker.unrecognizedMessage}
            </span>
          </>
        )}
        {state === "idle" && (
          <span className="text-muted-foreground">
            {HOW_IT_WORKS_CONTENT.domainChecker.idleMessage}
          </span>
        )}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <LandingSection bg="muted">
      <LandingContainer>
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={HOW_IT_WORKS_CONTENT.eyebrow}
          headlineMain={HOW_IT_WORKS_CONTENT.headlineMain}
          headlineSub={HOW_IT_WORKS_CONTENT.headlineSub}
          description={HOW_IT_WORKS_CONTENT.description}
        />

        {/* 3 Step Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS_CONTENT.steps.map((s, idx) => {
            const Icon = STEP_ICONS[idx % STEP_ICONS.length];
            return (
              <Reveal key={s.step} delay={idx * 0.08}>
                <div className="relative h-full rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="font-mono text-xs font-bold text-muted-foreground">{s.step}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                      <span className="font-mono text-xs text-[#1D9BF0] font-medium">{s.subtitle}</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <CheckCircle2 className="size-3.5" />
                    <span>Instant access</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Interactive Domain Compatibility Checker */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#1D9BF0]">
                {HOW_IT_WORKS_CONTENT.domainChecker.eyebrow}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                {HOW_IT_WORKS_CONTENT.domainChecker.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {HOW_IT_WORKS_CONTENT.domainChecker.description}
              </p>
            </div>

            <DomainChecker />

            <p className="pt-2 text-[11px] font-mono text-muted-foreground border-t border-border/40">
              {HOW_IT_WORKS_CONTENT.domainChecker.footnote}
            </p>
          </div>
        </Reveal>
      </LandingContainer>
    </LandingSection>
  );
}
