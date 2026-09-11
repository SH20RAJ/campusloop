"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const COMPANY_TABS = [
  { href: "/about", label: "About" },
  { href: "/overview", label: "Overview" },
  { href: "/products", label: "Products" },
  { href: "/demo", label: "Demo" },
  { href: "/safety", label: "Safety" },
  { href: "/pitch", label: "Pitch" },
];

/**
 * Underlined tab strip across the company, product, and evaluation documentation pages.
 * Sits below the fixed 4rem MarketingHeader.
 */
export function CompanyNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 mt-16 border-b border-border/50 bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-5 sm:px-8 scrollbar-none">
        {COMPANY_TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 border-b-2 px-3.5 py-3.5 text-[13.5px] transition-colors cursor-pointer",
                isActive
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
