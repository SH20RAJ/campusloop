import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

export interface LandingSectionProps {
  id?: string;
  bg?: "default" | "muted" | "subtle";
  className?: string;
  children: ReactNode;
}

/**
 * Standardized full-width section container for landing & marketing pages.
 */
export function LandingSection({
  id,
  bg = "default",
  className,
  children,
}: LandingSectionProps) {
  const bgClasses = {
    default: "bg-background",
    muted: "bg-muted/10",
    subtle: "bg-card/30",
  }[bg];

  return (
    <section
      id={id}
      className={cn(
        "border-t border-border/40 py-20 sm:py-28 px-4 sm:px-6 overflow-x-clip",
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
 * Standardized maximum width container with unified vertical spacing.
 */
export function LandingContainer({ className, children }: LandingContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-12", className)}>
      {children}
    </div>
  );
}

export interface LandingSectionHeaderProps {
  eyebrow: string;
  headlineMain: string;
  headlineSub?: string;
  headlineHighlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Unified H2 + Eyebrow + Subtitle block following the CampusLoop design system.
 */
export function LandingSectionHeader({
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
        "space-y-3",
        isCenter && "text-center max-w-2xl mx-auto",
        className
      )}
    >
      <div className={cn("flex items-center gap-2", isCenter && "justify-center")}>
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
        {headlineMain}
        {headlineSub && (
          <>
            <br />
            <span className="text-muted-foreground font-semibold">{headlineSub}</span>
          </>
        )}
        {headlineHighlight && (
          <>
            <br />
            <span className="text-[#1D9BF0]">{headlineHighlight}</span>
          </>
        )}
      </h2>

      {description && (
        <p
          className={cn(
            "text-sm sm:text-base text-muted-foreground leading-relaxed",
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
  children: ReactNode;
}

/**
 * Reusable pill badge for section headers and micro-tags.
 */
export function LandingBadge({ className, children }: LandingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] border border-[#1D9BF0]/20 font-mono text-[11px] font-bold uppercase tracking-wider",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface LandingCardProps {
  className?: string;
  children: ReactNode;
}

/**
 * Standardized card block with hairline border and subtle shadow.
 */
export function LandingCard({ className, children }: LandingCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card p-6 sm:p-8 shadow-xs transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}
