"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft, FileText, Lock, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LEGAL_TABS = [
  { href: "/privacy", label: "Privacy Policy", icon: Lock },
  { href: "/terms", label: "Terms of Service", icon: FileText },
  { href: "/safety", label: "Campus Safety", icon: ShieldCheck },
  { href: "/contact", label: "Contact & Grievance", icon: MessageSquare },
];

export function LegalNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 h-12 overflow-x-auto scrollbar-none gap-2">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 mr-2"
        >
          <ArrowLeft className="size-3.5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-1">
          {LEGAL_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
                  isActive
                    ? "bg-foreground text-background font-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
