"use client";

import { ArrowRight, CheckCircle2, Menu, Rocket, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

const NAV_LINKS = [
  { href: "#features", label: "Product" },
  { href: "#ecosystem", label: "Features" },
  { href: "#safety", label: "Safety" },
  { href: "#communities", label: "Communities" },
  { href: "#match", label: "Match" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "/colleges", label: "Colleges" },
  { href: "/about", label: "About" },
];

export function LandingNavbar({ isAuthenticated = false }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4 pt-3 sm:px-6">
      {/* ─── Top Live Pilot Ticker Pill ─── */}
      <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 backdrop-blur-md transition-all hover:bg-blue-500/15 shadow-2xs">
        <span className="flex size-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="flex items-center gap-1 font-semibold">
          <Rocket className="size-3.5 text-blue-500" />
          Piloted at BIT Mesra
        </span>
        <span className="hidden text-muted-foreground/60 sm:inline">•</span>
        <span className="hidden text-muted-foreground sm:inline">
          Expanding across 1,350+ campuses in India
        </span>
        <Link
          href="/colleges"
          className="ml-1 inline-flex items-center font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Check Hub <ArrowRight className="ml-0.5 size-3" />
        </Link>
      </div>

      {/* ─── Main Floating Navbar Pill ─── */}
      <div className="flex h-14 w-full max-w-6xl items-center justify-between rounded-full border border-zinc-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0E131F]/90 px-4 sm:px-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all">
        {/* Left: Brand Logo with Verified Badge */}
        <div className="flex items-center gap-2">
          <BrandLogo size="sm" href="/" />
          <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 sm:inline-flex">
            <CheckCircle2 className="size-3" /> Verified
          </span>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link
              href="/app"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-xs"
              )}
            >
              Enter Campus <ArrowRight className="ml-1 size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/handler/sign-in"
                className="hidden rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              >
                Sign In
              </Link>
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-xs transition-all hover:shadow-[0_4px_16px_rgba(0,145,255,0.3)]"
                )}
              >
                Join CampusLoop
              </Link>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu Drawer ─── */}
      {mobileMenuOpen && (
        <div className="mt-2 w-full max-w-6xl rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0E131F]/95 p-4 shadow-xl backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
              <Link
                href="/aspirants"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10"
              >
                <span>Aspirants Viewer Mode</span>
                <Sparkles className="size-3.5" />
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/handler/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-center text-sm font-semibold text-muted-foreground hover:bg-muted/60"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
