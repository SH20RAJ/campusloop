"use client";

import {
  ArrowRight,
  BookOpen,
  Heart,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Store,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  LandingCard,
  LandingContainer,
  LandingSection,
  LandingSectionHeader,
  StatusPill,
} from "@/components/landing/landing-design-system";

export function EcosystemBento() {
  return (
    <LandingSection id="ecosystem" bg="subtle">
      <LandingContainer>
        {/* Section Header */}
        <LandingSectionHeader
          badge="Product Ecosystem"
          headlineMain="Everything happening on campus."
          headlineHighlight="In one place."
          description="Campus life used to be scattered across 40 noisy WhatsApp groups and sketchy Instagram pages. CampusLoop replaces the fragmentation with an integrated campus operating system."
          align="center"
        />

        {/* ─── Bento Grid (6 Sophisticated Cards) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Campus Feed */}
          <LandingCard className="flex flex-col justify-between space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <MessageSquare className="size-5" />
                </span>
                <StatusPill status="live" label="Real-Time Feed" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Campus Feed & Confessions
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Dual-identity posting with cryptographic accountability. Share raw
                  campus takes, participate in uncheatable polls, and catch up on
                  24-hour campus stories.
                </p>
              </div>

              {/* Realistic Feed Micro-Preview */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-white/5 bg-zinc-50/70 dark:bg-[#151C2C]/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-purple-500/15 text-purple-600 font-bold text-[10px]">
                      🎭
                    </span>
                    <span className="font-bold text-foreground">@anon_sac</span>
                    <span className="text-muted-foreground">• 18m ago</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Identity Escrowed
                  </span>
                </div>
                <p className="text-xs text-foreground/90 leading-normal">
                  &ldquo;The robotics society lab air-conditioning is literally the only
                  livable temperature on campus right now. Midsem study sessions shifting
                  there officially.&rdquo;
                </p>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                  <span>👍 56 Agrees</span>
                  <span>💬 14 Comments</span>
                  <span>🔥 Trending #MidSem</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Dual-state posting engine</span>
              <Link
                href="/handler/sign-up"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Join Feed <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>

          {/* Card 2: Communities */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Users className="size-5" />
                </span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  Sub-Hubs
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Communities & Societies
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Clubs, hostels, batch channels, and hackathon teams with verified
                  rosters and circular alerts.
                </p>
              </div>

              {/* Society Chips */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-foreground">ACM Student Chapter</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">420 members</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-card p-2.5 border border-border/50 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <span className="font-semibold text-foreground">Hostel 7 Tech Wing</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">290 members</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">No random spam</span>
              <Link
                href="/colleges"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Explore Hubs <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>

          {/* Card 3: Match Mode (18+) */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <Heart className="size-5" />
                </span>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  18+ VERIFIED
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Match Mode & Connections
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Meet fellow students without the awkwardness. Everyone appears by
                  default; mutual secret-crush intents unlock only when mutual.
                </p>
              </div>

              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-400">
                  <span>Secret Crush Matcher</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    Max 5 Intents
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pick up to 5 campus crushes privately. Neither person is notified
                  unless you both pick each other.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Zero social friction</span>
              <Link
                href="#match"
                className="font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                How It Works <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>

          {/* Card 4: Messaging */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <MessageCircle className="size-5" />
                </span>
                <StatusPill status="healthy" label="Verified DMs" />
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Student Messaging
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Continue conversations privately with verified classmates. Zero
                  creepy message requests from unverified strangers.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-card p-2.5 border border-border/50">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Aayush Sharma</span>
                  <span className="text-muted-foreground text-[11px]">
                    &ldquo;Sent you the PYQ solutions PDF!&rdquo;
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-card p-2.5 border border-border/50">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-foreground">Priya V.</span>
                  <span className="text-muted-foreground text-[11px]">
                    &ldquo;Confirming the 4 PM Hackathon meet.&rdquo;
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Peer-to-peer security</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Encrypted
              </span>
            </div>
          </LandingCard>

          {/* Card 5: Campus Hub & Academic Vault */}
          <LandingCard className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <BookOpen className="size-5" />
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Campus Utilities
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Campus Hub & Academic Vault
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Peer PYQs, notes, exam formulas, hostel lost & found, and admin
                  circulars in a structured archive.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="rounded-xl border border-border/60 bg-card p-2.5">
                  <span className="font-bold text-foreground block">3,400+</span>
                  <span className="text-[11px] text-muted-foreground">Notes & PYQs</span>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-2.5">
                  <span className="font-bold text-foreground block">Lost & Found</span>
                  <span className="text-[11px] text-muted-foreground">Instant Alerts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">Curated by seniors</span>
              <Link
                href="/handler/sign-up"
                className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Access Vault <ArrowRight className="size-3" />
              </Link>
            </div>
          </LandingCard>

          {/* Card 6: Campus Marketplace */}
          <LandingCard className="flex flex-col justify-between space-y-6 lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <Store className="size-4" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Hostel Peer Economy
                  </span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Campus Marketplace & Student Commerce
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hand-to-hand gear exchanges inside your hostel. Trade bicycles,
                  coolers, textbooks, and lab drafters with zero shipping fees, zero
                  scammers, and zero middleman cuts.
                </p>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-card p-3.5 space-y-1">
                  <Tag className="size-4 text-emerald-500" />
                  <p className="text-xs font-bold text-foreground">Hostel Handover</p>
                  <p className="text-[11px] text-muted-foreground">
                    Inspect in person at hostel gates before paying
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-3.5 space-y-1">
                  <ShieldCheck className="size-4 text-blue-500" />
                  <p className="text-xs font-bold text-foreground">Verified Sellers</p>
                  <p className="text-[11px] text-muted-foreground">
                    Every merchant & student carries institutional verification
                  </p>
                </div>
              </div>
            </div>
          </LandingCard>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
