"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Document primitives for the legal / policy pages.
 *
 * Deliberately monochrome: hierarchy comes from type scale, weight and
 * whitespace rather than colour. The only accent is the link/active colour,
 * so the pages read as documents instead of dashboards.
 */

export interface DocSectionRef {
  id: string;
  label: string;
}

/** Sticky table of contents that tracks the section currently in view. */
export function DocToc({ sections }: { sections: DocSectionRef[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer whichever tracked section is highest on screen right now
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="On this page" className="space-y-1">
      <p className="pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        On this page
      </p>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            "block border-l py-1.5 pl-3.5 text-[13px] leading-snug transition-colors",
            activeId === section.id
              ? "border-foreground font-medium text-foreground"
              : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}

export function LegalDocHeader({
  eyebrow,
  title,
  summary,
  meta,
}: {
  eyebrow?: string;
  title: string;
  summary?: string;
  meta?: string[];
}) {
  return (
    <header className="pb-10">
      {eyebrow && (
        <p className="pb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[2.1rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[2.6rem]">
        {title}
      </h1>
      {summary && (
        <p className="max-w-[62ch] pt-5 text-[17px] leading-[1.7] text-muted-foreground">{summary}</p>
      )}
      {meta && meta.length > 0 && (
        <p className="pt-6 text-[13px] text-muted-foreground/80">{meta.join("  ·  ")}</p>
      )}
    </header>
  );
}

export function DocSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border/50 py-10 first:border-t-0">
      <h2 className="flex gap-3 text-[19px] font-semibold leading-snug tracking-[-0.01em] text-foreground">
        {number !== undefined && (
          <span className="shrink-0 pt-px font-mono text-[13px] font-normal tabular-nums text-muted-foreground/60">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <span>{title}</span>
      </h2>
      <div className="space-y-5 pt-4 text-[15.5px] leading-[1.75] text-muted-foreground">{children}</div>
    </section>
  );
}

/** Quiet aside — a hairline rule, no fill, no colour. */
export function DocNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-foreground/20 pl-5 text-[15px] leading-[1.75] text-muted-foreground">
      {children}
    </div>
  );
}

export function DocList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="select-none pt-[3px] text-muted-foreground/40">
            —
          </span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Label/value rows — used for helplines, contact desks, data categories. */
export function DocTable({ rows }: { rows: { label: string; value: React.ReactNode; note?: string }[] }) {
  return (
    <dl className="divide-y divide-border/50 border-y border-border/50">
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-6">
          <dt className="text-[15px] font-medium text-foreground">{row.label}</dt>
          <dd className="space-y-1">
            <div className="text-[15px] text-foreground/90">{row.value}</div>
            {row.note && <p className="text-[13px] text-muted-foreground">{row.note}</p>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function DocLayout({ sections, children }: { sections: DocSectionRef[]; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-x-16 px-5 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-32 pt-1">
          <DocToc sections={sections} />
        </div>
      </aside>

      <article className="min-w-0 max-w-[68ch] pb-24">{children}</article>
    </div>
  );
}
