import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Flame, Sparkles, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 lg:px-12 backdrop-blur-md bg-background/80 fixed w-full z-50 border-b border-border">
        <div className="text-lg font-bold tracking-tight flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-primary" /> CampusLoop
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-xs font-semibold hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary h-9 px-4 flex items-center text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/95 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-32 pb-16 max-w-5xl mx-auto space-y-16">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary animate-pulse">
            <Sparkles className="h-3.5 w-3.5" /> Now Live for All Indian Colleges
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            The real social layer <br />
            for <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">college life.</span>
          </h1>
          
          <p className="mx-auto max-w-[40rem] text-sm md:text-base text-muted-foreground leading-relaxed">
            CampusLoop is a verified, student-only platform for your campus: share confessions, vote on live polls, discover students, and matchmaking — safely locked within your university.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row pt-4">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all w-full sm:w-auto"
            >
              Verify with College Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full">
          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary border border-primary/10 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Verified Network</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Only whitelisted college emails allowed. No spam, no outside noise. Strictly students.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500 border border-blue-500/10 w-fit">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Safe Anonymity</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Speak freely. Post confessions and join discussions anonymously with advanced slurs & safety filtering.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-left space-y-4 shadow-sm hover:border-border/80 transition-colors">
            <div className="rounded-lg bg-orange-500/10 p-2.5 text-orange-500 border border-orange-500/10 w-fit">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Campus Matches</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Swipe right on students in your college. When there is a mutual swipe, chat opens up instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 w-full text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CampusLoop. Built with pure Tailwind & Shadcn.
        </footer>
      </main>
    </div>
  );
}
