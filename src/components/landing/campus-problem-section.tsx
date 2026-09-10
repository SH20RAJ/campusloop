import { ArrowRight, MessageSquare, ShieldAlert, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const PROBLEMS = [
  {
    icon: MessageSquare,
    badge: "Group Noise",
    title: "WhatsApp & Telegram Groups",
    problem: "Announcements disappear in group noise.",
    detail:
      "Important club notices, hostel alerts, and exam notes get buried under 500+ unread messages, forwarded spam, and muted group chats.",
    tag: "Information Loss",
  },
  {
    icon: ShieldAlert,
    badge: "Zero Verification",
    title: "Instagram Confession Handles",
    problem: "Everyone can watch. Nobody knows who's a student.",
    detail:
      "Run by unverified personal accounts. Outsiders, alumni, and local coaching centers watch every rumor, with zero protection against targeted harassment.",
    tag: "Privacy & Safety Hazard",
  },
  {
    icon: ShoppingBag,
    badge: "Stranger Risk",
    title: "Random Student Groups & Marketplaces",
    problem: "Trading with strangers creates trust problems.",
    detail:
      "Buying second-hand cycles, coolers, or finding flatmates via unverified accounts leads to scams, price-gouging, and awkward ghosting.",
    tag: "Zero Accountability",
  },
];

export function CampusProblemSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-14">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The Campus Reality</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Campus life is already online.
            <br />
            <span className="text-muted-foreground font-semibold">It&apos;s just scattered everywhere.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            College students juggle dozens of fragmented apps that were never designed for verified campus
            trust, privacy, or community accountability.
          </p>
        </Reveal>

        {/* 3 Pain Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.08}>
              <div className="relative h-full rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm transition-all hover:border-border hover:shadow-md flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Card Badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
                      <item.icon className="size-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-destructive">{item.problem}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{item.tag}</span>
                  <span className="text-destructive font-bold">✕ Broken</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Resolution Banner */}
        <Reveal delay={0.15}>
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[11px] font-black tracking-wider uppercase text-primary">
                The CampusLoop Solution
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                CampusLoop brings the campus into one verified network.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                One verified institutional login unlocks your campus feed, interest clubs, classmate
                matchmaking, and peer marketplace — strictly restricted to verified students.
              </p>
            </div>
            <Link
              href="/handler/sign-up"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary hover:bg-primary/90 px-6 text-xs font-bold text-primary-foreground transition-all shadow-md shadow-primary/20 active:scale-98"
            >
              <span>Join with your campus email</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
