"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  HelpCircle,
  Sparkles,
  Calendar,
  Search,
  Lock,
  Clock,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const ARTIFACTS = [
  {
    icon: BarChart3,
    title: "Polls",
    description: "Settle canteen debates with live, campus-wide polls.",
    color: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borderGlow: "group-hover:border-amber-500/40 group-hover:shadow-amber-500/5",
    accent: "bg-amber-500",
  },
  {
    icon: HelpCircle,
    title: "Questions",
    description: "Ask anything — from exam help to where the best chai is.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderGlow: "group-hover:border-blue-500/40 group-hover:shadow-blue-500/5",
    accent: "bg-blue-500",
  },
  {
    icon: Sparkles,
    title: "Memes",
    description: "Drop memes only your campus would truly get.",
    color: "from-pink-500/20 to-rose-500/20",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    borderGlow: "group-hover:border-pink-500/40 group-hover:shadow-pink-500/5",
    accent: "bg-pink-500",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Plan fests, meetups, and surprise birthday parties.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderGlow: "group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/5",
    accent: "bg-emerald-500",
  },
  {
    icon: Search,
    title: "Lost & Found",
    description: "Found a wallet? Lost your ID? Post it and find it.",
    color: "from-purple-500/20 to-violet-500/20",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    borderGlow: "group-hover:border-purple-500/40 group-hover:shadow-purple-500/5",
    accent: "bg-purple-500",
  },
  {
    icon: Lock,
    title: "Confessions",
    description: "Speak without a name — what's said in the loop stays.",
    color: "from-red-500/20 to-rose-500/20",
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
    borderGlow: "group-hover:border-red-500/40 group-hover:shadow-red-500/5",
    accent: "bg-red-500",
  },
  {
    icon: Clock,
    title: "Stories",
    description: "Moments that vanish in 24 hours. No traces, no screenshots.",
    color: "from-orange-500/20 to-yellow-500/20",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    borderGlow: "group-hover:border-orange-500/40 group-hover:shadow-orange-500/5",
    accent: "bg-orange-500",
  },
  {
    icon: Users,
    title: "Communities",
    description: "Find your people — coding club, hostel wing, or book nerds.",
    color: "from-indigo-500/20 to-blue-500/20",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    borderGlow: "group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/5",
    accent: "bg-indigo-500",
  },
];

function ArtifactCard({
  artifact,
  index,
}: {
  artifact: (typeof ARTIFACTS)[0];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Gradient background that appears on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-500",
          "bg-gradient-to-br",
          artifact.color,
          isHovered && "opacity-100"
        )}
      />

      {/* Card */}
      <div
        className={cn(
          "relative rounded-xl border border-border bg-card p-5 transition-all duration-300",
          "shadow-sm hover:shadow-md",
          "hover:-translate-y-0.5",
          artifact.borderGlow
        )}
      >
        {/* Accent bar at top */}
        <div
          className={cn(
            "absolute left-3 right-3 top-0 h-0.5 scale-x-0 rounded-full transition-transform duration-300",
            artifact.accent,
            "group-hover:scale-x-100"
          )}
          style={{ transformOrigin: "left" }}
        />

        {/* Corner indicator */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </div>

        {/* Icon */}
        <div
          className={cn(
            "mb-3 flex size-10 items-center justify-center rounded-lg transition-all duration-300",
            artifact.iconBg,
            "group-hover:scale-110 group-hover:shadow-lg"
          )}
        >
          <artifact.icon className="size-5" />
        </div>

        {/* Content */}
        <h3 className="mb-1.5 font-heading text-sm font-semibold tracking-tight">
          {artifact.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {artifact.description}
        </p>
      </div>
    </motion.div>
  );
}

export function ArtifactsShowcase() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="max-w-xl space-y-3 pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            What you can create
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Eight ways to shape the loop.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            From anonymous whispers to campus-wide polls — every post is a
            building block of your college&apos;s digital heartbeat.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ARTIFACTS.map((artifact, i) => (
            <ArtifactCard key={artifact.title} artifact={artifact} index={i} />
          ))}
        </div>

        {/* Bottom stripe */}
        <Reveal delay={0.15} className="pt-12">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">One account.</span>{" "}
                Every artifact. Zero compromises on privacy.
              </p>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                All verified
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
