import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  MailCheck,
  School,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { hexclaveServerApp } from "@/hexclave/server";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";
import { HeroPreview } from "@/components/landing/hero-preview";
import { Marquee } from "@/components/ui/marquee";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import {
  ConfessionDemo,
  MatchDemo,
  PointsDemo,
  VerifyDemo,
} from "@/components/landing/demos";
import { MatchmakingShowcase } from "@/components/landing/matchmaking-demo";
import { LeaderboardShowcase } from "@/components/landing/leaderboard-demo";
import { ComparisonShowcase } from "@/components/landing/comparison-table";
import { AmbassadorShowcase } from "@/components/landing/ambassador-demo";
import { ArtifactsShowcase } from "@/components/landing/artifacts-demos";
import { StatsSection, IntegrationsSection, SafetySection, TestimonialsSection, FAQSection, HowItWorksSection } from "@/components/landing/extra-sections";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.space"),
  title: {
    default: "CampusLoop | Your Campus, Verified & Unfiltered",
    template: "%s | CampusLoop"
  },
  description:
    "CampusLoop is the verified student-only social network for Indian colleges. Sign up with your college email address to share anonymous confessions, settle canteen debates, swipe to match, and chat with classmates safely.",
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
    "engineering college confessions",
    "medical college network",
    "college matchmaking",
    "student discussion forum",
    "IIT confessions",
    "BITS confessions",
    "NIT confessions"
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
      "The verified student-only social network for Indian colleges. Confess anonymously, run campus polls, match, and chat safely with classmates.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "CampusLoop: Your Campus, Verified",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Your Campus, Verified & Unfiltered",
    description:
      "The verified student-only social network for Indian colleges. Confess anonymously, run campus polls, match, and chat safely with classmates.",
    creator: "@campusloop",
    images: ["/logo.png"],
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
  "RV College",
];

const STEPS = [
  {
    icon: MailCheck,
    title: "Verify your email",
    body: "Sign up with your college address. One OTP proves the domain is yours.",
  },
  {
    icon: School,
    title: "Enter your campus",
    body: "You land in a loop where every single account cleared the same check.",
  },
  {
    icon: HeartHandshake,
    title: "Post, poll, match",
    body: "Confess without a name, settle canteen debates, and meet people worth meeting.",
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
              "Verified student-only campus social network. Share confessions, drop polls, swipe to match across Indian colleges. Gatekept by college email.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          }),
        }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Nav */}
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg border border-border bg-black">
                <img
                  src="/logo.png"
                  alt="CampusLoop logo"
                  className="size-full scale-110 object-cover"
                />
              </span>
              <span className="text-base font-bold tracking-tight">
                CampusLoop
              </span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="/pitch" className="transition-colors hover:text-foreground">
                Pitch
              </Link>
              <Link href="/safety" className="transition-colors hover:text-foreground">
                Safety
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <Link href="/app" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
                  Open app
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/join?mode=signin"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/join?mode=signup"
                    className={buttonVariants({ size: "sm" })}
                  >
                    Get verified
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-24 lg:pb-16">
          <div className="space-y-6">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <ShieldCheck className="size-3.5" />
              Verified students only
            </p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Your campus,
              <br />
              <em>unfiltered.</em>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Verify your college email and unlock anonymous confessions,
              campus polls, matching, and chat with real students.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
                  Open app
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/join?mode=signup"
                  className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
                >
                  Get verified
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
          </div>

          <HeroPreview />
        </section>

        {/* College marquee */}
        <section className="overflow-hidden border-y border-border/60 py-8 bg-muted/5">
          <div className="pb-5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex flex-col sm:flex-row items-center justify-center gap-x-2.5 gap-y-1 px-6">
            <span>Colleges Enrolled: <strong className="text-primary font-extrabold text-sm tracking-normal">1,350+</strong> and adding more</span>
            <span className="hidden sm:inline-block text-muted-foreground/30">•</span>
            <span>Request your college by emailing <a href="mailto:mail@campusloop.space" className="text-primary hover:underline font-extrabold lowercase tracking-normal">mail@campusloop.space</a></span>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
            <Marquee pauseOnHover className="[--duration:30s] [--gap:3rem]">
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

        {/* Bento: what is inside */}
        <section id="inside" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
          <Reveal className="max-w-xl space-y-3 pb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything on campus, in one loop.
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Four ways to be loud without being known. Every widget below
              works, so go ahead and touch things.
            </p>
          </Reveal>

          <div className="grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card className="h-full bg-primary/[0.05] ring-primary/15">
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-semibold">
                      Confess without a name
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      Spill what you cannot say out loud. The filter strips
                      phone numbers and emails before your post ever saves, and
                      your identity never leaves the hash.
                    </p>
                  </div>
                  <ConfessionDemo />
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="h-full bg-primary text-primary-foreground ring-primary">
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-semibold">
                      Match inside the gate
                    </h3>
                    <p className="text-sm leading-relaxed text-primary-foreground/80">
                      Everyone here cleared the same email check. Swipe on real
                      students, never on catfish.
                    </p>
                  </div>
                  <MatchDemo />
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.05} className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-semibold">
                      Loop Points reward the loud
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                      Campus reputation you can actually count. Earn it, rank
                      up, lose it if you get reported.
                    </p>
                  </div>
                  <PointsDemo />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <MatchmakingShowcase />

        <ArtifactsShowcase />

        <LeaderboardShowcase />

        <StatsSection />

        <ComparisonShowcase />

        <IntegrationsSection />

        <AmbassadorShowcase />

        <SafetySection />

        <HowItWorksSection />

        {/* Verification */}
        <section className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Reveal className="max-w-xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                How verification works
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Getting in takes one email.
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
                    Check your domain
                  </h3>
                  <VerifyDemo />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <TestimonialsSection />

        <FAQSection />

        {/* Final CTA */}
        <section className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-6 py-28 text-center">
            <Reveal className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
                Your email is the ticket.
              </h2>
              <p className="mx-auto max-w-md text-base text-muted-foreground md:text-lg">
                Free for verified students. No outsiders, ever.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {isAuthenticated ? (
                  <Link href="/app" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
                    Open app
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Link
                    href="/join?mode=signup"
                    className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
                  >
                    Get verified
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    href="/join?mode=signin"
                    className={buttonVariants({ variant: "ghost", size: "lg" })}
                  >
                    Already verified? Sign in
                  </Link>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/60">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center overflow-hidden rounded-md border border-border bg-black">
                <img
                  src="/logo.png"
                  alt="CampusLoop logo"
                  className="size-full scale-110 object-cover"
                />
              </span>
              <span className="text-sm font-bold tracking-tight">
                CampusLoop
              </span>
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
              <Link href="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
              <Link href="/pitch" className="transition-colors hover:text-foreground">
                Pitch
              </Link>
              <Link href="/safety" className="transition-colors hover:text-foreground">
                Safety
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>
          <div className="border-t border-border/60">
            <p className="mx-auto w-full max-w-6xl px-6 py-5 text-xs text-muted-foreground">
              © {new Date().getFullYear()} CampusLoop. Built for students,
              gated by a college email.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
