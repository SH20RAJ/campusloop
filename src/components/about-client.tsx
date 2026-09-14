"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Heart,
  Lock,
  MessageSquare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { CompanyNav } from "@/components/marketing/company-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { SOCIAL_LINKS } from "@/constants/socials";
import { cn } from "@/lib/utils";

export function AboutClient() {
  const trustBentoItems: BentoItem[] = [
    {
      id: "trust-gating",
      title: "100% Institutional Gating",
      description:
        "Access to campus feeds, confessions, and dating decks is permanently restricted to verified college email domains (.ac.in and .edu.in). No commercial bots, recruiters, or internet lurkers.",
      icon: <ShieldCheck className="size-5 text-[#1D9BF0]" />,
      status: "Verified Only",
      tags: [".ac.in", ".edu.in", "Hexclave Auth"],
      colSpan: 1,
    },
    {
      id: "trust-escrow",
      title: "Accountable Anonymity",
      description:
        "Express yourself freely under dynamic pseudonym handles with cryptographic identity escrow. Freedom of speech is guaranteed, while harassment, doxxing, and ragging are mechanically deterred.",
      icon: <Lock className="size-5 text-purple-500" />,
      status: "Identity Escrow",
      tags: ["Confessions", "No Cyberbullying", "Safe Haven"],
      colSpan: 2,
      hasPersistentHover: true,
      contentNode: (
        <div className="rounded-xl border border-border/50 bg-background/80 p-3 space-y-1.5 text-xs">
          <div className="font-semibold text-foreground">Why previous anonymous boards failed:</div>
          <p className="text-muted-foreground leading-relaxed">
            Platforms like YikYak and anonymous Instagram pages became toxic because total anonymity without
            accountability attracts bad actors. CampusLoop provides the freedom of candid expression while protecting
            the physical campus community.
          </p>
        </div>
      ),
    },
    {
      id: "trust-radius",
      title: "Campus Radius & Global Toggles",
      description:
        "Switch seamlessly between your immediate hostel perimeter and national trending topics across all universities in India with one tap.",
      icon: <Users className="size-5 text-emerald-500" />,
      status: "Dual Radius",
      tags: ["Local Campus", "All India", "Zero Noise"],
      colSpan: 2,
    },
    {
      id: "trust-safety",
      title: "Anti-Ragging & UGC Compliance",
      description:
        "Full digital alignment with statutory UGC regulations. Proactive keyword filters, student-moderated queues, and instant 1-tap reporting.",
      icon: <ShieldAlert className="size-5 text-rose-500" />,
      status: "UGC Compliant",
      tags: ["Anti-Ragging", "Safe Campus", "Fast Review"],
      colSpan: 1,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-clip">
      <MarketingHeader />
      <CompanyNav />

      <main className="flex-1">
        {/* Geometric Hero */}
        <section className="relative w-full overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-border/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 bg-gradient-to-br from-[#1D9BF0]/15 via-purple-600/10 to-transparent blur-3xl" />

          <ElegantShape
            delay={0.2}
            width={380}
            height={90}
            rotate={12}
            y={15}
            gradient="from-[#1D9BF0]/25"
            className="left-[-5%] top-[20%]"
          />
          <ElegantShape
            delay={0.4}
            width={300}
            height={70}
            rotate={-15}
            y={10}
            gradient="from-emerald-500/20"
            className="right-[-4%] top-[50%]"
          />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[#1D9BF0] font-bold uppercase tracking-wider text-[11px]">
                Founded at BIT Mesra
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground font-mono text-[11px]">1,350+ Indexed Hubs</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
              Rebuilding the Campus Social Graph for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1D9BF0] via-sky-400 to-emerald-500">
                India’s College Students
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              Traditional social media is noisy, flooded with non-student lurkers, and built for advertisers.
              CampusLoop creates a trusted, verified sanctuary designed exclusively for university life.
            </p>
          </div>
        </section>

        {/* Origin & Thesis Narrative */}
        <section className="py-20 px-4 sm:px-6 bg-muted/10">
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="space-y-4 text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                Origins & Thesis
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Born in the Hostel Rooms of BIT Mesra
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md space-y-3">
                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <ShieldAlert className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">The Chaos of Modern Campus Channels</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  500+ unread WhatsApp pings burying critical exam schedules. Google Drive folders of exam notes that
                  suddenly 404 before end-sems. Dating apps overrun by catfishes and predatory non-students.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md space-y-3">
                <div className="size-10 rounded-xl bg-[#1D9BF0]/10 text-[#1D9BF0] flex items-center justify-center font-bold">
                  <Sparkles className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">The CampusLoop Solution</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A high-trust, verified digital campus. Anonymous confessions without cyberbullying, campus match
                  without outsiders, academic vaults with permanent multi-file storage, and direct peer-to-peer commerce.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Architecture Bento Grid */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/40">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                Trust Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Engineered for High-Trust Campus Interaction
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Balancing student freedom of expression with institutional safety and accountability.
              </p>
            </div>

            <BentoGrid items={trustBentoItems} />
          </div>
        </section>

        {/* Official Channels & Contact */}
        <section className="py-20 px-4 sm:px-6 bg-muted/20 border-t border-border/40">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Connect with the Founding Team
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CampusLoop is developed by students and alumni with relentless focus on privacy, high-density performance,
              and campus safety.
            </p>

            {/* Official Channels per Rule 10 */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/15 via-rose-500/15 to-amber-500/15 border border-rose-500/30 text-xs font-bold text-foreground hover:border-rose-500/60 transition-all hover:scale-105"
              >
                <span>Instagram @campusloop.space</span>
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
              </a>

              <a
                href={SOCIAL_LINKS.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 border border-border/60 text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                <span>LinkedIn /mycampusloop</span>
              </a>

              <a
                href={SOCIAL_LINKS.x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 border border-border/60 text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                <span>X @mycampusloop</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
