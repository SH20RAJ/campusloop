"use client";

import {
  ArrowRight,
  Eye,
  Lock,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function ThreeModesSection() {
  return (
    <LandingSection id="three-modes" bg="subtle">
      <LandingContainer>
        <LandingSectionHeader
          badge="Access Architecture"
          headlineMain="Three distinct modes."
          headlineHighlight="One connected network."
          description="Different campus moments call for different postures. CampusLoop provides purposeful modes tailored for daily collaboration, candid expression, and pre-admission exploration."
          align="center"
        />

        {/* ─── 3 Mode Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mode 1: General Mode */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <UserCheck className="size-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Default Mode
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  General Mode
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">
                  Real-Name Campus Life
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Participate with your verified student name, branch, and graduation
                  year. Build your campus reputation, run for club executive boards,
                  form hackathon squads, and list items in the hostel marketplace.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Profile Verified</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Official .ac.in
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Audience</span>
                  <span>Your College Hub</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                For public campus collaboration
              </span>
            </div>
          </LandingCard>

          {/* Mode 2: Anonymous Mode */}
          <LandingCard className="flex flex-col justify-between space-y-6 border-purple-500/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Lock className="size-5" />
                </span>
                <StatusPill status="live" label="Identity Escrow" />
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Anonymous Mode
                </h3>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mt-0.5">
                  Speak Without Public Display
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Confessions, candid professor reviews, mental health check-ins, and
                  sensitive campus issues. Your real identity is shielded while backend
                  cryptographic accountability guarantees a harassment-free space.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Public Handle</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    @anon_student
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Safety Masking</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Auto-PII Regex Active
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                Protected by cryptographic hash
              </span>
            </div>
          </LandingCard>

          {/* Mode 3: Viewer Mode */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Eye className="size-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Aspirant Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Viewer Mode
                </h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mt-0.5">
                  See Campus Life Before You Arrive
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Built for JEE, NEET, and CUET aspirants. Read-only access to
                  unfiltered campus culture, senior placement advice, hostel reviews,
                  and syllabus discussions without college PR spin.
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Access Level</span>
                  <span className="font-bold text-foreground">Read-Only Feeds</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Upgrade Path</span>
                  <span>Instant upon college email</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">For upcoming students</span>
              <Link
                href="/aspirants"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Aspirant Hub <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
