import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Flame, Sparkles, MessageCircle, BarChart2, ShieldAlert } from "lucide-react";
import { hexclaveServerApp } from "@/hexclave/server";

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 lg:px-12 backdrop-blur-md bg-background/80 fixed w-full z-50 border-b border-border">
        <div className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-primary" /> CampusLoop
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/app/campus"
              className="rounded-lg bg-primary h-9 px-4 flex items-center text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
            >
              Go to Feeds
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-xs font-semibold hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary h-9 px-4 flex items-center text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
              >
                Join Loop
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 max-w-5xl mx-auto space-y-24">
        <div className="space-y-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary animate-pulse mx-auto">
            <Sparkles className="h-3.5 w-3.5" /> Live and spicy across Indian campuses
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Spill the tea. <br />
            Keep it anon. <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">No cap.</span>
          </h1>
          
          <p className="mx-auto max-w-[40rem] text-sm md:text-base text-muted-foreground leading-relaxed">
            CampusLoop is the ultimate gatekept social layer. Share wild confessions, drop spicy live polls, lock in campus matches, and keep up with campus gossip—100% verified for students.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-4">
            {user ? (
              <Link
                href="/app/campus"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all w-full sm:w-auto"
              >
                Go to Feeds
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all w-full sm:w-auto"
              >
                Verify with College Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full">
          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary border border-primary/10 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Gatekept & Verified</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Only whitelisted college emails allowed. No boomers, no bots. Strictly student vibes.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500 border border-blue-500/10 w-fit">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Spill Without Regret</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Got tea? Post confessions anonymously. Slurs and doxxing are auto-filtered, so the vibe check is always immaculate.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-orange-500/10 p-2.5 text-orange-500 border border-orange-500/10 w-fit">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Campus Crushes</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Swipe right on student cards in your college. If they swipe back, you match. Instant DM unlock, zero awkwardness.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Marketing Sections */}
        <div className="w-full space-y-20 border-t border-border pt-20">
          {/* Section 1: Discussion & Polls */}
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-4 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">immaculate vibes</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Drop spicy polls & ask dumb questions</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay updated with everything happening around your college. Launch dynamic, multi-option polls to check campus opinions, ask for academic cheat codes, or join confession threads. Everything stays localized to your college loop.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart2 className="h-4 w-4 text-primary" /> Live vote trackers
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-primary" /> Real-time comment threads
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                <span>📊 Poll of the day</span>
                <span className="font-semibold text-foreground">IIT Bombay</span>
              </div>
              <p className="text-sm font-semibold text-foreground text-left">Are you attending the college coding hackathon next week?</p>
              <div className="space-y-2">
                <div className="relative border border-border rounded-lg p-2.5 text-xs font-semibold text-foreground text-left overflow-hidden bg-muted/30">
                  <div className="absolute inset-0 bg-primary/10 w-[74%] h-full" />
                  <span className="relative z-10 flex justify-between"><span>Yes, team registered!</span><span>74%</span></span>
                </div>
                <div className="relative border border-border rounded-lg p-2.5 text-xs font-semibold text-foreground text-left overflow-hidden bg-muted/30">
                  <div className="absolute inset-0 bg-primary/10 w-[26%] h-full" />
                  <span className="relative z-10 flex justify-between"><span>No, just watching.</span><span>26%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Privacy & Verification */}
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="rounded-xl border border-border bg-card/50 p-6 space-y-4 order-last md:order-first">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-8 w-8 rounded bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 font-bold text-xs">
                  <ShieldAlert className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-foreground">Community Safeguards</p>
                  <p className="text-[10px] text-muted-foreground">Automatic telemetry & filter actions</p>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-xs border border-border p-2 rounded bg-muted/10">
                  <span className="text-muted-foreground">Slur & Profanity Filter</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs border border-border p-2 rounded bg-muted/10">
                  <span className="text-muted-foreground">Doxxed Phone/Email Detection</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center text-xs border border-border p-2 rounded bg-muted/10">
                  <span className="text-muted-foreground">Moderator Flags (5 = Hide)</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">safety is chief</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">No creepy profiles allowed</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CampusLoop is designed for students, by design. All posts are automatically scanned on creation to prevent doxxing, phone leaks, or harassment. Posts receiving 5 or more student flags are automatically hidden from the feed pending moderator resolution.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" /> Identity Masking
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Automated filters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="w-full rounded-2xl border border-border bg-card p-8 md:p-12 text-center space-y-6 shadow-sm">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Stop lurking, start posting</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Get in here. Verify with your college email and join the loop. Connect with classmates, share confessions, and find matches safely.
          </p>
          <div className="pt-2">
            {user ? (
              <Link
                href="/app/campus"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all w-full sm:w-auto"
              >
                Enter CampusLoop
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all w-full sm:w-auto"
              >
                Sign Up with Student Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 w-full text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CampusLoop. Built with pure Tailwind & Shadcn. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
