import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  Mail,
  Compass,
  MessageCircle,
  Ban,
  EyeOff,
  Flag,
  GraduationCap,
} from "lucide-react";
import { hexclaveServerApp } from "@/hexclave/server";
import { Button } from "@/components/ui/button";
import { Particles } from "@/components/ui/particles";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedList, AnimatedListItem } from "@/components/ui/animated-list";

export const metadata: Metadata = {
  title: "CampusLoop — Your Verified Campus Social Network",
  description:
    "Join your real campus. Speak freely. Stay safe. CampusLoop is the trusted student-only network. Share anonymous confessions, drop live polls, swipe to match — all gatekept by your college email.",
  keywords: [
    "campus social network",
    "college confessions",
    "anonymous posting app",
    "student community India",
    "college dating",
    "campus polls",
    "verified student network",
    "Indian college students",
    "campus gossip",
    "college matchmaking",
  ],
  openGraph: {
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "The verified social layer for your campus. Confess. Poll. Match. All gatekept by college email.",
    url: "https://campusloop.in",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "The verified social layer for your campus. Confess. Poll. Match. All gatekept by college email.",
  },
  robots: { index: true, follow: true },
};

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
        {/* ─── Navbar ─── */}
        <header className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>CampusLoop</span>
          </Link>
          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/app/campus">
                <Button size="sm" className="gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  My Campus
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Join with College Email</Button>
                </Link>
              </>
            )}
          </nav>
        </header>

        <main className="flex-1">
          {/* ─── Hero ─── */}
          <section className="relative flex flex-col items-center px-6 pt-36 pb-20 text-center lg:px-8">
            <Particles
              className="absolute inset-0 -z-10"
              quantity={80}
              color="#c07a3c"
              size={0.5}
              staticity={30}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
              <div className="absolute top-[-10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
              <div className="absolute top-[20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-orange-400/5 blur-[100px]" />
            </div>

            <BlurFade delay={0}>
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                <AnimatedShinyText shimmerWidth={120}>
                  Trusted by students across Indian campuses
                </AnimatedShinyText>
              </div>
            </BlurFade>

            <BlurFade delay={0.15}>
              <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                The verified social layer
                <br />
                for your campus.
              </h1>
            </BlurFade>

            <BlurFade delay={0.3}>
              <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
                CampusLoop is the trusted student-only network. Share anonymous
                confessions, drop live polls, swipe to meet people — all
                gatekept by your{" "}
                <span className="font-medium text-foreground">
                  college email
                </span>
                . No bots. No randoms. Just real students.
              </p>
            </BlurFade>

            <BlurFade delay={0.45}>
              <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
                {[
                  { icon: ShieldCheck, label: "Verified" },
                  { icon: Zap, label: "Live polls" },
                  { icon: Sparkles, label: "Swipe & match" },
                ].map((p) => (
                  <span
                    key={p.label}
                    className="flex items-center gap-1.5 font-medium"
                  >
                    <p.icon className="h-4 w-4 text-primary" />
                    {p.label}
                  </span>
                ))}
              </div>
            </BlurFade>

            <BlurFade delay={0.55}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                {isAuthenticated ? (
                  <Link href="/app/campus">
                    <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                      Go to Feeds
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                      Verify with College Email
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </BlurFade>
          </section>

          {/* ─── Features (Magic Cards) ─── */}
          <section className="mx-auto max-w-6xl px-6 pb-20 pt-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Gatekept & Verified",
                  desc: "Only whitelisted college emails get in. No bots, no randoms — strictly verified students.",
                },
                {
                  icon: Lock,
                  title: "Anonymous Confessions",
                  desc: "Spill the tea without consequences. Hidden from students, accountable to safety.",
                },
                {
                  icon: Sparkles,
                  title: "Campus Crushes",
                  desc: "Swipe to discover students at your college. Mutual like? Instant DM unlock.",
                },
                {
                  icon: Zap,
                  title: "Live Polls",
                  desc: "Drop polls, ask questions, start debates. Real-time results in your campus loop.",
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <MagicCard
                    key={f.title}
                    mode="orb"
                    glowFrom="#c07a3c"
                    glowTo="#d4954a"
                    glowSize={300}
                    glowBlur={40}
                    glowOpacity={0.15}
                    className="rounded-xl p-5"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                    <BorderBeam
                      size={40}
                      duration={8}
                      colorFrom="#c07a3c"
                      colorTo="#d4954a"
                      borderWidth={1}
                    />
                  </MagicCard>
                );
              })}
            </div>
          </section>

          {/* ─── How It Works (Animated List) ─── */}
          <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
            <BlurFade>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How it works
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Three steps to join your campus loop.
                </p>
              </div>
            </BlurFade>

            <AnimatedList delay={2000}>
              {[
                {
                  icon: Mail,
                  step: "01",
                  title: "Verify with your college email",
                  desc: "Sign up using your .ac.in or institution email. We auto-detect your college and place you in your campus community.",
                },
                {
                  icon: Compass,
                  step: "02",
                  title: "Explore your campus feed",
                  desc: "See posts, confessions, and polls from students at your college. Upvote, comment, or post anonymously.",
                },
                {
                  icon: MessageCircle,
                  step: "03",
                  title: "Connect beyond the feed",
                  desc: "Join communities, swipe to match, or DM after a mutual like. Your campus world in one place.",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <AnimatedListItem key={s.step}>
                    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                          Step {s.step}
                        </span>
                        <h3 className="text-sm font-semibold text-foreground">
                          {s.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          </section>

          {/* ─── Stats (Number Ticker) ─── */}
          <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
            <BlurFade>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
                {[
                  { value: 500, suffix: "+", label: "Colleges onboarded" },
                  { value: 50000, suffix: "+", label: "Verified students" },
                  {
                    value: 100000,
                    suffix: "+",
                    label: "Posts & confessions",
                  },
                  { value: 10000, suffix: "+", label: "Matches made" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center justify-center bg-card px-4 py-8 text-center"
                  >
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      <NumberTicker value={s.value} />
                      {s.suffix}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </BlurFade>
          </section>

          {/* ─── Safety Section (Magic Cards) ─── */}
          <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
            <div className="grid gap-8 items-center md:grid-cols-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Built-in safety
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  Anonymous to students.
                  <br />
                  Accountable to safety.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Every post is scanned on creation to block phone numbers,
                  emails, slurs, and harassment. Your identity stays hidden from
                  other students but is privately stored for moderation.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { icon: Ban, label: "Slur & Profanity Filter" },
                  { icon: EyeOff, label: "Doxxing Prevention" },
                  { icon: Flag, label: "5 Reports = Auto-Hide" },
                  { icon: ShieldCheck, label: "Moderator Review" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <MagicCard
                      key={s.label}
                      mode="orb"
                      glowFrom="#c07a3c"
                      glowTo="#d4954a"
                      glowSize={200}
                      glowBlur={30}
                      glowOpacity={0.1}
                      className="rounded-lg px-4 py-3"
                    >
                      <div className="relative z-40 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground">
                          <Icon className="h-4 w-4 text-primary" />
                          {s.label}
                        </span>
                        <span className="text-xs font-semibold text-emerald-500">
                          Active
                        </span>
                      </div>
                    </MagicCard>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── CTA ─── */}
          <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
            <BlurFade>
              <div className="relative overflow-hidden rounded-xl border border-border bg-card px-8 py-12 text-center shadow-sm md:px-16 md:py-16">
                <BorderBeam
                  size={120}
                  duration={10}
                  colorFrom="#c07a3c"
                  colorTo="#d4954a"
                />
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Stop lurking, start posting.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  Verify with your college email and join the loop. Connect with
                  classmates, share confessions, and find your people — all in a
                  space built for students, by design.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  {isAuthenticated ? (
                    <Link href="/app/campus">
                      <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                        <GraduationCap className="h-4 w-4" />
                        Enter My Campus
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button size="lg" className="h-11 gap-2 px-6 text-sm">
                          Sign Up with Student Email
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button
                          variant="outline"
                          size="lg"
                          className="h-11 px-6 text-sm"
                        >
                          I already have an account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </BlurFade>
          </section>
        </main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>CampusLoop</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  The verified social layer for college life. Built for
                  students, by design.
                </p>
              </div>
              {[
                {
                  label: "Product",
                  items: [
                    { href: "/sign-up", label: "Sign Up" },
                    { href: "/sign-in", label: "Sign In" },
                  ],
                },
                {
                  label: "Safety",
                  items: [
                    { href: "#", label: "Community Guidelines" },
                    { href: "#", label: "Privacy" },
                  ],
                },
                {
                  label: "Company",
                  items: [
                    { href: "#", label: "About" },
                    { href: "#", label: "Contact" },
                  ],
                },
              ].map((g) => (
                <div key={g.label}>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {g.label}
                  </span>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 border-t border-border pt-6 text-center text-[11px] text-muted-foreground">
              &copy; {new Date().getFullYear()} CampusLoop. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
