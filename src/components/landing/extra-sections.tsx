"use client";

import {
  School,
  MessageSquare,
  Heart,
  Users,
  FileText,
  MessageCircle,
  Clock,
  BarChart3,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/landing/reveal";

// ──────── Section 1: Stats & Numbers ────────

const STATS = [
  {
    icon: School,
    value: 1350,
    suffix: "+",
    label: "Colleges Enrolled",
  },
  {
    icon: MessageSquare,
    value: 10240,
    suffix: "+",
    label: "Secrets & Confessions",
  },
  {
    icon: Heart,
    value: 5840,
    suffix: "+",
    label: "Matches Made (Zero Catfish)",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Daily Procrastinating Students",
  },
];

export function StatsSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The numbers
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Growing faster than your semester backlog.
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 text-center transition-all hover:border-border/80 shadow-sm">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-muted border border-border/60">
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>

                <p className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                  <NumberTicker value={stat.value} delay={0.2 + i * 0.1} />
                  <span className="text-primary">{stat.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────── Section 2: Integrations & Features ────────

const FEATURES = [
  {
    icon: FileText,
    title: "Rich Text Confessions",
    desc: "Bold your canteen drama, italicize your exam rants, and code-block your lab meltdowns.",
  },
  {
    icon: MessageCircle,
    title: "Direct In-App DMs",
    desc: "Slide in without giving out your personal phone number or Instagram handle.",
  },
  {
    icon: Clock,
    title: "24h Story Rings",
    desc: "Post campus moments that vanish before your HOD or batch CR wakes up.",
  },
  {
    icon: BarChart3,
    title: "Live Canteen Polls",
    desc: "Settle 'Nescafe vs Mess Food' debates with instant real-time votes.",
  },
  {
    icon: Users,
    title: "Hostel & Club Hubs",
    desc: "Dedicated spaces for coding nerds, sports teams, and late-night study wings.",
  },
  {
    icon: Lock,
    title: "Cryptographic Anonymity",
    desc: "Speak freely behind a one-way hash. Your name stays completely off the record.",
  },
];

export function IntegrationsSection() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Campus Survival Kit
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Everything a student needs.
          </h2>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-border/80 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-semibold">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────── Section 3: Testimonials ────────

const TESTIMONIALS = [
  {
    quote: "My attendance is at 45% but my Loop Points are at 10,000. Priorities.",
    name: "Ananya Sharma",
    role: "BITS Pilani, CS '27",
    initials: "AS",
  },
  {
    quote: "Met my girlfriend here when we were both studying for the same Endsem exam we failed.",
    name: "Rahul Verma",
    role: "Christ University, Design '26",
    initials: "RV",
  },
  {
    quote: "Our canteen poll got 800+ votes in a day. Nescafe booth won by an absolute landslide.",
    name: "Priya Mehta",
    role: "SRCC, Economics '25",
    initials: "PM",
  },
  {
    quote: "I posted a lost ID card at 8 AM and the owner found me before the first lecture started.",
    name: "Arun Kumar",
    role: "IIT Delhi, Electrical '26",
    initials: "AK",
  },
  {
    quote: "The anonymity is real. I complained about mess food and didn't get kicked out of the hostel.",
    name: "Neha Singh",
    role: "NIT Trichy, Mechanical '27",
    initials: "NS",
  },
  {
    quote: "Found my study group here. We still fail together, but now we fail in style.",
    name: "Karthik Rajan",
    role: "VIT Vellore, CSE '25",
    initials: "KR",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Real Student Voices
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            What your classmates are saying.
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80">
                <div className="mb-2 text-2xl leading-none font-serif text-muted-foreground/30">
                  &ldquo;
                </div>
                <p className="mb-4 text-xs leading-relaxed text-foreground/90 font-medium">
                  {t.quote}
                </p>
                <div className="flex items-center gap-2.5 border-t border-border/40 pt-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────── Section 4: Safety & Privacy ────────

const SAFETY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "PII Auto-Scrubbing",
    desc: "We delete phone numbers and emails faster than you delete your ex's texts. No personal data leaks.",
    status: "Active",
  },
  {
    icon: Lock,
    title: "Anonymous by Default",
    desc: "Your posts carry a cryptographic hash, not your name. No profile link, no trace back.",
    status: "Active",
  },
  {
    icon: ShieldAlert,
    title: "Instant Moderation",
    desc: "Flag anything out of line. Trolls and toxic accounts get banned permanently.",
    status: "Active",
  },
  {
    icon: School,
    title: "College-Gated Access",
    desc: "Verified by official college email. No random uncles, alumni, or bots allowed.",
    status: "Always On",
  },
];

export function SafetySection() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Safety First
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Speak freely without your HOD finding out.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We built cryptographic guardrails so you can be loud without getting suspended.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {SAFETY_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-heading text-sm font-bold text-foreground">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────── Section 5: FAQ ────────

const FAQS = [
  {
    q: "Is it really anonymous or will my HOD catch me?",
    a: "100% anonymous. Confessions and anonymous posts use a one-way cryptographic hash. Your name, email, and profile are never attached to the post.",
  },
  {
    q: "What if my college isn't on the list?",
    a: "1,350+ Indian colleges are already supported. If yours isn't, email mail@campusloop.space with your college domain and we add it within 24 hours.",
  },
  {
    q: "Is CampusLoop completely free?",
    a: "Yes — always 100% free for verified students. No premium tiers, no hidden charges.",
  },
  {
    q: "How does verification work?",
    a: "Sign up with your college email (e.g. name@iitd.ac.in). Enter the 6-digit OTP code we send to your inbox. That's it — takes 5 seconds.",
  },
  {
    q: "Can I delete my posts or account?",
    a: "Yes. You can delete any post instantly. You can also delete your account permanently from settings.",
  },
  {
    q: "What if someone harasses me?",
    a: "Block them instantly or report the post. Our moderators review reports quickly and ban toxic users permanently.",
  },
];

export function FAQSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Quick Answers
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Frequently Asked Questions.
          </h2>
        </Reveal>

        <div className="mx-auto max-w-2xl space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  faq,
  index,
}: {
  faq: (typeof FAQS)[number];
  index: number;
}) {
  return (
    <Reveal delay={index * 0.04}>
      <details className="group rounded-xl border border-border bg-card transition-all duration-200 [&[open]]:border-primary/30">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-xs md:text-sm font-semibold transition-colors group-open:text-primary">
          <span>{faq.q}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="border-t border-border/40 px-5 pb-4 pt-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {faq.a}
          </p>
        </div>
      </details>
    </Reveal>
  );
}

// ──────── Section 6: How It Works ────────

const HOW_STEPS = [
  {
    step: 1,
    title: "Use your college email",
    desc: "The address you only open for exam hall tickets and fee reminders.",
  },
  {
    step: 2,
    title: "Verify with 1 tap",
    desc: "Enter the OTP code we send to your inbox. No ID cards, no waitlists.",
  },
  {
    step: 3,
    title: "Join your campus loop",
    desc: "Enter a feed where every single account cleared the same email check.",
  },
  {
    step: 4,
    title: "Post, poll, match & chat",
    desc: "Confess anonymously, settle canteen debates, swipe to match, and pretend to study.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Four steps to your campus loop.
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/80">
                <span className="mb-3 flex size-8 items-center justify-center rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {step.step}
                </span>
                <h3 className="mb-1 font-heading text-sm font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
