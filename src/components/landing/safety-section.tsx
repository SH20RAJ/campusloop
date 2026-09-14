"use client";

import {
  KeyRound,
  MailCheck,
  Server,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function SafetySection() {
  return (
    <LandingSection id="safety" bg="default">
      <LandingContainer>
        <LandingSectionHeader
          badge="Trust & Defensibility"
          headlineMain="Built differently from"
          headlineHighlight="anonymous social apps."
          description="Traditional anonymous platforms foster harassment because bad actors face zero consequences. CampusLoop is engineered with cryptographic guardrails that protect honest discourse while keeping our community safe."
          align="center"
        />

        {/* ─── 4 Safety Principles Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <MailCheck className="size-5" />
              </span>
              <StatusPill status="healthy" label="Gatekeeper" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Institutional Email Gate
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access is gated strictly by active <code>.ac.in</code> and{" "}
              <code>.edu.in</code> institutional domains. Random outsiders, coaching
              promoters, and trolls cannot register or snoop on campus discussions.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Supported Domains</span>
              <span className="font-semibold text-foreground">
                1,350+ Indian Universities
              </span>
            </div>
          </LandingCard>

          {/* Pillar 2 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldAlert className="size-5" />
              </span>
              <StatusPill status="live" label="Real-Time Regex" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Automated PII Scrubbing
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our real-time safety shield analyzes posts before publication,
              automatically masking phone numbers, email addresses, and student roll
              numbers to prevent doxxing and harassment attempts.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs flex items-center justify-between font-mono">
              <span className="text-muted-foreground">+91 98765 43210</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                &rarr; [MASKED BY SHIELD]
              </span>
            </div>
          </LandingCard>

          {/* Pillar 3 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <KeyRound className="size-5" />
              </span>
              <StatusPill status="live" label="Zero-Leak" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Cryptographic Identity Escrow
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Anonymous confessions contain zero foreign-key references to your user
              record in the public schema. The linkage is held in an isolated,
              tamper-evident audit vault accessible only for severe policy violations.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Admin/Faculty Snooping</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Technically Impossible
              </span>
            </div>
          </LandingCard>

          {/* Pillar 4 */}
          <LandingCard className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheck className="size-5" />
              </span>
              <StatusPill status="healthy" label="Community Safe" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Community Self-Moderation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Verified campus peers hold moderation power through real-time flagging,
              upvote consensus, and automated temporary quarantines. Community
              standards are upheld by students, for students.
            </p>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Incident Response</span>
              <span className="font-semibold text-foreground">
                Automated 15-min Quarantine
              </span>
            </div>
          </LandingCard>
        </div>

        {/* ─── Official DPDP Act 2023 Compliance Banner ─── */}
        <div className="rounded-3xl border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0E131F]/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-foreground">
                  Digital Personal Data Protection (DPDP) Act 2023
                </h4>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  COMPLIANT
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
                End-to-end data localization on Indian sovereign cloud infrastructure.
                Strict data minimization, purpose limitation, and user-initiated data
                erasure rights honored by default.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Data Sovereign
              </span>
              <span className="text-xs font-bold text-foreground">India Cloud Edge</span>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 border border-border/60 text-muted-foreground">
              <Server className="size-4" />
            </div>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
