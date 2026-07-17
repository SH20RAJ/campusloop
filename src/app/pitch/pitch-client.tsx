"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp, DollarSign, Users, Award, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const SLIDES = [
  {
    title: "1. The Opportunity",
    headline: "Indian College Students lack a unified verified social network.",
    points: [
      "No anonymous sharing platforms: Traditional platforms like Reddit lack real student verification, causing local trust deficits.",
      "Outsider interference: Recruiting bots, spam, and administrators block students from yapping freely.",
      "Fragmented tools: Matchmaking, discussion groups, and confessions are scattered across loose WhatsApp/Instagram links."
    ],
    icon: <Users className="h-8 w-8 text-primary" />
  },
  {
    title: "2. The Solution",
    headline: "CampusLoop — The verified social layer for colleges.",
    points: [
      "Strict Domain Gatekeeping: Verified official college domains (.edu, .ac.in) keep out unwanted corporate eyes and spammers.",
      "Absolute Anonymity: Cryptographic separation hashes posts, securing absolute privacy for confessions and yaps.",
      "Gamified Vibe ranking: Loop Points (LP) boost user interactions via micro-incentives, stories, and tinder-swipes matches."
    ],
    icon: <Sparkles className="h-8 w-8 text-violet-500" />
  },
  {
    title: "3. Market Size (TAM/SAM)",
    headline: "Indian College Student Ecosystem is ripe for network adoption.",
    points: [
      "Total Addressable Market (TAM): 30 Million+ students currently enrolled in Indian higher education institutions.",
      "Serviceable Addressable Market (SAM): 8 Million+ students across top tier Engineering, Medical, and Humanities universities.",
      "Virality: Referral points loops (+20 LP) and class-sharing copywritings spark organic WhatsApp group promotions."
    ],
    icon: <TrendingUp className="h-8 w-8 text-rose-500" />
  },
  {
    title: "4. Monetization Model",
    headline: "Sustained hyper-local cashflows.",
    points: [
      "Hobby-Community ticketing: Commission on campus fests, study hacks workshops, and local event listings.",
      "Micro-Targeted Ads: Brands targeting regional college youth with high CTR placements based on college verification scopes.",
      "Gamification Boosters: Premium custom story stickers, anonymous tags customizations, and swipe boosts."
    ],
    icon: <DollarSign className="h-8 w-8 text-emerald-500" />
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
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-16">
      {/* Glow blur backgrounds */}
      <div className="absolute top-[-10%] left-[5%] right-[5%] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/join">
            <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Join CampusLoop
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl px-6 pt-28 mx-auto space-y-12">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Investor <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Pitch Deck</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
            Explore the core metrics, product pillars, business model, and valuation calculator of CampusLoop.
          </p>
        </div>

        {/* --- Slides Navigator --- */}
        <section className="glass-card rounded-2xl p-6 space-y-6 shadow-md min-h-[380px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {SLIDES[slideIdx].title}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground">
                Slide {slideIdx + 1} of {SLIDES.length}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted/65 border border-border/40 flex items-center justify-center shrink-0">
                {SLIDES[slideIdx].icon}
              </div>
              <div className="space-y-3.5">
                <h3 className="text-sm font-black text-foreground">
                  {SLIDES[slideIdx].headline}
                </h3>
                <ul className="space-y-2">
                  {SLIDES[slideIdx].points.map((pt, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-6">
            <button
              onClick={() => setSlideIdx(prev => Math.max(0, prev - 1))}
              disabled={slideIdx === 0}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Previous Slide
            </button>
            <button
              onClick={() => setSlideIdx(prev => Math.min(SLIDES.length - 1, prev + 1))}
              disabled={slideIdx === SLIDES.length - 1}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-85 disabled:opacity-30 cursor-pointer"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* --- Interactive Valuation Calculator --- */}
        <section className="glass-card rounded-2xl p-6 space-y-6 shadow-md">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Interactive Valuation Calculator
            </h2>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Adjust parameters below to see projected annual revenue and platform valuation.
            </p>
          </div>

          <div className="space-y-4">
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
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
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
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Calculations results block */}
            <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="bg-muted/15 border border-border/25 rounded-xl p-4 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projected Revenue</p>
                <p className="text-lg font-black text-foreground">{formattedRevenue}</p>
              </div>

              <div className="bg-muted/15 border border-border/25 rounded-xl p-4 text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Projected Valuation</p>
                <p className="text-lg font-black text-primary">{formattedValuation}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Interested in backing CampusLoop?</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We are currently closing our Seed round to accelerate campus deployments across Tier-1 Indian engineering colleges.
            </p>
          </div>
          <Link href="/contact">
            <button className="rounded-xl bg-primary h-9 px-6 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Contact Deal Partners
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
