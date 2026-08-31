"use client";

import {
  Ban,
  BookOpen,
  BriefcaseBusiness,
  ExternalLink,
  EyeOff,
  Flame,
  Heart,
  HeartHandshake,
  Layers,
  Megaphone,
  MessagesSquare,
  ShieldCheck,
  ShoppingBag,
  Split,
  Store,
  Ticket,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/landing/reveal";
import {
  CTABand,
  GradientText,
  MarketingFooter,
  MarketingHeader,
  Section,
  SectionHeading,
  StatCard,
} from "@/components/marketing/system";

const PAIN_POINTS = [
  {
    icon: Split,
    title: "Fragmented by default",
    body: "Campus life is scattered across 15 WhatsApp groups, unofficial Instagram pages, dead Discord servers, and anonymous confession accounts nobody moderates.",
  },
  {
    icon: Ban,
    title: "No identity guarantee",
    body: "Every existing channel is open to recruiters, bots, seniors' side-hustles, and catfish. Students self-censor because they can't know who's reading.",
  },
  {
    icon: EyeOff,
    title: "Anonymity without safety",
    body: "Confession pages run on DMs to an anonymous admin. Zero accountability, zero moderation, and no way to act on harassment or doxxing.",
  },
  {
    icon: Flame,
    title: "Attention leaks off campus",
    body: "The most engaged demographic in India spends hours daily on platforms that know nothing about their campus — and monetize none of its context.",
  },
];

const PRODUCT_LAYERS = [
  {
    icon: ShieldCheck,
    title: "Identity & Gatekeeping",
    body: "OTP verification on .ac.in/.edu domains. Every account on campus cleared the same check — outsiders read-only at best.",
    color: "text-primary",
  },
  {
    icon: MessagesSquare,
    title: "Social & Anonymous Feeds",
    body: "Campus + national feeds: confessions with sealed identity escrow, canteen polls, questions, reposts, and 24h stories.",
    color: "text-blue-500",
  },
  {
    icon: HeartHandshake,
    title: "Connection & Matching",
    body: "A swipe deck where every profile is a verified student. No catfish by construction.",
    color: "text-pink-500",
  },
  {
    icon: Store,
    title: "Utility Sub-Hubs",
    body: "Buy/sell, lost & found, roommates, ride-share, events — hyper-local classifieds that only work with campus density.",
    color: "text-emerald-500",
  },
  {
    icon: Trophy,
    title: "Clout & Gamification",
    body: "Loop Points reward posting, inviting, and helping. Referral loops (+20 LP) make every user a distribution channel.",
    color: "text-amber-500",
  },
];

const REVENUE_STREAMS = [
  {
    icon: Megaphone,
    title: "Campus-targeted brand activations",
    body: "Co-living, laptops, bootcamps, D2C brands — advertisers pay premium CPMs for a verified, geo-dense 18–24 audience.",
  },
  {
    icon: Ticket,
    title: "Event ticketing",
    body: "Commission on fests, workshops, and club passes sold where the audience already lives.",
  },
  {
    icon: ShoppingBag,
    title: "Peer-to-peer commerce",
    body: "Take-rate on textbooks, cycles, and hostel essentials traded inside the trust boundary of a campus.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Verified talent discovery",
    body: "Startups pay to reach provably-real students by college, branch, and skill — recruiting without the spam.",
  },
];

const ROADMAP = [
  {
    phase: "Now",
    title: "Product live at campusloop.space",
    body: "Feeds, confessions with identity escrow, polls, stories, matching, chat, communities, moderation console, and Campus Preview — read-only access that lets JEE/NEET aspirants follow their dream campuses years before admission, then upgrades the same account in place once their college email verifies. Deployed on Cloudflare's edge.",
  },
  {
    phase: "Next 2 quarters",
    title: "Density playbook in Tier-1 engineering",
    body: "Ambassador-led launches targeting >20% penetration per campus across the first 25 colleges, compounding through referral loops.",
  },
  {
    phase: "12–18 months",
    title: "Monetization switch-on",
    body: "Brand activations and event ticketing in dense campuses first; marketplace take-rate follows liquidity.",
  },
];

export function PitchClient() {
  const [dau, setDau] = useState(100000);
  const [arpu, setArpu] = useState(3.5);

  const revenue = dau * arpu;
  const valuation = revenue * 8;

  const fmtUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      n
    );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "PresentationDigitalDocument",
            name: "CampusLoop Investor Pitch Deck",
            url: "https://campusloop.space/pitch",
            description:
              "CampusLoop investor presentation: market sizing, network density moats, product layers, business model, and interactive valuation calculator.",
            publisher: {
              "@type": "Organization",
              name: "CampusLoop",
              url: "https://campusloop.space",
              logo: "https://campusloop.space/logo.png",
            },
          }),
        }}
      />

      <MarketingHeader />

      {/* ── Hero ── */}
      <Section className="pt-36 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-3xl space-y-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <TrendingUp className="size-3.5" /> Investor pitch · Seed
          </p>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            The verified social graph for <GradientText>43 million</GradientText> Indian students.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            CampusLoop pulls every college's fragmented social life into one student-only network, gated by
            the one credential no outsider has: a college email. Density per campus is the product — and the
            moat.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95"
            >
              Talk to us
            </Link>
            <Link
              href="/overview"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border px-6 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              <BookOpen className="size-4" /> Read the full brief
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Problem ── */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="The problem"
          title="Campus life happens everywhere except one place."
          lede="India's most engaged demographic coordinates its entire social life through tools that were never built for a campus — and it shows."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {PAIN_POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <p.icon className="size-4.5" />
                </span>
                <h3 className="mt-3 text-base font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Insight ── */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            className="pb-0"
            eyebrow="The insight"
            title={
              <>
                Verification isn&apos;t a feature. <GradientText>It&apos;s the product.</GradientText>
              </>
            }
            lede="One OTP on a college domain does what no moderation team can: it makes every account on the network a provably-real student. That single guarantee unlocks honest confessions, safe matching, trusted commerce — and an audience advertisers can't buy anywhere else."
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              value="1,350+"
              label="Colleges indexed"
              sub="Every hub pre-built and SEO-indexed before launch"
            />
            <StatCard
              value=">20%"
              label="Target campus penetration"
              sub="Density per college beats scattered global users"
            />
            <StatCard
              value="+20 LP"
              label="Referral incentive"
              sub="Every student is a distribution channel"
            />
            <StatCard
              value="0"
              label="Outsiders with write access"
              sub="Recruiters and bots are read-only at best"
            />
          </div>
        </div>
      </Section>

      {/* ── Product ── */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="The product"
          title="Five layers, one loop."
          lede="Live today at campusloop.space — not a deck, a deployed product."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_LAYERS.map((layer, i) => (
            <Reveal key={layer.title} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <layer.icon className={`size-4.5 ${layer.color}`} />
                </span>
                <h3 className="mt-3 text-base font-semibold">{layer.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{layer.body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.25}>
            <div className="flex h-full flex-col justify-center rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <Layers className="size-5 text-primary" />
              <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground">
                Each layer compounds the others: identity makes matching safe, matching drives feeds, feeds
                drive utility, utility drives clout — and clout recruits the next campus.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── Feature Highlight: Secret Crush & Multipurpose Match Mode ── */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-br from-primary/10 via-primary/5 to-card p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/25">
                  ✨ Flagship Feature · Match Mode
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="size-3" /> Safe &amp; Verified
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Multipurpose Campus Match &amp; Secret Crush
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Unlike shallow dating apps, Campus Match is designed as a versatile, comfortable connection space for verified college students — softly bridging romance, friendship, and peer collaborations without public pressure or awkwardness.
              </p>

              {/* Multipurpose Usage Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-foreground">🎓 Campus Friends</p>
                  <p className="text-[11px] text-muted-foreground">
                    Batchmates, hostel buddies &amp; seniors.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-primary">💘 Soft Dating</p>
                  <p className="text-[11px] text-muted-foreground">
                    Zero-embarrassment natural campus vibes.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-foreground">🤝 Peer Connects</p>
                  <p className="text-[11px] text-muted-foreground">
                    Study groups, lab &amp; project partners.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-foreground">☕ Talk &amp; Chai</p>
                  <p className="text-[11px] text-muted-foreground">
                    Canteen banter &amp; evening conversations.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-foreground">🚀 Co-Founders</p>
                  <p className="text-[11px] text-muted-foreground">
                    Hackathons, builders &amp; creative minds.
                  </p>
                </div>
                <div className="rounded-2xl bg-card/80 p-3 border border-border/40 space-y-1">
                  <p className="text-xs font-black text-foreground">🔒 Intent-Hidden</p>
                  <p className="text-[11px] text-muted-foreground">
                    Mutual reveal only when both students match.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-md max-w-sm w-full space-y-3 text-center self-center lg:self-start">
              <div className="size-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto border border-primary/20">
                <Heart className="size-6 fill-primary text-primary" />
              </div>
              <p className="text-xs font-black text-foreground">Rahul ➔ Secret Crush ➔ Priya</p>
              <p className="text-[11px] text-muted-foreground">
                Priya sees nothing. Later, Priya secretly adds Rahul...
              </p>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="size-3.5" /> Mutual Match! Direct Chat Unlocked
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Market ── */}
      <Section>
        <SectionHeading
          eyebrow="The market"
          title="A 43M-student wedge into young India."
          lede="Higher education is the densest, most identifiable segment of India's youth internet — and it graduates into every other market."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            value="43.3M"
            label="TAM — students in Indian higher ed"
            sub="Across 1,350+ indexed colleges"
          />
          <StatCard
            value="12.5M"
            label="SAM — Tier-1/2 engineering, tech & management"
            sub="English-first, smartphone-native, hostel-dense"
          />
          <StatCard
            value="25 campuses"
            label="SOM — first density beachhead"
            sub="Ambassador-led launches at >20% penetration each"
          />
        </div>
      </Section>

      {/* ── Business model ── */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Business model"
          title="Density monetizes four ways."
          lede="Every stream needs campus density first — which is why the moat and the revenue plan are the same plan."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {REVENUE_STREAMS.map((r, i) => (
            <Reveal key={r.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <r.icon className="size-4.5" />
                </span>
                <h3 className="mt-3 text-base font-semibold">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Valuation calculator ── */}
      <Section>
        <SectionHeading
          eyebrow="Run the numbers"
          title="Interactive valuation model."
          lede="Drag the sliders — projected annual revenue and an 8× revenue-multiple valuation update live."
        />
        <div className="max-w-2xl space-y-6 rounded-3xl border border-border/70 bg-card p-6 shadow-xs sm:p-8">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Daily Active Users</span>
              <span className="font-black text-foreground">
                {new Intl.NumberFormat("en-IN").format(dau)} users
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={dau}
              onChange={(e) => setDau(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">ARPU (annual revenue per user)</span>
              <span className="font-black text-foreground">${arpu.toFixed(2)} / year</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={arpu}
              onChange={(e) => setArpu(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
            <div className="space-y-1 rounded-2xl border border-border/40 bg-muted/20 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Projected revenue
              </p>
              <p className="text-xl font-black text-foreground">{fmtUsd(revenue)}</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-border/40 bg-muted/20 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Projected valuation (8×)
              </p>
              <p className="text-xl font-black text-primary">{fmtUsd(valuation)}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Roadmap ── */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="Traction & roadmap"
          title="Shipped first. Raising second."
          lede="The platform is live, indexed, and onboarding students today."
        />
        <ol className="relative space-y-8 border-l border-border/70 pl-6">
          {ROADMAP.map((step) => (
            <li key={step.phase} className="relative">
              <span className="absolute -left-[1.85rem] top-1 size-3 rounded-full border-2 border-background bg-primary" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{step.phase}</p>
              <h3 className="mt-0.5 text-base font-semibold">{step.title}</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Notion resource card */}
        <div className="mt-12 flex flex-col justify-between gap-4 rounded-3xl border border-primary/30 bg-linear-to-r from-primary/10 via-orange-500/10 to-amber-500/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <BookOpen className="size-4" /> Live resource database
            </span>
            <h3 className="text-base font-black text-foreground">CampusLoop Notion Hub</h3>
            <p className="max-w-md text-xs font-medium leading-relaxed text-muted-foreground">
              Roadmap phases, market research, and continuous updates — structured and live on Notion.
            </p>
          </div>
          <a
            href="https://app.notion.com/p/Campusloop-3c4cd0ed0c2580b88ac4f1c2ae54961b"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/95 active:scale-95"
          >
            Explore the docs <ExternalLink className="size-4" />
          </a>
        </div>
      </Section>

      <CTABand
        title={
          <>
            Back the <GradientText>verified campus graph.</GradientText>
          </>
        }
        lede="We're closing our Seed round to run the density playbook across Tier-1 Indian engineering campuses."
        primaryHref="/contact"
        primaryLabel="Contact deal partners"
        secondaryHref="/overview"
        secondaryLabel="Read the strategic brief"
      />

      <MarketingFooter />
    </div>
  );
}
