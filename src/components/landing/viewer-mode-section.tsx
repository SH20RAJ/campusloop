import { ArrowRight, Bookmark, Eye, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/landing/reveal";

const VIEWER_STEPS = [
  {
    step: "01",
    icon: Eye,
    title: "Read Before You Choose",
    desc: "Browse real, unvarnished campus discussions from students at BIT Mesra, IITs, NITs, and top universities — not marketing brochures or coaching ads.",
  },
  {
    step: "02",
    icon: Bookmark,
    title: "Save Threads & Follow Hubs",
    desc: "Save hostel advice, placement threads, and course reviews on your account. Follow up to five prospective campuses while preparing for exams.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Verify Seamlessly on Admission",
    desc: "Once you receive your university email address, verify in one tap. Your saved threads and campus history transition directly into full membership.",
  },
];

export function ViewerModeSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Aspirant Growth Funnel</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Not in college yet?
            <br />
            <span className="text-muted-foreground font-semibold">See campus life before you choose.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            JEE, NEET, and CUET aspirants can read real student conversations and campus communities before
            enrolling. Reading is open — posting and interacting stay gatekept by verified students.
          </p>
        </Reveal>

        {/* Funnel Visual Strip */}
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-4">
              <span className="text-xs font-mono font-bold text-foreground">VIEWER MODE FUNNEL</span>
              <span className="text-[11px] font-mono text-primary font-bold">
                READ → SAVE → FOLLOW → VERIFY LATER
              </span>
            </div>

            {/* 3 Funnel Steps */}
            <div className="grid gap-6 md:grid-cols-3">
              {VIEWER_STEPS.map((item, i) => (
                <div key={item.step} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <item.icon className="size-4" />
                    </span>
                    <span className="font-mono text-xs font-black text-muted-foreground">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Strict Boundary Callout */}
            <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Lock className="size-4" />
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                  <strong className="text-foreground">Strict Community Rule:</strong> Reading is open to all.
                  Posting, polling, chatting, and matching require active college-email verification.
                </p>
              </div>

              <Link
                href="/colleges"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 text-xs font-bold transition-all shadow-xs active:scale-98"
              >
                <span>Explore in Viewer Mode</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
