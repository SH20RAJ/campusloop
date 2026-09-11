"use client";

import { Lock, MailCheck, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import {
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
} from "@/components/landing/landing-design-system";
import { Reveal } from "@/components/landing/reveal";
import { VERIFIED_IDENTITY_CONTENT } from "@/constants/landing";

const PHONE_RE = /\b\d{10}\b/g;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const STEP_ICONS = [MailCheck, UserCheck, Users, ShieldCheck];

export function VerifiedIdentitySection() {
  const [inputText, setInputText] = useState(
    VERIFIED_IDENTITY_CONTENT.privacyDemo.inputDefault
  );

  const hadPii = Boolean(inputText.match(PHONE_RE) || inputText.match(EMAIL_RE));

  return (
    <LandingSection bg="default">
      <LandingContainer>
        {/* Section Heading */}
        <LandingSectionHeader
          eyebrow={VERIFIED_IDENTITY_CONTENT.eyebrow}
          headlineMain={VERIFIED_IDENTITY_CONTENT.headlineMain}
          headlineHighlight={VERIFIED_IDENTITY_CONTENT.headlineHighlight}
          description={VERIFIED_IDENTITY_CONTENT.description}
        />

        {/* 4-Step Verification Flow */}
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                How Privacy Works on CampusLoop
              </span>
              <span className="font-mono text-[11px] text-[#1D9BF0] font-bold">
                One-Time OTP · Campus-Isolated · AES-Vault Sealed
              </span>
            </div>

            {/* Steps Flow Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {VERIFIED_IDENTITY_CONTENT.steps.map((step, idx) => {
                const Icon = STEP_ICONS[idx % STEP_ICONS.length];
                return (
                  <div key={step.number} className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                      <Icon className="size-4.5" />
                    </div>
                    <div className="font-bold text-sm text-foreground">
                      {step.number}. {step.title}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                    <div className="pt-2 text-[10px] font-mono font-semibold text-[#1D9BF0] uppercase tracking-wider">
                      {step.tag}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Client-Side Privacy Shield */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="size-4 text-[#1D9BF0]" />
                  <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    {VERIFIED_IDENTITY_CONTENT.privacyDemo.title}
                  </span>
                </div>
                {hadPii ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 border border-destructive/30 px-3 py-0.5 text-[11px] font-mono font-bold text-destructive">
                    <span className="size-1.5 rounded-full bg-destructive animate-ping" />
                    {VERIFIED_IDENTITY_CONTENT.privacyDemo.flaggedBadge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-mono font-bold text-emerald-500">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {VERIFIED_IDENTITY_CONTENT.privacyDemo.cleanBadge}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="pii-simulation-input"
                  className="block text-xs font-semibold text-muted-foreground"
                >
                  {VERIFIED_IDENTITY_CONTENT.privacyDemo.inputLabel}
                </label>
                <textarea
                  id="pii-simulation-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border/60 bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-[#1D9BF0] focus:outline-none transition-colors"
                />
              </div>

              {/* Real-Time Detection Logs */}
              <div className="grid gap-2 sm:grid-cols-3 rounded-lg border border-border/40 bg-background/80 p-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Phone check: </span>
                  <span className={inputText.match(PHONE_RE) ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>
                    {inputText.match(PHONE_RE) ? "FLAGGED (Blocked)" : "Clean"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email check: </span>
                  <span className={inputText.match(EMAIL_RE) ? "text-destructive font-bold" : "text-emerald-500 font-bold"}>
                    {inputText.match(EMAIL_RE) ? "FLAGGED (Blocked)" : "Clean"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Peer visibility: </span>
                  <span className="text-emerald-500 font-bold">Untrackable</span>
                </div>
              </div>
            </div>

            {/* 3 Core Identity Pillars */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              {VERIFIED_IDENTITY_CONTENT.pillars.map((pillar) => (
                <div key={pillar.number} className="space-y-1.5">
                  <div className="font-mono text-xs font-bold text-[#1D9BF0]">
                    {pillar.number}
                  </div>
                  <h4 className="text-sm font-bold text-foreground">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </LandingContainer>
    </LandingSection>
  );
}
