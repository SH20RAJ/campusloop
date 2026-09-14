"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Cpu,
  Database,
  Globe2,
  GraduationCap,
  Layers,
  Lock,
  Network,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { CompanyNav } from "@/components/marketing/company-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { ElegantShape } from "@/components/ui/shape-landing-hero";

export function OverviewClient() {
  const architectureItems: BentoItem[] = [
    {
      id: "flywheel-density",
      title: "Campus Flywheel & Network Density",
      description:
        "Every batch and semester organically drives recursive adoption: verified confessions drive daily retention, academics drive exam-week utility, and marketplace drives graduation offboarding.",
      icon: <Network className="size-5 text-[#1D9BF0]" />,
      status: "Organic Flywheel",
      tags: ["High Retention", "Batch Virality", "Perpetual Cycle"],
      colSpan: 2,
    },
    {
      id: "market-size",
      title: "43.3M Higher-Ed Market",
      description:
        "India's higher education system is the world's 2nd largest with 43.3 million students across 55,000 institutions seeking a secure digital campus identity.",
      icon: <BarChart3 className="size-5 text-emerald-500" />,
      status: "Huge TAM",
      tags: ["AISHE Data", "1,350+ Hubs", "Pan-India"],
      colSpan: 1,
    },
    {
      id: "stack-edge",
      title: "Edge Compute & Serverless Postgres",
      description:
        "Powered by Next.js 16, Cloudflare Workers, Neon Serverless Postgres, and Qdrant Vector Engine with instant sub-50ms latency across India.",
      icon: <Server className="size-5 text-purple-500" />,
      status: "Sub-50ms Edge",
      tags: ["Cloudflare Workers", "Neon Postgres", "Qdrant Vector", "Drizzle ORM"],
      colSpan: 1,
    },
    {
      id: "privacy-sovereignty",
      title: "Zero Data Reselling & Student Privacy",
      description:
        "We never sell student behavioral profiles, browsing patterns, or confession logs to third-party ad brokers or data aggregators.",
      icon: <Lock className="size-5 text-amber-500" />,
      status: "Zero Ad Tech",
      tags: ["No Trackers", "Encrypted", "UGC Compliant"],
      colSpan: 2,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-clip">
      <MarketingHeader />
      <CompanyNav />

      <main className="flex-1">
        {/* Geometric Hero */}
        <section className="relative w-full overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-border/40">
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 bg-gradient-to-br from-[#1D9BF0]/15 via-indigo-600/10 to-transparent blur-3xl" />

          <ElegantShape
            delay={0.2}
            width={360}
            height={85}
            rotate={-10}
            y={12}
            gradient="from-[#1D9BF0]/25"
            className="left-[-4%] top-[25%]"
          />
          <ElegantShape
            delay={0.4}
            width={280}
            height={65}
            rotate={14}
            y={10}
            gradient="from-purple-500/20"
            className="right-[-3%] top-[45%]"
          />

          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[#1D9BF0] font-bold uppercase tracking-wider text-[11px]">
                Platform Whitepaper
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground font-mono text-[11px]">Strategic Thesis</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
              The Architecture of a{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1D9BF0] via-sky-400 to-indigo-500">
                Verified Campus Graph
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              How CampusLoop solves identity, retention, and community trust for higher education institutions
              throughout India.
            </p>
          </div>
        </section>

        {/* Core Metrics Banner */}
        <section className="py-12 border-b border-border/40 bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-foreground font-mono">43.3M+</div>
              <div className="text-xs text-muted-foreground">Higher-Ed Students</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-[#1D9BF0] font-mono">1,350+</div>
              <div className="text-xs text-muted-foreground">Indexed College Hubs</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-500 font-mono">100%</div>
              <div className="text-xs text-muted-foreground">Institutional Email Gating</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-purple-500 font-mono">&lt;50ms</div>
              <div className="text-xs text-muted-foreground">Edge Response Time</div>
            </div>
          </div>
        </section>

        {/* Problem vs. Verified Solution Comparison */}
        <section className="py-20 px-4 sm:px-6 bg-muted/10">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                Paradigm Shift
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Fragmented Channels vs. Verified Hub
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2.5 text-rose-500 font-bold">
                  <ShieldAlert className="size-5" />
                  <span className="text-base font-mono uppercase tracking-wider">Unverified Chaos</span>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Noisy WhatsApp groups exposing personal mobile numbers to hundreds of strangers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Anonymous Instagram pages turning toxic with unchecked cyberbullying and harassment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Outsiders, predators, and fake profiles dominating campus-area dating applications.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Exam notes and PYQs scattered across broken Google Drive folders that 404 during mid-sems.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-primary/40 bg-card/80 backdrop-blur-md p-6 sm:p-8 space-y-4 shadow-xl shadow-primary/5">
                <div className="flex items-center gap-2.5 text-[#1D9BF0] font-bold">
                  <ShieldCheck className="size-5" />
                  <span className="text-base font-mono uppercase tracking-wider">The CampusLoop Graph</span>
                </div>
                <ul className="space-y-3 text-sm text-foreground/90 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Access restricted strictly to .ac.in / .edu.in verified students. Zero outsiders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Accountable anonymity: dynamic handles with cryptographic identity escrow to prevent harassment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Campus Match with verified badges, dual-radius radius filters, and zero catfish.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>Academics Vault with permanent multi-file cloud storage organized by course and semester.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Flywheel Bento Grid */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/40">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                System Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Engineered for Infinite Campus Density
              </h2>
            </div>

            <BentoGrid items={architectureItems} />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
