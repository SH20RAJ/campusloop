"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface MinimalLandingNavbarProps {
  isAuthenticated?: boolean;
}

export function MinimalLandingNavbar({ isAuthenticated = false }: MinimalLandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Campus", href: "/colleges" },
    { label: "Academics", href: "/app/academics" },
    { label: "Communities", href: "/app/communities" },
    { label: "Aspirants", href: "/aspirants" },
  ];

  return (
    <header className="relative z-50 border-b border-border bg-background/95">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="CampusLoop home">
          <span className="grid size-9 place-items-center rounded-xl bg-foreground text-sm font-black text-background">
            C
          </span>
          <span className="text-[15px] font-black tracking-tight text-foreground">CampusLoop</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 sm:flex">
          <ThemeToggle />
          <Link
            href="/app"
            className="inline-flex h-10 items-center rounded-xl border border-border bg-background px-4 text-xs font-bold text-foreground transition hover:bg-muted"
          >
            {isAuthenticated ? "Open Campus" : "Join Campus"}
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-9 place-items-center rounded-xl border border-border bg-background text-muted-foreground transition hover:text-foreground"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col px-5 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-2 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-sm font-bold text-background"
            >
              {isAuthenticated ? "Open Campus" : "Join Campus"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
