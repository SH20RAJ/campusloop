"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Layers,
  ExternalLink,
  BookOpen,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const SLIDES = [
  {
    title: "1. Executive Summary & Motive",
    headline: "CampusLoop — The Verified Social Network for College Campuses.",
    points: [
      "Fragmented Campus Life: Students currently use fragmented WhatsApp groups, Instagram pages, Discord servers, and confession accounts.",
      "The Solution: CampusLoop brings the entire campus social graph into one verified, student-only digital layer.",
      "Primary Moat: Network density per campus (>20% penetration per college beats 100k scattered global users)."
    ],
    icon: <Sparkles className="size-7 text-primary" />
  },
  {
    title: "2. The 5 Core Product Layers",
    headline: "Built specifically around student life & verified identity.",
    points: [
      "Verified Identity & Gatekeeping: .ac.in / .edu domain OTP verification & campus/global scope toggle.",
      "Social & Anonymous Layer: Feed, confessions, canteen polls, anonymous yapping, and Twitter-style reposts.",
      "Connection & Utility: Swipeable student matchmaking deck, Lost & Found bulletin, and sub-community hubs."
    ],
    icon: <Layers className="size-7 text-violet-500" />
  },
  {
    title: "3. Market Size & Opportunity",
    headline: "India's 43.3 Million College Student Market.",
    points: [
      "Total Addressable Market (TAM): 43.3M+ higher education students across 1,350+ indexed Indian colleges.",
      "Serviceable Addressable Market (SAM): 12.5M+ students in Tier-1/2 Engineering, Tech & Management universities.",
      "Viral Distribution: Referral loops (+20 LP) and class-sharing copywritings spark organic campus adoption."
    ],
    icon: <TrendingUp className="size-7 text-rose-500" />
  },
  {
    title: "4. Monetization & Unit Economics",
    headline: "Hyper-local revenue streams built on campus density.",
    points: [
      "Targeted Campus Advertising: High CTR brand activations for co-living, laptops, and student tech bootcamps.",
      "Event Ticketing: Commission fee on campus cultural fests, workshops, and student club passes.",
      "Commerce & Recruitment: Peer-to-peer textbook marketplace and verified student talent discovery for tech startups."
    ],
    icon: <DollarSign className="size-7 text-emerald-500" />
  }
];

export function PitchClient() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [dau, setDau] = useState(100000); // 100k
  const [arpu, setArpu] = useState(3.5); // $3.5

  const revenue = dau * arpu;
  const valuation = revenue * 8; // 8x multiple

  const formattedRevenue = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(revenue);
  const formattedValuation = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(valuation);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden pb-16">
      {/* Glow blur background */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-[450px] w-full max-w-4xl rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/80 px-4 sm:px-8 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="size-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-black tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/overview" className="hidden sm:inline-flex text-xs font-bold text-primary hover:underline">
            Platform Brief →
          </Link>
          <ThemeToggle />
          <Link href="/join">
            <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer">
              Launch App
            </button>
          </Link>
        </div>
      </header>

      {/* Main Pitch Content */}
      <main className="flex-1 w-full max-w-3xl px-4 sm:px-8 pt-24 mx-auto space-y-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/overview" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <BookOpen className="size-3.5" /> Read Full Strategic Brief
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Investor <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">Pitch Deck</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
            Explore CampusLoop's core thesis, campus network moats, business model, and interactive valuation calculator.
          </p>
        </div>

        {/* Banner Link to /overview */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Want to read our complete deep research &amp; product overview?
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              Explore market sizing breakdown, security architecture, 5 product layers, and FAQ.
            </p>
          </div>
          <Link href="/overview">
            <button className="rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer whitespace-nowrap">
              Explore /overview →
            </button>
          </Link>
        </div>

        {/* --- Interactive Slides Presentation --- */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xl shadow-black/[0.03] min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                {SLIDES[slideIdx].title}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                Slide {slideIdx + 1} of {SLIDES.length}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-muted/65 border border-border/40 flex items-center justify-center shrink-0 shadow-xs">
                {SLIDES[slideIdx].icon}
              </div>
              <div className="space-y-3.5 flex-1">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {SLIDES[slideIdx].headline}
                </h3>
                <ul className="space-y-2.5">
                  {SLIDES[slideIdx].points.map((pt, i) => (
                    <li key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex items-start gap-2.5 font-medium">
                      <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-6">
            <button
              onClick={() => setSlideIdx((prev) => Math.max(0, prev - 1))}
              disabled={slideIdx === 0}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="size-4" /> Previous Slide
            </button>

            <div className="flex items-center gap-1">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`size-2 rounded-full transition-all cursor-pointer ${
                    i === slideIdx ? "bg-primary w-5" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setSlideIdx((prev) => Math.min(SLIDES.length - 1, prev + 1))}
              disabled={slideIdx === SLIDES.length - 1}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-85 disabled:opacity-30 cursor-pointer"
            >
              Next Slide <ChevronRight className="size-4" />
            </button>
          </div>
        </section>

        {/* --- Interactive Valuation Calculator --- */}
        <section className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xl shadow-black/[0.03]">
          <div className="space-y-1">
            <h2 className="text-base font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-500" /> Interactive Valuation Calculator
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Adjust parameters below to see projected annual revenue and platform valuation.
            </p>
          </div>

          <div className="space-y-5">
            {/* DAU Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Target DAU (Daily Active Users)</span>
                <span className="text-foreground font-black">{new Intl.NumberFormat("en-IN").format(dau)} Users</span>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="10000"
                value={dau}
                onChange={(e) => setDau(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* ARPU Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Target ARPU (Annual Revenue Per User)</span>
                <span className="text-foreground font-black">${arpu.toFixed(2)} / Year</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={arpu}
                onChange={(e) => setArpu(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Calculation results */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projected Revenue</p>
                <p className="text-xl font-black text-foreground">{formattedRevenue}</p>
              </div>

              <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Projected Valuation</p>
                <p className="text-xl font-black text-primary">{formattedValuation}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Notion Structured Data Link Card ─── */}
        <section className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-orange-500/10 to-amber-500/10 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <BookOpen className="size-4" /> Live Notion Resource Database
              </span>
              <h3 className="text-base font-black text-foreground">
                CampusLoop Structured Notion Hub
              </h3>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed font-medium">
                View our live structured data, roadmap phases, market research, and continuous updates directly on Notion.
              </p>
            </div>

            <a
              href="https://app.notion.com/p/Campusloop-3c4cd0ed0c2580b88ac4f1c2ae54961b"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-xs font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/95 active:scale-95 cursor-pointer shrink-0"
            >
              <span>Explore Notion Docs</span>
              <ExternalLink className="size-4" />
            </a>
          </div>
        </section>

        {/* Call to action */}
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Interested in backing CampusLoop?</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">
              We are currently closing our Seed round to accelerate campus deployments across Tier-1 Indian engineering colleges.
            </p>
          </div>
          <Link href="/contact">
            <button className="rounded-2xl bg-primary h-10 px-6 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer">
              Contact Deal Partners
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
