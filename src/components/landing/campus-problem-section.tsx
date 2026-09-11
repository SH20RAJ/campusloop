import { ArrowRight, MessageSquare, ShieldAlert, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const PROBLEMS = [
  {
    icon: MessageSquare,
    badge: "FAIL: UNINDEXED_NOISE",
    title: "WhatsApp & Telegram Groups",
    problem: "Critical announcements drown in 500+ unread messages.",
    detail:
      "Important fest notices, hostel emergencies, and lecture notes vanish under forwarded memes, unmuted spam, and chaotic 500-member chats.",
    tag: "Information Entropy",
  },
  {
    icon: ShieldAlert,
    badge: "FAIL: ZERO_VERIFICATION",
    title: "Instagram Confession Handles",
    problem: "Unregulated pages watched by outsiders, alumni, and coaching centers.",
    detail:
      "Run by unverified private accounts with zero institutional oversight. Targeted student harassment flourishes while admins sell stories for paid coaching ads.",
    tag: "Safety & Doxxing Hazard",
  },
  {
    icon: ShoppingBag,
    badge: "FAIL: STRANGER_RISK",
    title: "Unverified Peer Trading",
    problem: "Buying second-hand gear with complete strangers.",
    detail:
      "Buying cycles, coolers, or engineering drafters through unverified random handles leads to payment scams, price-gouging, and awkward ghosting at pickup.",
    tag: "Zero Transaction Escrow",
  },
];

export function CampusProblemSection() {
  return (
    <section className="border-t border-border/40 bg-muted/10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Section Heading */}
        <Reveal className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
            {"CAMPUS_DIAGNOSTICS // FRAGMENTATION_ANALYSIS"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Campus life is already online.
            <br />
            <span className="text-muted-foreground font-semibold">It&apos;s just scattered everywhere.</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            College students juggle dozens of fragmented apps that were never designed for verified campus
            trust, privacy, or community accountability.
          </p>
        </Reveal>

        {/* 3 Grok-Diagnostic Pain Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 0.08}>
              <div className="group relative h-full rounded-2xl border border-border/40 bg-card p-6 shadow-xs transition-all hover:border-border hover:bg-muted/10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Card Badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20">
                      <item.icon className="size-4.5" />
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-destructive">{item.problem}</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{item.tag}</span>
                  <span className="text-destructive font-bold flex items-center gap-1">
                    <X className="size-3" />
                    <span>Broken System</span>
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Resolution Banner */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1.5 max-w-2xl">
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#1D9BF0]">
                THE CAMPUSLOOP RESOLUTION
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                One verified network for your entire campus.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                One institutional email login unlocks your campus feed, student clubs, classmate matchmaking,
                and peer marketplace — strictly restricted to enrolled students.
              </p>
            </div>
            <Link
              href="/handler/sign-up"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-6 text-xs font-bold text-white transition-all shadow-sm active:scale-98 cursor-pointer"
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
