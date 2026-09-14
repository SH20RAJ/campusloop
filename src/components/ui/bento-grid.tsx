"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BentoItem {
  id?: string;
  title: string;
  description: string;
  icon: ReactNode;
  status?: string;
  tags?: string[];
  meta?: string;
  cta?: string;
  ctaHref?: string;
  colSpan?: 1 | 2 | 3;
  hasPersistentHover?: boolean;
  contentNode?: ReactNode;
  accentColor?: "blue" | "purple" | "emerald" | "amber" | "rose";
}

interface BentoGridProps {
  items: BentoItem[];
  className?: string;
}

export function BentoGrid({ items, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 w-full", className)}>
      {items.map((item, index) => {
        const colClass =
          item.colSpan === 3
            ? "md:col-span-3"
            : item.colSpan === 2
            ? "md:col-span-2"
            : "col-span-1";

        return (
          <div
            key={item.id || index}
            className={cn(
              "group relative p-6 rounded-2xl overflow-hidden transition-all duration-300",
              "border border-border/60 dark:border-white/10 bg-card/70 dark:bg-card/40 backdrop-blur-md",
              "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(29,155,240,0.08)]",
              "hover:-translate-y-1 will-change-transform flex flex-col justify-between",
              colClass,
              item.hasPersistentHover && "shadow-[0_8px_30px_rgb(0,0,0,0.08)] -translate-y-1"
            )}
          >
            {/* Ambient Radial Gradient on Hover */}
            <div
              className={cn(
                "absolute inset-0 pointer-events-none transition-opacity duration-500",
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(29,155,240,0.12),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:6px_6px]" />
            </div>

            {/* Top Row: Icon & Status / Meta */}
            <div className="relative z-10 flex items-center justify-between gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/80 border border-border/40 text-foreground group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
                {item.icon}
              </div>

              <div className="flex items-center gap-2">
                {item.meta && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {item.meta}
                  </span>
                )}
                {item.status && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    {item.status}
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Title, Description, and Optional Custom Content */}
            <div className="relative z-10 space-y-2 mb-4 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>

              {item.contentNode && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  {item.contentNode}
                </div>
              )}
            </div>

            {/* Bottom Row: Tags & CTA */}
            <div className="relative z-10 flex items-center justify-between pt-3 border-t border-border/30 mt-auto">
              <div className="flex flex-wrap items-center gap-1.5">
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-muted/60 text-muted-foreground border border-border/30 hover:text-foreground transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {item.cta && (
                item.ctaHref ? (
                  <Link
                    href={item.ctaHref}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>{item.cta}</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                )
              )}
            </div>

            {/* Subtle Perimeter Border Highlight on Hover */}
            <div
              className={cn(
                "absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-primary/20 to-transparent transition-opacity duration-300 pointer-events-none",
                item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
