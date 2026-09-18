import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CleanCTAProps {
  isAuthenticated?: boolean;
}

export function CleanCTA({ isAuthenticated = false }: CleanCTAProps) {
  return (
    <section className="border-b border-border/70 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start here</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
            Make your campus easier to follow.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Join your university, find the conversations that matter, and keep your academic and campus resources in one place.
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/app"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {isAuthenticated ? "Open your campus" : "Join your campus"}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/colleges"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Browse colleges
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Verified with institutional email · Free for students · Built for web and PWA
        </p>
      </div>
    </section>
  );
}
