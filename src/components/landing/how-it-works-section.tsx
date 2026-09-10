"use client";

import { CheckCircle2, MailCheck, School, Sparkles } from "lucide-react";
import { VerifyDemo } from "@/components/landing/demos";
import { Reveal } from "@/components/landing/reveal";

const STEPS = [
  {
    step: "01",
    icon: MailCheck,
    title: "Verify your college email",
    subtitle: "student@college.ac.in",
    desc: "Enter your official institutional email. A secure 6-digit OTP proves your active student enrollment in seconds.",
  },
  {
    step: "02",
    icon: School,
    title: "Enter your campus hub",
    subtitle: "Isolated campus radius",
    desc: "Your college automatically becomes your default social space. Every peer you meet passed the exact same institutional check.",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Start your loop",
    subtitle: "Post · connect · participate",
    desc: "Speak freely with your choice of real-name or anonymous mode, find study partners, and trade dorm gear safely.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-16">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How CampusLoop Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Three steps.
            <br />
            <span className="text-muted-foreground font-semibold">Zero outsiders.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            No public open signups. No phone book scrapers. A direct cryptographic boundary that keeps your
            campus private and authentic.
          </p>
        </Reveal>

        {/* 3 Step Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <Reveal key={s.step} delay={idx * 0.08}>
              <div className="relative h-full rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                      <s.icon className="size-5" />
                    </span>
                    <span className="font-mono text-xl font-black text-muted-foreground/40">{s.step}</span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">{s.title}</h3>
                    <span className="text-xs font-mono font-semibold text-primary">{s.subtitle}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" />
                  <span>Gatekept &amp; Verified</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Domain Verification Checker Card */}
        <Reveal delay={0.15}>
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-md max-w-2xl mx-auto space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                Check your college domain
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Test if your college email format is ready for the CampusLoop verified network:
              </p>
            </div>

            <div className="pt-2 text-left">
              <VerifyDemo />
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              Currently testing pilot enrollment with students at{" "}
              <strong className="text-foreground">BIT Mesra</strong> and rolling out to select Indian
              universities.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
