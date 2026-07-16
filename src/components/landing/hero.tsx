import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, BarChart3, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  isAuthenticated: boolean;
}

const pillars = [
  { icon: ShieldCheck, label: "Verified" },
  { icon: BarChart3, label: "Polls" },
  { icon: HeartHandshake, label: "Matches" },
];

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative flex flex-col items-center px-6 pt-36 pb-20 text-center lg:px-8">
      {/* Gradient orbs background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-[-10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-orange-400/5 blur-[100px]" />
      </div>

      {/* Pill */}
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" />
        Trusted by students across Indian campuses
      </div>

      {/* Headline */}
      <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        The verified social layer
        <br />
        for your campus.
      </h1>

      {/* Subtext */}
      <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
        CampusLoop is the trusted student-only network. Share confessions, drop
        live polls, swipe to meet people — all gatekept by your{" "}
        <span className="font-medium text-foreground">college email</span>.
        No bots. No boomers. Just real students.
      </p>

      {/* Pillars */}
      <div className="mt-6 flex items-center gap-5 text-xs text-muted-foreground">
        {pillars.map((p) => (
          <span
            key={p.label}
            className="flex items-center gap-1.5 font-medium"
          >
            <p.icon className="h-4 w-4 text-primary" />
            {p.label}
          </span>
        ))}
      </div>

      {/* CTA */}
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
    </section>
  );
}
