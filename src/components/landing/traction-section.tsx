import { ArrowUpRight, Milestone } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const ROADMAP = [
  {
    phase: "Phase 1 (Active)",
    status: "Live Pilot",
    title: "BIT Mesra Campus Density",
    desc: "Achieving deep network density at our pilot university — validating anonymous confessions, canteen polls, and student trade.",
    current: true,
  },
  {
    phase: "Phase 2",
    status: "Next",
    title: "Ranchi Regional Cluster",
    desc: "Expanding to technical & medical universities across Ranchi to enable inter-college sports, fests, and local student hubs.",
    current: false,
  },
  {
    phase: "Phase 3",
    status: "Upcoming",
    title: "All-India Expansion",
    desc: "Progressively opening hubs for student domains nationwide, prioritized by verified student waitlist requests.",
    current: false,
  },
];

export function TractionSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Honest Pilot Traction</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Built at BIT Mesra.
            <br />
            <span className="text-muted-foreground font-semibold">Growing campus by campus.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            We are building CampusLoop thoughtfully with students on the ground, focusing on authentic campus
            culture and retention before scaling nationwide.
          </p>
        </Reveal>

        {/* 3 Real Traction Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Reveal delay={0.05}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider">
                Pilot Density
              </span>
              <div className="font-heading text-4xl sm:text-5xl font-black text-foreground">&lt; 100</div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Verified students onboarded organically at BIT Mesra during our initial closed alpha.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-blue-500 tracking-wider">
                Inbound Demand
              </span>
              <div className="font-heading text-4xl sm:text-5xl font-black text-foreground">10+</div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                College email domains requesting dedicated campus hubs across India.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-3">
              <span className="text-xs font-mono font-bold uppercase text-emerald-500 tracking-wider">
                Pure Word-of-Mouth
              </span>
              <div className="font-heading text-4xl sm:text-5xl font-black text-foreground">₹0</div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Spent on paid marketing or influencer ads. Grown purely via campus hostel WhatsApp circles.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Expansion Roadmap */}
        <Reveal delay={0.2}>
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Milestone className="size-5 text-primary" />
              <h3 className="font-heading text-lg font-bold text-foreground">Phased Campus Rollout Plan</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {ROADMAP.map((item) => (
                <div
                  key={item.phase}
                  className={`rounded-2xl p-5 border space-y-2.5 ${
                    item.current ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{item.phase}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.current ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center sm:text-left">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span>Request your college hub for the next rollout phase</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
