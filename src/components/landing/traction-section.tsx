import { ArrowUpRight, Milestone } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const ROADMAP = [
  {
    phase: "PHASE 01 (ACTIVE)",
    status: "Live Pilot",
    title: "BIT Mesra Campus Density",
    desc: "Validating deep student retention at our pilot university — anonymous confessions, canteen polls, and campus peer trade.",
    current: true,
  },
  {
    phase: "PHASE 02",
    status: "Next",
    title: "Ranchi Regional Cluster",
    desc: "Expanding to technical & medical universities across Ranchi to enable inter-college sports, fests, and local student hubs.",
    current: false,
  },
  {
    phase: "PHASE 03",
    status: "Upcoming",
    title: "All-India Expansion",
    desc: "Progressively opening hubs for student domains nationwide, prioritized by verified student waitlist requests.",
    current: false,
  },
];

export function TractionSection() {
  return (
    <section className="border-t border-border/40 bg-muted/10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Section Heading */}
        <Reveal className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
            {"TRACTION_METRICS // PILOT_VALIDATION"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Built at BIT Mesra.
            <br />
            <span className="text-muted-foreground font-semibold">Growing campus by campus.</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            We are building CampusLoop thoughtfully with students on the ground, focusing on authentic campus
            culture and retention before scaling nationwide.
          </p>
        </Reveal>

        {/* 3 Real Traction Metric Cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase text-[#1D9BF0] tracking-wider">
                CAMPUS_HUBS
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-foreground">1,350+</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Indexed Indian universities &amp; college hubs ready for instant student email verification.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase text-blue-500 tracking-wider">
                COMMUNITY_SCALE
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-foreground">1,600+</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Active verified student profiles connecting, discussing, and collaborating across campuses.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-3">
              <span className="font-mono text-[11px] font-bold uppercase text-emerald-500 tracking-wider">
                ACADEMICS_VAULT
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-foreground">9,200+</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Senior-verified lecture notes, semester study guides, and solved question papers indexed.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Expansion Roadmap */}
        <Reveal delay={0.2}>
          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Milestone className="size-4.5 text-[#1D9BF0]" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Phased Campus Rollout Plan
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {ROADMAP.map((item) => (
                <div
                  key={item.phase}
                  className={`rounded-xl p-4 border space-y-2 ${
                    item.current ? "border-[#1D9BF0]/40 bg-[#1D9BF0]/5" : "border-border/40 bg-muted/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-foreground">{item.phase}</span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.current
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground border border-border/40"
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

            <div className="pt-1 text-center sm:text-left">
              <Link
                href="/colleges"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1D9BF0] hover:underline"
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
