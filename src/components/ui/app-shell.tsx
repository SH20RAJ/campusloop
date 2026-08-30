"use client";

import type { LucideIcon } from "lucide-react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/**
 * CampusLoop app-surface primitives.
 *
 * Every `/app/*` screen is one column of rows under a sticky header — the shape
 * the feed, notifications and profile already use. These components carry that
 * shape so pages stop re-deriving it (and drifting) in their own markup.
 *
 * The scale they encode, taken from the existing feed and sidebar:
 *
 *   Column      max-w-2xl, `border-x border-border/20`
 *   Header      sticky, `bg-background/90 backdrop-blur-xl`, `px-4 py-3.5`
 *   Separator   `divide-y divide-border/30`
 *   Row         `px-4 py-3.5`, `gap-3.5`, `hover:bg-muted/25`
 *   Title       `text-lg font-black tracking-tight`
 *   Body        `text-[15px]`
 *   Meta        `text-[13px] text-muted-foreground`
 *   Micro       `text-[11px] font-bold`
 *   Radius      `rounded-full` for controls, `rounded-xl` for media and inputs
 *   Press       `active:scale-95`
 */

/* ── Column ───────────────────────────────────────────────────────────── */

export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-2xl select-none flex-col border-x border-border/20 pb-28",
        className
      )}
    >
      {children}
    </main>
  );
}

/* ── Header ───────────────────────────────────────────────────────────── */

export function PageHeader({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Right-aligned control, typically a primary action. */
  action?: React.ReactNode;
  /** Tabs or filters pinned beneath the title. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div className="min-w-0">
          <h1 className="text-lg font-black tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </header>
  );
}

/* ── Tabs ─────────────────────────────────────────────────────────────── */

export interface PageTab<T extends string> {
  id: T;
  label: string;
}

/** Equal-width tabs with the feed's underline indicator. */
export function PageTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: PageTab<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              haptics.light();
              onChange(tab.id);
            }}
            className={cn(
              "relative flex-1 cursor-pointer py-3 text-[14px] font-bold transition-colors",
              isActive
                ? "font-black text-foreground"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
            )}
          >
            <span className="truncate px-1">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Filter pills ─────────────────────────────────────────────────────── */

export interface FilterPill<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

/** Horizontally scrolling filter strip. Active state is inverted, as in the feed. */
export function FilterPills<T extends string>({
  pills,
  value,
  onChange,
  className,
  bordered = true,
}: {
  pills: FilterPill<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  /** Draws the section separator; turn off when stacking several strips. */
  bordered?: boolean;
}) {
  return (
    <div className={cn(bordered && "border-b border-border/30", "px-4 py-3", className)}>
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
        {pills.map((pill) => {
          const Icon = pill.icon;
          const isActive = value === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                haptics.light();
                onChange(pill.id);
              }}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95",
                isActive
                  ? "bg-foreground font-black text-background"
                  : "border border-border/40 bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {Icon && <Icon className="size-3.5" />}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Search ───────────────────────────────────────────────────────────── */

export function SearchField({
  value,
  onChange,
  placeholder = "Search",
  className,
  bordered = true,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <div className={cn(bordered && "border-b border-border/30", "px-4 py-3", className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-border/60 bg-muted/30 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── List ─────────────────────────────────────────────────────────────── */

export function PageList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border/30", className)}>{children}</div>;
}

/** One tappable row. Renders as a link when `href` is given. */
export function ListRow({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "group flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-muted/25",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, "cursor-pointer")}>
      {children}
    </button>
  );
}

/* ── States ───────────────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
      <Icon className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/**
 * Row-shaped loading placeholder. Matching the real row's geometry stops the
 * layout jumping when data lands.
 */
export function RowSkeleton({
  count = 5,
  media = "avatar",
}: {
  count?: number;
  /** `avatar` is a circle, `thumb` a rounded square, `none` text only. */
  media?: "avatar" | "thumb" | "none";
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3.5 px-4 py-3.5">
          {media !== "none" && (
            <div
              className={cn(
                "size-11 shrink-0 bg-muted/60",
                media === "avatar" ? "rounded-full" : "rounded-xl"
              )}
            />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-muted/60" />
            <div className="h-2.5 w-1/3 rounded bg-muted/40" />
          </div>
        </div>
      ))}
    </>
  );
}

/* ── Primary action ───────────────────────────────────────────────────── */

/** Pill CTA used in headers and empty states. */
export function PrimaryAction({
  href,
  onClick,
  icon: Icon,
  children,
  compactLabel,
  className,
  disabled,
}: {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  children: React.ReactNode;
  /** Shown instead of `children` below the `sm` breakpoint. */
  compactLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const classes = cn(
    "flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50",
    className
  );

  const inner = (
    <>
      {Icon && <Icon className="size-3.5" />}
      {compactLabel ? (
        <>
          <span className="hidden sm:inline">{children}</span>
          <span className="sm:hidden">{compactLabel}</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={() => haptics.light()} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  );
}
