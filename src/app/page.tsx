import { ArtifactsShowcase } from "@/components/landing/artifacts-demos";
import { CampusHubShowcase } from "@/components/landing/campus-hub-showcase";
import { ComparisonShowcase } from "@/components/landing/comparison-table";
import {
ConfessionDemo,
MatchDemo,
PointsDemo,
VerifyDemo,
} from "@/components/landing/demos";
import {
FAQSection,
SafetySection,
StatsSection
} from "@/components/landing/extra-sections";
import { HeroPreview } from "@/components/landing/hero-preview";
import { LeaderboardShowcase } from "@/components/landing/leaderboard-demo";
import { MatchmakingShowcase } from "@/components/landing/matchmaking-demo";
import { Reveal } from "@/components/landing/reveal";
import { TimeCapsuleShowcase } from "@/components/landing/time-capsule-showcase";
import { InteractiveBentoCard } from "@/components/landing/interactive-bento-card";
import {
CTABand,
GradientText,
MarketingFooter,
MarketingHeader,
} from "@/components/marketing/system";
import { buttonVariants } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { hexclaveServerApp } from "@/hexclave/server";
import { cn } from "@/lib/utils";
import {
ArrowRight,
Heart,
HeartHandshake,
Hourglass,
Lock,
MailCheck,
Repeat2,
School,
ShieldCheck,
ShoppingBag
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.space"),
  title: {
    default: "CampusLoop | Your Campus, Verified & Unfiltered",
    template: "%s | CampusLoop",
  },
  description:
    "CampusLoop is the verified student-only campus network for 1,350+ Indian colleges. Gatekept by college email address to share anonymous confessions, settle canteen polls, trade on student marketplace, match safely, and lock batch time capsules.",
  applicationName: "CampusLoop",
  authors: [{ name: "CampusLoop Team", url: "https://campusloop.space/about" }],
  generator: "Next.js",
  keywords: [
    "campus social network",
    "college confessions",
    "anonymous posting",
    "student verification",
    "college dating",
    "campus match",
    "Indian colleges",
    "campus marketplace",
    "time capsule",
    "BIT Mesra",
    "IIT confessions",
    "BITS confessions",
    "NIT Trichy",
  ],
  referrer: "origin-when-cross-origin",
  creator: "CampusLoop Inc.",
  publisher: "CampusLoop Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://campusloop.space",
    types: {
      "application/rss+xml": "https://campusloop.space/feed.xml",
    },
  },
  openGraph: {
    title: "CampusLoop | Your Campus, Verified & Unfiltered",
    description:
      "The verified student-only social network for Indian colleges. Confess anonymously, run campus polls, trade on student hub, match, and chat safely with classmates.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop — Your Campus, Verified & Unfiltered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Your Campus, Verified & Unfiltered",
    description:
      "The verified student-only social network for Indian colleges. Confess anonymously, run campus polls, match, and chat safely with classmates.",
    creator: "@campusloop",
    images: ["https://campusloop.space/og-image.png"],
  },
  verification: {
    google: "google-site-verification-id",
  },
  category: "social networking",
  classification: "Student Community Platform",
};

const COLLEGES = [
  "IIT Delhi",
  "IIT Bombay",
  "BITS Pilani",
  "NIT Trichy",
  "Delhi University",
  "VIT Vellore",
  "SRM Chennai",
  "BIT Mesra",
  "IIT Kharagpur",
  "Christ University",
  "SRCC",
  "RV College of Engineering",
  "DTU Delhi",
  "NSUT Delhi",
  "Manipal Academy",
  "IIIT Hyderabad",
  "Thapar University",
  "NIT Surathkal",
];

const STEPS = [
  {
    icon: MailCheck,
    title: "Verify your college email",
    body: "Sign up with your .ac.in or college address. One OTP proves your campus enrollment.",
  },
  {
    icon: School,
    title: "Enter your campus radius",
    body: "You land in an isolated campus hub where every single account cleared the same check.",
  },
  {
    icon: HeartHandshake,
    title: "Post, poll, trade & match",
    body: "Confess without a name, trade cycles, form gaming lobbies, match with peers, and bury memories.",
  },
];

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();
  const isAuthenticated = !!user;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "CampusLoop",
            applicationCategory: "SocialNetworking",
            operatingSystem: "Web",
            description:
              "Verified student-only campus social network. Share confessions, drop polls, trade on student hubs, and swipe to match across 1,350+ Indian colleges. Gatekept by college email.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          }),
        }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingHeader isAuthenticated={isAuthenticated} />

        {/* ─── Hero Section ─── */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-24 lg:pb-16">
          <div className="space-y-6">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-3.5" />
              Verified students only · 1,350+ Indian Colleges
            </p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Your campus,
              <br />
              <GradientText>
                <em>unfiltered.</em>
              </GradientText>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              The verified collegiate network for India. Canteen polls, anonymous confessions, campus marketplace, 18+ student matching, and batch time capsules — with zero recruiters, zero faculty, and zero outsiders.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
                >
                  Open app
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/handler/sign-up"
                  className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
                >
                  Get verified with college email
                  <ArrowRight className="size-4" />
                </Link>
              )}
              <Link
                href="#inside"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                See what&apos;s inside
              </Link>
            </div>

            {!isAuthenticated && (
              <p className="text-xs font-medium text-muted-foreground">
                JEE/NEET aspirant or prospective student?{" "}
                <Link
                  href="/handler/sign-up"
                  className="font-bold text-primary hover:underline"
                >
                  Browse in Viewer Mode
                </Link>{" "}
                with any email — read-only, no college ID required.
              </p>
            )}

            <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs font-semibold text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> College-email gated (.ac.in)
              </li>
              <li className="flex items-center gap-1.5">
                <School className="size-3.5 text-primary" /> 1,350+ colleges indexed
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" /> Salted HMAC sealed identity
              </li>
            </ul>
          </div>

          <HeroPreview />
        </section>

        {/* ─── College Marquee ─── */}
        <section className="overflow-hidden border-y border-border/60 py-8 bg-muted/5">
          <div className="pb-5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex flex-col sm:flex-row items-center justify-center gap-x-2.5 gap-y-1 px-6">
            <span>
              Colleges Enrolled:{" "}
              <strong className="text-primary font-extrabold text-sm tracking-normal">
                1,350+
              </strong>{" "}
              and adding more
            </span>
            <span className="hidden sm:inline-block text-muted-foreground/30">•</span>
            <span>
              Request your college hub by emailing{" "}
              <a
                href="mailto:mail@campusloop.space"
                className="text-primary hover:underline font-extrabold lowercase tracking-normal"
              >
                mail@campusloop.space
              </a>
            </span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
            <Marquee pauseOnHover className="[--duration:35s] [--gap:3rem]">
              {COLLEGES.map((name) => (
                <span
                  key={name}
                  className="whitespace-nowrap text-lg font-semibold text-muted-foreground/50 transition-colors hover:text-primary cursor-default px-4"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* ─── Bento: What Is Inside (Modern 6 Pillars) ─── */}
        <section id="inside" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
          <Reveal className="max-w-xl space-y-3 pb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything on campus, in one loop.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Built specifically for the realities of Indian college life — from midnight canteen Maggi debates to exam-night notes.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Dynamic Feed & Repost Chimes */}
            <Reveal className="lg:col-span-2">
              <InteractiveBentoCard
                className="bg-primary/[0.03] border-primary/25 hover:border-primary/60"
                glowColor="rgba(255, 90, 95, 0.22)"
              >
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <Repeat2 className="size-4" />
                    <span>Campus Feed &amp; Audio Celebrations</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Confess without a name, repost with a chime
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Spill confessions safely with automatic client-side PII scrubbing. Settle debates with live polls, vote on trending topics, and celebrate quotes with crystalline Web Audio chimes and emerald confetti bursts.
                  </p>
                  <ConfessionDemo />
                </div>
              </InteractiveBentoCard>
            </Reveal>

            {/* 2. Campus Match & Secret Crush Vault */}
            <Reveal delay={0.1}>
              <InteractiveBentoCard
                className="bg-rose-500/[0.03] border-rose-500/25 hover:border-rose-500/60"
                glowColor="rgba(244, 63, 94, 0.25)"
              >
                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
                    <Heart className="size-4" />
                    <span>Campus Match &amp; Crush</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Match inside the gate
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Swipe on real classmates who cleared the same college domain check. Plus, lock up to 5 campus crushes in our zero-doxxing vault where identity only reveals upon mutual lock!
                  </p>
                  <MatchDemo />
                </div>
              </InteractiveBentoCard>
            </Reveal>

            {/* 3. Campus Hubs & Marketplace */}
            <Reveal delay={0.05}>
              <InteractiveBentoCard
                className="bg-emerald-500/[0.03] border-emerald-500/25 hover:border-emerald-500/60"
                glowColor="rgba(16, 185, 129, 0.22)"
              >
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
                    <ShoppingBag className="size-4" />
                    <span>Student Services</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Campus Hub &amp; Marketplace
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Lost &amp; found registry, buy/sell cycles and coolers in ₹, station cab pools, flatmates finder, and 5v5 gaming scrims.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {["Cycles & Drafters", "Valorant 5v5", "Lost IDs", "Cab Pools"].map((chip) => (
                      <span key={chip} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-muted/60 text-foreground/80 border border-border/40 group-hover:border-emerald-500/40 transition-colors">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </InteractiveBentoCard>
            </Reveal>

            {/* 4. Campus Time Capsule (Unique!) */}
            <Reveal delay={0.1}>
              <InteractiveBentoCard
                className="bg-amber-500/[0.03] border-amber-500/25 hover:border-amber-500/60"
                glowColor="rgba(245, 158, 11, 0.25)"
              >
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                    <Hourglass className="size-4" />
                    <span>Unique Feature</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Batch Time Capsule Vault
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Bury predictions, letters, and memories for your future batch. Sealed cryptographically until Convocation Day with live countdown tickers.
                  </p>
                  <div className="rounded-xl bg-background/80 border border-border/40 p-2.5 text-xs text-center font-mono font-bold text-amber-500 shadow-inner group-hover:border-amber-500/40 transition-colors">
                    <span>Unlocks in 280d 14h 32m ⏳</span>
                  </div>
                </div>
              </InteractiveBentoCard>
            </Reveal>

            {/* 5. Loop Points & Clout */}
            <Reveal delay={0.15}>
              <InteractiveBentoCard
                className="bg-blue-500/[0.03] border-blue-500/25 hover:border-blue-500/60"
                glowColor="rgba(59, 130, 246, 0.25)"
              >
                <div className="space-y-3 p-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                    <ShieldCheck className="size-4" />
                    <span>Reputation System</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Loop Points Clout Tiers
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Campus reputation you can count. Earn Loop Points from upvotes and helpful notes to unlock Bronze Rookie, Gold Star, and the verified blue tick.
                  </p>
                  <div className="pt-2">
                    <PointsDemo />
                  </div>
                </div>
              </InteractiveBentoCard>
            </Reveal>
          </div>
        </section>

        {/* ─── Interactive Campus Hub Showcase (New!) ─── */}
        <CampusHubShowcase />

        {/* ─── Exclusive Feature: Campus Time Capsule (New!) ─── */}
        <TimeCapsuleShowcase />

        {/* ─── Secret Crush & Matchmaking Showcase ─── */}
        <MatchmakingShowcase />

        {/* ─── Polls & Questions Showcase ─── */}
        <ArtifactsShowcase />

        {/* ─── Leaderboard & Campus Clout ─── */}
        <LeaderboardShowcase />

        {/* ─── Stats & Numbers ─── */}
        <StatsSection />

        {/* ─── Comparison Showcase (CampusLoop vs Telegram/WhatsApp/Reddit) ─── */}
        <ComparisonShowcase />

        {/* ─── Safety & Privacy Escrow ─── */}
        <SafetySection />

        {/* ─── How It Works & Verification ─── */}
        <section className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Reveal className="max-w-xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                How verification works
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Getting in takes one college email.
              </h2>
            </Reveal>

            <div className="grid gap-10 pt-14 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div className="space-y-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="size-5" />
                    </span>
                    <h3 className="font-heading text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1} className="pt-14">
              <Card className="max-w-xl">
                <CardContent className="space-y-3">
                  <h3 className="font-heading text-lg font-semibold">
                    Check your college domain
                  </h3>
                  <VerifyDemo />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* ─── FAQs ─── */}
        <FAQSection />

        {/* ─── Final CTA Band ─── */}
        <CTABand
          title="Your college email is your key."
          lede="Free for verified students. Zero recruiters, zero faculty, zero outsiders. JEE/NEET aspirants can watch from the stands in Viewer Mode."
          primaryHref={isAuthenticated ? "/app" : "/handler/sign-up"}
          primaryLabel={isAuthenticated ? "Open app" : "Get verified now"}
          secondaryHref={isAuthenticated ? undefined : "/handler/sign-in"}
          secondaryLabel={isAuthenticated ? undefined : "Already verified? Sign in"}
        />

        <MarketingFooter />
      </div>
    </>
  );
}
