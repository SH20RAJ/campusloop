"use client";

import {
  School,
  MessageSquare,
  Heart,
  Users,
  Sparkles,
  FileText,
  MessageCircle,
  Clock,
  BarChart3,
  Lock,
  MailCheck,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

// ──────── Section 1: Stats & Numbers ────────

const STATS = [
  {
    icon: School,
    value: 1350,
    suffix: "+",
    label: "Colleges Enrolled",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "bg-amber-500/5",
  },
  {
    icon: MessageSquare,
    value: 10240,
    suffix: "+",
    label: "Posts Created",
    gradient: "from-blue-500 to-cyan-500",
    bgGlow: "bg-blue-500/5",
  },
  {
    icon: Heart,
    value: 5840,
    suffix: "+",
    label: "Matches Made",
    gradient: "from-pink-500 to-rose-500",
    bgGlow: "bg-pink-500/5",
  },
  {
    icon: Users,
    value: 2500,
    suffix: "+",
    label: "Daily Active Users",
    gradient: "from-emerald-500 to-teal-500",
    bgGlow: "bg-emerald-500/5",
  },
];

export function StatsSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            The numbers
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Growing faster than your semester backlog.
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                  stat.bgGlow
                )}
              >
                {/* Gradient accent line */}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-1 w-full bg-gradient-to-r opacity-60",
                    stat.gradient
                  )}
                />

                <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-muted/80 ring-1 ring-border/50">
                  <stat.icon className="size-5 text-muted-foreground" />
                </div>

                <p className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                  <NumberTicker value={stat.value} delay={0.2 + i * 0.15} />
                  <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
                    {stat.suffix}
                  </span>
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
    title: "Rich Text Editor",
    desc: "Bold, italic, lists, and code blocks. Your campus posts deserve formatting.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/10 text-purple-500",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    desc: "DM classmates without exchanging numbers. Read receipts, typing indicators, and more.",
    gradient: "from-rose-500/20 to-red-500/20",
    iconBg: "bg-rose-500/10 text-rose-500",
  },
  {
    icon: Clock,
    title: "Story Rings",
    desc: "24-hour moments that vanish. No screenshots, no archives, no pressure.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconBg: "bg-orange-500/10 text-orange-500",
  },
  {
    icon: BarChart3,
    title: "Live Poll Results",
    desc: "Vote and watch percentages shift in real time. No refresh needed.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    icon: Users,
    title: "Community Hubs",
    desc: "Dedicated spaces for clubs, hostels, and interest groups. Your campus, organized.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  {
    icon: Lock,
    title: "Anonymous Posting",
    desc: "Speak freely behind a cryptographic hash. Your identity stays off the record.",
    gradient: "from-red-500/20 to-rose-500/20",
    iconBg: "bg-red-500/10 text-red-500",
  },
];

export function IntegrationsSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Features that matter
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Everything a campus needs.
          </h2>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05}>
              <div className="group relative cursor-default rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-500",
                    "bg-gradient-to-br",
                    feature.gradient,
                    "group-hover:opacity-100"
                  )}
                />
                <div className="relative flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
                      feature.iconBg
                    )}
                  >
                    <feature.icon className="size-5" />
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
    quote: "I found my study group through CampusLoop. Now we crush every assignment together.",
    name: "Ananya Sharma",
    role: "BITS Pilani, CS '27",
    initials: "AS",
    color: "from-blue-500 to-cyan-500",
  },
  {
    quote: "The anonymity made me brave enough to come out to my campus. Best decision ever.",
    name: "Rahul Verma",
    role: "Christ University, Design '26",
    initials: "RV",
    color: "from-pink-500 to-rose-500",
  },
  {
    quote: "Confessions here are unhinged in the best way. Our canteen poll got 800+ votes in a day.",
    name: "Priya Mehta",
    role: "SRCC, Economics '25",
    initials: "PM",
    color: "from-amber-500 to-orange-500",
  },
  {
    quote: "Swiped right, matched, and now we get chai together every evening. CampusLoop matchmaking is insane.",
    name: "Arun Kumar",
    role: "IIT Delhi, Electrical '26",
    initials: "AK",
    color: "from-emerald-500 to-teal-500",
  },
  {
    quote: "The moderation is actually good. Trolls get shut down fast. Feels like a safe space.",
    name: "Neha Singh",
    role: "NIT Trichy, Mechanical '27",
    initials: "NS",
    color: "from-purple-500 to-violet-500",
  },
  {
    quote: "I posted a lost ID card at 8 AM and the owner contacted me by lunch. CampusLoop is magic.",
    name: "Karthik Rajan",
    role: "VIT Vellore, CSE '25",
    initials: "KR",
    color: "from-red-500 to-orange-500",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-t border-border/60 bg-muted/5">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Real voices
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            What students are saying.
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md">
                {/* Quote mark */}
                <div className="mb-3 text-3xl leading-none font-serif text-muted-foreground/20">
                  &ldquo;
                </div>
                <p className="mb-4 text-sm leading-relaxed text-foreground/90">
                  {t.quote}
                </p>
                <div className="flex items-center gap-2.5 border-t border-border/40 pt-3">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white shadow-sm",
                      t.color
                    )}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
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
    desc: "Phone numbers and emails are stripped from every confession before it hits the feed. No exceptions.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    status: "Active",
  },
  {
    icon: Lock,
    title: "Anonymous by Default",
    desc: "Your posts carry a cryptographic hash, not your name. No profile link, no trace back.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500/10 text-blue-500",
    status: "Active",
  },
  {
    icon: ShieldAlert,
    title: "Report & Block",
    desc: "Flag anything that shouldn't be there. Moderators review within hours.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/10 text-amber-500",
    status: "Active",
  },
  {
    icon: School,
    title: "College-Gated Access",
    desc: "Every account is verified by college email. No alumni, no outsiders, no bots.",
    gradient: "from-red-500/20 to-rose-500/20",
    iconBg: "bg-red-500/10 text-red-500",
    status: "Always On",
  },
];

export function SafetySection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Safety first
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Speak freely. Safely.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We built guardrails so you can be loud without worrying about who&apos;s
            watching.
          </p>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {SAFETY_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-500",
                    "bg-gradient-to-br",
                    item.gradient,
                    "group-hover:opacity-100"
                  )}
                />
                <div className="relative flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                      item.iconBg
                    )}
                  >
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-heading text-sm font-semibold">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
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
    q: "Is it really anonymous?",
    a: "Yes. Confessions and anonymous posts are tied to a one-way cryptographic hash of your identity. Your name, email, and profile are never stored alongside the post. Even we cannot deanonymize you without a legal request.",
  },
  {
    q: "Which colleges are supported?",
    a: "1,350+ Indian colleges are already enrolled. If yours isn&apos;t on the list, you can request it by emailing us with your college email address. We typically add new colleges within 48 hours.",
  },
  {
    q: "Is CampusLoop completely free?",
    a: "Yes — always free for verified students. No subscription, no hidden charges, no &lsquo;premium&apos; tiers. Your college email is the only ticket you need.",
  },
  {
    q: "How does verification work?",
    a: "You sign up with your college email (e.g., name@iitd.ac.in). We send a one-time code to that inbox. Once you enter it, you&apos;re in. No documents, no selfies, no waiting.",
  },
  {
    q: "Can I delete my posts or account?",
    a: "Absolutely. You can delete any post at any time. Your account can be permanently deleted from settings — all your data goes with it within 30 days.",
  },
  {
    q: "What if someone harasses me?",
    a: "Block them instantly or report the content. Our moderation team reviews reports within hours. Serial offenders get banned from the platform permanently.",
  },
];

export function FAQSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Got questions?
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Quick answers.
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
      <details className="group rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md [&[open]]:border-primary/20 [&[open]]:bg-primary/[0.02]">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium transition-colors group-open:text-primary">
          <span>{faq.q}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
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
    title: "Sign up with your college email",
    desc: "Type your @yourcollege.ac.in address. We send a one-time code to your inbox.",
    icon: MailCheck,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  {
    step: 2,
    title: "Verify with one tap",
    desc: "Enter the OTP. That's it — no documents, no selfies, no waitlist.",
    icon: ShieldCheck,
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  {
    step: 3,
    title: "Join your campus loop",
    desc: "You land in a feed where every single account passed the same email check.",
    icon: Users,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    step: 4,
    title: "Post, poll, match, chat",
    desc: "Confess anonymously, settle debates with polls, swipe to match, and DM classmates.",
    icon: Sparkles,
    gradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/10 text-purple-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Four steps to your campus loop.
          </h2>
        </Reveal>

        <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connector line */}
          <div className="pointer-events-none absolute left-8 top-12 hidden h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent lg:block lg:left-[calc(12.5%+1.5rem)] lg:right-[calc(12.5%+1.5rem)]" />

          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-500",
                    "bg-gradient-to-br",
                    step.gradient,
                    "group-hover:opacity-100"
                  )}
                />
                <div className="relative">
                  <span className="mb-3 flex size-10 items-center justify-center rounded-lg text-xs font-bold ring-1 ring-border/50 bg-muted/80 text-muted-foreground">
                    {step.step}
                  </span>
                  <h3 className="mb-1.5 font-heading text-sm font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}


