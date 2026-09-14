"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface NavbarMinimalProps {
  logo?: React.ReactNode;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string };
  className?: string;
}

export default function NavbarMinimal({
  logo = <span className="font-semibold">Logo</span>,
  links = [
    { label: "Docs", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  cta = { label: "Sign In", href: "#" },
  className,
}: NavbarMinimalProps) {
  return (
    <header className={cn("w-full border-b", className)}>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            {logo}
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href={cta.href}
          className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 transition-all active:scale-95"
        >
          {cta.label}
        </Link>
      </div>
    </header>
  );
}
