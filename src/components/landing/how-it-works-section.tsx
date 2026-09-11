"use client";

import { CheckCircle2, MailCheck, School, Sparkles } from "lucide-react";
import { VerifyDemo } from "@/components/landing/demos";
import { Reveal } from "@/components/landing/reveal";

const STEPS = [
  {
    step: "STEP // 01",
    icon: MailCheck,
    title: "Verify your college email",
    subtitle: "student@college.ac.in",
    desc: "Enter your official institutional email. A secure 6-digit OTP proves your active student enrollment in seconds.",
  },
  {
    step: "STEP // 02",
    icon: School,
    title: "Enter your campus hub",
    subtitle: "Isolated campus radius",
    desc: "Your college automatically becomes your default timeline space. Every peer you meet passed the exact same institutional check.",
  },
  {
    step: "STEP // 03",
    icon: Sparkles,
    title: "Start your loop",
    subtitle: "Post · connect · participate",
    desc: "Speak freely with your choice of real-name or anonymous mode, find study partners, and trade dorm gear safely.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/40 bg-muted/10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Section Heading */}
        <Reveal className="space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
            {"ONBOARDING_PROTOCOL // 3_STEP_VERIFICATION"}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Three steps.
            <br />
            <span className="text-muted-foreground font-semibold">Zero outsiders.</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            No public open signups. No phone book scrapers. A direct cryptographic boundary that keeps your
            campus private, authentic, and safe.
          </p>
        </Reveal>

        {/* 3 Step Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <Reveal key={s.step} delay={idx * 0.08}>
              <div className="relative h-full rounded-2xl border border-border/40 bg-card p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20">
                      <s.icon className="size-4.5" />
                    </span>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{s.step}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                    <span className="font-mono text-xs text-[#1D9BF0] font-medium">{s.subtitle}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <CheckCircle2 className="size-3.5" />
                  <span>Verified Student Gate</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Domain Verification Checker Card */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 max-w-2xl mx-auto space-y-4 text-center">
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1D9BF0]">
                DOMAIN CHECKER
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Check your university domain compatibility
              </h3>
              <p className="text-xs text-muted-foreground">
                Test if your university email domain is recognized by the CampusLoop network:
              </p>
            </div>

            <div className="pt-2 text-left">
              <VerifyDemo />
            </div>

            <p className="font-mono text-[11px] text-muted-foreground pt-1">
              Active pilot testing with students at <strong className="text-foreground">BIT Mesra</strong> and
              rolling out to verified Indian universities.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
