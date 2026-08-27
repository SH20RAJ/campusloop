"use client";

import { Home,RefreshCw,TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-lg font-black tracking-tight text-foreground">Something broke here</h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground leading-relaxed">
          This page hit an unexpected error. Trying again usually clears it — nothing you posted
          has been lost.
        </p>
        {error.digest && (
          <p className="pt-1 font-mono text-[10px] text-muted-foreground/70">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-primary-foreground shadow-md transition-all hover:bg-primary/95 active:scale-95"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
        <Link
          href="/app"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <Home className="size-4" />
          Back to feed
        </Link>
      </div>
    </main>
  );
}
