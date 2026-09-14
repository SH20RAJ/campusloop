"use client";

import {
  BookOpen,
  Code,
  Heart,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function MatchModeSection() {
  return (
    <LandingSection id="match" bg="default">
      <LandingContainer>
        <LandingSectionHeader
          badge="18+ Verified Match"
          headlineMain="Meet people without"
          headlineHighlight="making it awkward."
          description="Dating apps on campus create immense social friction because everyone knows who is on them. CampusLoop Match solves this: everyone appears by design across multiple intents, and romantic matches only reveal when 100% mutual."
          align="center"
        />

        {/* ─── Match Mode Interactive Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: 4 Intent Pillars */}
          <div className="lg:col-span-7 space-y-4">
            <LandingCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  Four Intent Streams · Zero Awkwardness
                </h3>
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  OPT-IN PREFERENCES
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Because students appear for project teams, sports partners, and study
                circles, simply having an active presence does not expose personal
                intentions to the entire batch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Users className="size-4 text-blue-500" />
                    <span>Campus Friends</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Connect with fellow hostelites, gym partners, and gaming squads.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <BookOpen className="size-4 text-emerald-500" />
                    <span>Study Partners</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Team up for mid-sem prep, branch electives, and lab assignments.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Code className="size-4 text-purple-500" />
                    <span>Hackathon Co-Founders</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Complementary tech stack matching (frontend + backend + AI).
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Heart className="size-4 text-rose-500" />
                    <span>Campus Dating</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Clean, verified dating with verified student badges and zero creeps.
                  </p>
                </div>
              </div>
            </LandingCard>

            {/* Secret Crush Mechanic Card */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                  <Sparkles className="size-4 text-rose-500" />
                  <span>The Secret Crush Matcher</span>
                </div>
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                  5 INTENTS MAX
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                Have a crush in your lecture hall or canteen? Add them secretly to your
                Crush Vault. They will never receive a notification, email, or hint. Only
                if they independently add you to their Crush Vault will a mutual match
                dialog reveal. Zero rejection embarrassment.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 pt-1">
                <Lock className="size-3" /> Encrypted Vault · Strictly 100% Mutual
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Match Deck Preview */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <LandingCard className="h-full flex flex-col justify-between space-y-5 border-zinc-200/90 dark:border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Heart className="size-3.5 text-rose-500" />
                    Campus Discovery Deck
                  </span>
                  <StatusPill status="live" label="18+ Verified" />
                </div>

                {/* Match Mockup Card */}
                <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-[#151C2C] p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-foreground">
                          Riya M., 21
                        </h4>
                        <span className="size-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Electronics & Comm &apos;25 • BIT Mesra
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Co-founder / Friend
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 leading-relaxed">
                    &ldquo;Working on an IoT rover for Robosoc. Love filter coffee at the
                    IC canteen, indie rock, and building side projects at 2 AM.&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded-md bg-card px-2 py-0.5 font-medium text-muted-foreground border">
                      Embedded C
                    </span>
                    <span className="rounded-md bg-card px-2 py-0.5 font-medium text-muted-foreground border">
                      Robosoc
                    </span>
                    <span className="rounded-md bg-card px-2 py-0.5 font-medium text-muted-foreground border">
                      Badminton
                    </span>
                  </div>

                  {/* Micro Actions */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      className="rounded-full border border-border/80 bg-card p-3 text-muted-foreground hover:text-foreground transition-all shadow-2xs"
                    >
                      ✕ Pass
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Heart className="size-3.5 fill-white" /> Connect
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground text-center">
                College email verification required for Match activation
              </div>
            </LandingCard>
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
