"use client";

import { MORE_HUB_SECTIONS } from "@/constants/navigation";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { ArrowLeft,ChevronRight,Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MoreClientProps {
  isAdmin?: boolean;
}

export function MoreClient({ isAdmin: propIsAdmin }: MoreClientProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const isAdmin = propIsAdmin ?? (profile?.role === "ADMIN");


  return (
    <div className="min-h-screen pb-24 text-foreground select-none max-w-2xl mx-auto px-4 pt-3 space-y-5">
      {/* ─── Sticky Minimal Top Bar ─── */}
      <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-background/85 backdrop-blur-xl border-b border-border/30 px-1 -mx-4 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight">
              More on CampusLoop
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Explore secondary features, directories &amp; settings
            </p>
          </div>
        </div>
      </div>

      {/* ─── Grouped Sections ─── */}
      <div className="space-y-6">
        {MORE_HUB_SECTIONS.map((section) => (
          <div key={section.group} className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
              {section.group}
            </h2>

            <div className="rounded-3xl border border-border/50 bg-card divide-y divide-border/30 overflow-hidden shadow-xs">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/60 text-foreground group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="size-5 text-foreground stroke-2" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">
                            {item.label}
                          </p>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                item.badgeColor || "bg-muted text-muted-foreground border-border/50"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.desc && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.desc}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-destructive px-1">
              Administration
            </h2>
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 overflow-hidden shadow-xs">
              <Link
                href="/admin"
                className="flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive/15 text-destructive shrink-0">
                    <Shield className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-destructive">Admin Moderation Console</p>
                    <p className="text-xs text-muted-foreground">Manage reports, content &amp; campus audit logs</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-destructive/50" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
