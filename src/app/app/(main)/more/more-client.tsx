"use client";

import { ArrowLeft, ChevronRight, ExternalLink, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/ui/social-icons";
import { MORE_HUB_SECTIONS } from "@/constants/navigation";
import { SOCIAL_LINKS } from "@/constants/socials";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

interface MoreClientProps {
  isAdmin?: boolean;
}

export function MoreClient({ isAdmin: propIsAdmin }: MoreClientProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const isAdmin = propIsAdmin ?? profile?.role === "ADMIN";

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
            <h1 className="text-base font-black text-foreground tracking-tight">More on CampusLoop</h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Explore secondary features, directories, socials &amp; settings
            </p>
          </div>
        </div>
      </div>

      {/* ─── Highlighted Official Social Channels ─── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3 text-pink-500" /> Official Social Channels
          </h2>
          <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
            Priority: Insta → LinkedIn → X
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Highlighted Instagram Card */}
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-3xl border-2 border-pink-500/40 bg-linear-to-r from-pink-500/15 via-rose-500/10 to-amber-500/10 hover:border-pink-500 transition-all shadow-md group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-linear-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform shrink-0">
                  <InstagramIcon className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-foreground group-hover:text-pink-500 transition-colors">
                      Instagram
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500 text-white shadow-xs">
                      🔥 Official Hub
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate font-medium">
                    {SOCIAL_LINKS.instagram.handle} · Campus drops, confessions &amp; reels
                  </p>
                </div>
              </div>
              <ExternalLink className="size-4 text-pink-500 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
            </div>
          </a>

          {/* Secondary Social Channels: LinkedIn & X */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* LinkedIn */}
            <a
              href={SOCIAL_LINKS.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all shadow-2xs group flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <LinkedinIcon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground group-hover:text-blue-500 transition-colors truncate">
                    LinkedIn
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">Startup news &amp; hiring</p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
            </a>

            {/* X (Twitter) */}
            <a
              href={SOCIAL_LINKS.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 hover:border-border transition-all shadow-2xs group flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted/60 text-foreground group-hover:scale-105 transition-transform shrink-0">
                  <XIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors truncate">
                    X (Twitter)
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{SOCIAL_LINKS.x.handle}</p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── Grouped Sections ─── */}
      <div className="space-y-6 pt-2">
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
                        {item.desc && <p className="text-xs text-muted-foreground truncate">{item.desc}</p>}
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
                    <p className="text-xs text-muted-foreground">
                      Manage reports, content &amp; campus audit logs
                    </p>
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
