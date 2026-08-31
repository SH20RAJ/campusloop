"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Flame,
  Heart,
  HelpCircle,
  Layers,
  MessageSquare,
  School,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MarketingHeader } from "@/components/marketing/system";

const SECTIONS = [
  { id: "concept", label: "Core Motive", icon: Flame },

  { id: "layers", label: "Product Layers", icon: Layers },
  { id: "density", label: "Network Moat", icon: ShieldCheck },
  { id: "market", label: "Market Size", icon: TrendingUp },
  { id: "business", label: "Revenue Model", icon: DollarSign },
  { id: "faq", label: "Investor Q&A", icon: HelpCircle },
];

export function OverviewClient() {
  const [activeTab, setActiveTab] = useState("concept");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative overflow-x-hidden pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "CampusLoop Platform Overview & Strategic Brief",
            url: "https://campusloop.space/overview",
            description:
              "Deep research and strategic overview of CampusLoop verified campus network, product architecture, and market size.",
            publisher: {
              "@type": "Organization",
              name: "CampusLoop",
              url: "https://campusloop.space",
              logo: "https://campusloop.space/logo.png",
            },
          }),
        }}
      />
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[500px] w-full max-w-4xl rounded-full bg-linear-to-b from-primary/10 via-orange-500/5 to-transparent blur-3xl" />

      <MarketingHeader />

      {/* Hero Banner */}
      <main className="flex-1 w-full max-w-4xl px-4 sm:px-8 pt-24 mx-auto space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Home
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/pitch"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              View Slide Deck →
            </Link>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Platform Overview &amp;{" "}
            <span className="bg-linear-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Strategic Brief
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-medium leading-relaxed">
            The comprehensive guide to CampusLoop: our verified student graph, network density moat, product
            architecture, market size, and monetization engine.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b border-border/60">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-card"
                }`}
              >
                <Icon className="size-3.5" />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === "concept" && (
            <motion.div
              key="concept"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xl shadow-black/[0.02]">
                <div className="space-y-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold text-primary border border-primary/20">
                    CORE DEFINITION
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    What CampusLoop Actually Is
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium">
                    CampusLoop is not just another social app. It is the verified social layer for college
                    campuses — a private digital layer where students connect, communicate, discover
                    communities, and participate in campus life.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="size-4 text-primary" /> Consumer Positioning
                    </h4>
                    <p className="text-base font-extrabold text-primary">"Your campus, unfiltered."</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Safe, verified yapping, confessions, canteen polls, lost &amp; found, and peer
                      connections without corporate eyes.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="size-4 text-emerald-500" /> Investor Positioning
                    </h4>
                    <p className="text-sm font-bold text-foreground">
                      The verified social graph for higher education in India.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Building campus-by-campus network density across 1,350+ colleges, monetizing attention
                      and hyper-local transactions.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "layers" && (
            <motion.div
              key="layers"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground">The 5 Core Product Layers</h2>
                <p className="text-xs text-muted-foreground">
                  Every layer solves a specific fragmentation in student life.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "1. Verified Identity & Gatekeeping",
                    icon: ShieldCheck,
                    color: "text-blue-500",
                    points: [
                      "Institutional OTP & .ac.in / .edu verification",
                      "College-specific private network isolation",
                      "Campus & India-wide scope toggles",
                      "Strict outsider & recruiter blocking",
                    ],
                  },
                  {
                    title: "2. Social & Discussion Layer",
                    icon: MessageSquare,
                    color: "text-orange-500",
                    points: [
                      "Main feed (For You, Latest, Trending, Top Voted)",
                      "Confessions & anonymous discussions",
                      "Interactive voting polls & question tags",
                      "Twitter-style 1-tap & quoted reposts",
                    ],
                  },
                  {
                    title: "3. Connection & Matchmaking Layer",
                    icon: Heart,
                    color: "text-primary",
                    points: [
                      "💘 Secret Crush: Intent-hidden matchmaking with 5-slot vault",
                      "Swipe deck for verified student vibe matching",
                      "Gender & campus radius scope filters",
                      "Direct messaging (DMs) & automatic mutual reveal",
                    ],
                  },

                  {
                    title: "4. Campus Utility & Communities",
                    icon: School,
                    color: "text-emerald-500",
                    points: [
                      "Lost & Found bulletin board",
                      "Sub-hubs for clubs & interest groups",
                      "Hostel & canteen discussions",
                      "Campus event ticketing & listings",
                    ],
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`size-5 ${item.color}`} />
                        <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {item.points.map((pt, pIdx) => (
                          <li key={pIdx} className="text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "density" && (
            <motion.div
              key="density"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xl shadow-black/[0.02]"
            >
              <div className="space-y-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold text-emerald-500 border border-emerald-500/20">
                  STRATEGIC MOAT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  Campus Density &gt; Total User Count
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  The primary strategic insight of CampusLoop: the value is not in having 20 features, but in
                  opening the app and seeing hundreds of classmates from your own campus.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                    Weak Social Metric
                  </h4>
                  <p className="text-lg font-black text-foreground">5,000 Random Users</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scattered across 500 different colleges in India. Zero local network effect or daily
                    retention pull.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    CampusLoop Metric
                  </h4>
                  <p className="text-lg font-black text-foreground">5,000 Classmates in 1 Campus</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    25%+ campus penetration creates an unbreakable local moat. Extremely high daily engagement
                    &amp; viral word-of-mouth.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "market" && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 shadow-xl shadow-black/[0.02]"
            >
              <div className="space-y-2">
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-extrabold text-purple-500 border border-purple-500/20">
                  MARKET OPPORTUNITY
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  India Higher Education Market Sizing
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  India hosts the second largest higher education system in the world with over 43 Million
                  enrolled students across 1,350+ indexed universities &amp; colleges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">TAM</p>
                  <p className="text-2xl font-black text-foreground">43.3M+</p>
                  <p className="text-[11px] text-muted-foreground">Total Enrolled Indian College Students</p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">SAM</p>
                  <p className="text-2xl font-black text-primary">12.5M+</p>
                  <p className="text-[11px] text-muted-foreground">
                    Engineering, Tech &amp; Management Colleges
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-center space-y-1">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    Indexed Hubs
                  </p>
                  <p className="text-2xl font-black text-emerald-500">1,350+</p>
                  <p className="text-[11px] text-muted-foreground">Verified Indian University Campuses</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "business" && (
            <motion.div
              key="business"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground">Monetization Engine</h2>
                <p className="text-xs text-muted-foreground">
                  Multi-channel revenue stream built on top of campus network density.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Hyper-Local Brand Ads",
                    desc: "Brands (co-living, laptop brands, tech bootcamps) targeting specific colleges with high CTR verified placements.",
                  },
                  {
                    title: "Campus Fest & Event Ticketing",
                    desc: "Commission fee on cultural fest passes, club workshops, and student event registrations.",
                  },
                  {
                    title: "Student Commerce & Marketplace",
                    desc: "Peer-to-peer textbook sales, hostel electronics marketplace, and room subletting transactions.",
                  },
                  {
                    title: "Early Career Recruitment",
                    desc: "Verified student talent pool discovery for tech startups and corporate campus recruiters.",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card p-5 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground">{m.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{m.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-black text-foreground">Investor Q&amp;A Highlights</h2>
                <p className="text-xs text-muted-foreground">
                  Core answers to common strategic &amp; defensibility questions.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: "Why won't students just use WhatsApp groups?",
                    a: "WhatsApp is great for private chats, but it isn't a discoverable campus network. You can't open WhatsApp to discover campus confessions, polls, lost items, or match with new students across hostels.",
                  },
                  {
                    q: "Why won't Instagram copy you?",
                    a: "Instagram copies features, not campus density. A campus network requires institutional verification, local campus moderation, anonymous spaces, and college-scoped feeds.",
                  },
                  {
                    q: "How do you handle content moderation & anti-doxxing?",
                    a: "Automated real-time keyword filtering, PII scrubbing (phone numbers & email masking), student report queues, and LP karma penalties keep discussions clean and safe.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-border/60 bg-card p-5 space-y-2 shadow-sm"
                  >
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <HelpCircle className="size-4 text-primary shrink-0" />
                      {item.q}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium pl-6">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Notion Structured Data Footer Card ─── */}
        <section className="rounded-3xl border border-primary/30 bg-linear-to-r from-primary/10 via-orange-500/10 to-amber-500/10 p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <BookOpen className="size-4" /> Live Notion Resource Database
              </span>
              <h3 className="text-lg font-black text-foreground">
                CampusLoop Structured Notion Documentation
              </h3>
              <p className="text-xs text-muted-foreground max-w-lg leading-relaxed font-medium">
                Access our live structured data, roadmap phases, market research notes, and continuous updates
                on Notion.
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
      </main>
    </div>
  );
}
