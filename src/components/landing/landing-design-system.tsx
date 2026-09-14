import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

export interface LandingSectionProps {
  id?: string;
  bg?: "default" | "subtle" | "elevated";
  className?: string;
  children: ReactNode;
}

/**
 * Standardized full-width section container with generous spacing and subtle dividing borders.
 */
export function LandingSection({
  id,
  bg = "default",
  className,
  children,
}: LandingSectionProps) {
  const bgClasses = {
    default: "bg-background",
    subtle: "bg-zinc-50/50 dark:bg-[#0E131F]/60",
    elevated: "bg-zinc-100/40 dark:bg-[#111726]/40",
  }[bg];

  return (
    <section
      id={id}
      className={cn(
        "relative border-t border-border/50 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-x-clip",
        bgClasses,
        className
      )}
    >
      {children}
    </section>
  );
}

export interface LandingContainerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Maximum width container with unified layout discipline.
 */
export function LandingContainer({ className, children }: LandingContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-16", className)}>
      {children}
    </div>
  );
}

export interface LandingSectionHeaderProps {
  badge?: string;
  eyebrow?: string;
  headlineMain: string;
  headlineSub?: string;
  headlineHighlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Editorial H2 + Eyebrow + Subtitle block matching modern premium SaaS typography.
 */
export function LandingSectionHeader({
  badge,
  eyebrow,
  headlineMain,
  headlineSub,
  headlineHighlight,
  description,
  align = "left",
  className,
}: LandingSectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <Reveal
      className={cn(
        "space-y-4",
        isCenter && "text-center max-w-2xl mx-auto",
        className
      )}
    >
      {badge && (
        <div className={cn("flex items-center", isCenter && "justify-center")}>
          <LandingBadge>{badge}</LandingBadge>
        </div>
      )}
      {eyebrow && !badge && (
        <p className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
        {headlineMain}
        {headlineSub && (
          <span className="block text-muted-foreground font-medium mt-1">
            {headlineSub}
          </span>
        )}
        {headlineHighlight && (
          <span className="block text-blue-600 dark:text-blue-400 font-bold mt-1">
            {headlineHighlight}
          </span>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "text-base sm:text-lg text-muted-foreground leading-relaxed",
            isCenter ? "max-w-xl mx-auto" : "max-w-2xl"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

export interface LandingBadgeProps {
  className?: string;
  variant?: "default" | "success" | "neutral" | "warning";
  dot?: boolean;
  children: ReactNode;
}

/**
 * Clean pill badge with optional active status dot inspired by reference mockups.
 */
export function LandingBadge({
  className,
  variant = "default",
  dot = false,
  children,
}: LandingBadgeProps) {
  const variantStyles = {
    default: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    neutral: "bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  }[variant];

  const dotStyles = {
    default: "bg-blue-500",
    success: "bg-emerald-500",
    neutral: "bg-zinc-400",
    warning: "bg-amber-500",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase shadow-2xs backdrop-blur-xs",
        variantStyles,
        className
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full animate-pulse", dotStyles)} />}
      {children}
    </span>
  );
}

export interface LandingCardProps {
  className?: string;
  hoverable?: boolean;
  children: ReactNode;
}

/**
 * Standardized reference-grade card with large radius, hairline border, and gentle shadow.
 */
export function LandingCard({
  className,
  hoverable = true,
  children,
}: LandingCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300",
        hoverable && "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-zinc-300/90 dark:hover:border-white/20 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface StatusPillProps {
  status: "live" | "paused" | "critical" | "healthy" | "pending";
  label?: string;
  className?: string;
}

/**
 * Small status indicator pill inspired directly by the reference dashboard.
 */
export function StatusPill({ status, label, className }: StatusPillProps) {
  const configs = {
    live: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      text: label || "Live",
    },
    healthy: {
      dot: "bg-emerald-500",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      text: label || "Healthy",
    },
    paused: {
      dot: "bg-amber-500",
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      text: label || "Paused",
    },
    pending: {
      dot: "bg-blue-500",
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      text: label || "Pending",
    },
    critical: {
      dot: "bg-rose-500",
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      text: label || "Critical",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium tracking-normal",
        configs.bg,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", configs.dot)} />
      {configs.text}
    </span>
  );
}
