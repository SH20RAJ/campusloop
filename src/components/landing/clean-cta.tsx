import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface CleanCTAProps {
  isAuthenticated?: boolean;
}

export function CleanCTA({ isAuthenticated = false }: CleanCTAProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f3f7ff] py-24 sm:py-28 dark:bg-blue-950/10">
      <div className="pointer-events-none absolute -right-20 top-10 size-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-700/10" />
      <div className="pointer-events-none absolute -left-16 bottom-0 size-64 rounded-full bg-amber-100/60 blur-3xl dark:bg-amber-900/10" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Your campus is already happening</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] text-foreground sm:text-6xl">
              Give it one place to happen.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Join your university, find the people and resources around you, and keep the useful parts of student life close.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/app"
              className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-bold text-background shadow-sm transition hover:-translate-y-0.5"
            >
              {isAuthenticated ? "Open campus" : "Join CampusLoop"}
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/colleges"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Browse colleges
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
