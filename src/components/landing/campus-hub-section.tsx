"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileCheck2,
  PackageSearch,
} from "lucide-react";
import Link from "next/link";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function CampusHubSection() {
  return (
    <LandingSection id="campus-hub" bg="subtle">
      <LandingContainer>
        <LandingSectionHeader
          badge="Daily Utilities"
          headlineMain="The stuff students"
          headlineHighlight="already need."
          description="Forget frantic WhatsApp status inquiries for notes or shady telegram links. CampusLoop unifies essential campus utilities into an indexed, searchable student vault."
          align="center"
        />

        {/* ─── Bento Grid of Utilities ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Utility 1: Notes & PYQ Vault */}
          <LandingCard className="flex flex-col justify-between space-y-4 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <BookOpen className="size-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Academic Vault
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Past Year Questions (PYQs) & Notes
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Every semester&apos;s mid-sem and end-sem papers, verified professor
                  handouts, and topper notes categorized strictly by university,
                  branch, and semester.
                </p>
              </div>

              {/* Subject files preview */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-blue-600" />
                    <span className="font-semibold text-foreground">
                      Data Structures (CS301) End-Sem 2025
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    PDF • 1.4 MB
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="size-4 text-emerald-600" />
                    <span className="font-semibold text-foreground">
                      Digital Electronics Formula Sheet
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    PDF • 840 KB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Crowdsourced & senior verified</span>
              <Link
                href="/handler/sign-up"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Browse Vault <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>

          {/* Utility 2: Lost & Found */}
          <LandingCard className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <PackageSearch className="size-5" />
                </span>
                <StatusPill status="healthy" label="Fast Recovery" />
              </div>

              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Lost & Found
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Lost your college ID card, calculator, or dorm room keys? Broadcast
                  an alert to campus residents instantly with photo proof.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs space-y-1">
                <span className="font-bold text-foreground block">
                  Found: Casio fx-991EX
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Near Lecture Hall Complex 2 • Left with guard
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
              92% recovery within 24h
            </div>
          </LandingCard>

          {/* Utility 3: Campus Newsroom */}
          <LandingCard className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Calendar className="size-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Official
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Campus Newsroom
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Verified notices for mid-sem schedules, fest registrations,
                  placement cell deadlines, and holiday announcements.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs space-y-1">
                <span className="font-bold text-foreground block">
                  End-Sem Timetable Released
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Official Academic Cell Circular #82
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
              Verified circular archive
            </div>
          </LandingCard>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
