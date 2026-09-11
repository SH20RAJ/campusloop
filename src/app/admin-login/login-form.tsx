"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, LogIn } from "lucide-react";
import { checkAdminAccess } from "./actions";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAccess() {
    setIsLoading(true);
    setError(null);
    try {
      await checkAdminAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access denied");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/50 border border-border/60 p-3.5 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Authorized Admin Accounts:
        </p>
        <p className="font-mono text-[11px] text-foreground/80">• sh20raj@gmail.com</p>
        <p className="font-mono text-[11px] text-foreground/80">• btech10574.24@bitmesra.ac.in</p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-xs font-medium text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={handleAccess}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary h-10 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Verifying Session..." : "Enter Admin Console"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <Link
          href="/login?redirect=/admin"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card h-10 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign In with Hexclave
        </Link>
      </div>
    </div>
  );
}
