"use client";

import { BadgeCheck, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface MinimalLandingNavbarProps {
  isAuthenticated?: boolean;
}

export function MinimalLandingNavbar({ isAuthenticated = false }: MinimalLandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Campus Feed", href: "/app" },
    { label: "Colleges Directory", href: "/colleges" },
    { label: "Academics & PYQs", href: "/app/academics" },
    { label: "For Aspirants", href: "/aspirants" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-xs transition-transform group-hover:scale-105">
            C
          </div>
          <span className="font-bold tracking-tight text-foreground text-base">CampusLoop</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BadgeCheck className="size-3" />
            Verified
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA & Controls */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={isAuthenticated ? "/app" : "/app"}
            className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-all active:scale-95"
          >
            {isAuthenticated ? "Go to Feed →" : "Enter Campus →"}
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex size-8 items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border/40 bg-background px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 border-t border-border/30">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full h-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-xs"
            >
              {isAuthenticated ? "Go to Feed →" : "Enter Campus →"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
