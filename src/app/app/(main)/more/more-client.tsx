"use client";

import { ArrowLeft, ChevronRight, ExternalLink, FlaskConical, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedIcon, AnimateGraduationCap } from "@/components/ui/animated-icon";
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

      {/* ─── ⚡ FEATURED HERO CARDS: MARKETPLACE BETA & ACADEMIC VAULT ─── */}
      <div className="space-y-2.5">
        {/* Marketplace Beta Card */}
        <Link
          href="/app/marketplace"
          className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-amber-500/40 bg-linear-to-r from-amber-500/10 via-card to-card hover:bg-muted/40 hover:border-amber-500/60 transition-all group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-black font-black shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <FlaskConical className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors truncate">
                  Campus Marketplace
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                  BETA
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Buy, sell &amp; order food from hostel canteens on campus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
              EXPLORE
            </span>
            <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Academic Vault Card — compact on mobile */}
        <Link
          href="/app/academics"
          className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-indigo-500/30 bg-linear-to-r from-indigo-500/8 to-card hover:bg-muted/40 hover:border-indigo-500/50 transition-all group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <AnimatedIcon icon={AnimateGraduationCap} animation="pop" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-400 transition-colors truncate">
                Academic Vault
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                Notes, PPTs, Books, PYQs &amp; peer reviews
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              +20 LP
            </span>
            <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* ─── Official Social Channels (Minimal Monochrome Cards) ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Official Channels
          </h2>
        </div>

        <div className="space-y-2">
          {/* Instagram Card */}
          <a
            href={SOCIAL_LINKS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/40 hover:border-border transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground shrink-0 group-hover:scale-105 transition-transform">
                  <InstagramIcon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Instagram
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/50">
                      @campusloop.space
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Campus drops, confessions &amp; updates
                  </p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0 ml-2" />
            </div>
          </a>

          {/* Secondary Social Channels: LinkedIn & X */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* LinkedIn */}
            <a
              href={SOCIAL_LINKS.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl border border-border/70 bg-card hover:bg-muted/40 hover:border-border transition-all group flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground shrink-0 group-hover:scale-105 transition-transform">
                  <LinkedinIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    LinkedIn
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">CampusLoop</p>
                </div>
              </div>
              <ExternalLink className="size-3 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
            </a>

            {/* X (Twitter) */}
            <a
              href={SOCIAL_LINKS.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl border border-border/70 bg-card hover:bg-muted/40 hover:border-border transition-all group flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-foreground shrink-0 group-hover:scale-105 transition-transform">
                  <XIcon className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    X (Twitter)
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{SOCIAL_LINKS.x.handle}</p>
                </div>
              </div>
              <ExternalLink className="size-3 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── Grouped Sections ─── */}
      <div className="space-y-6 pt-2">
        {MORE_HUB_SECTIONS.map((section) => {
          const isBeta = section.group.toLowerCase().includes("beta");

          return (
            <div key={section.group} className="space-y-2">
              {isBeta ? (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5.5 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      <FlaskConical className="size-3.5" />
                    </span>
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                      {section.group}
                    </h2>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                    Early Access
                  </span>
                </div>
              ) : (
                <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
                  {section.group}
                </h2>
              )}

              {isBeta && (
                <p className="text-[11px] text-muted-foreground px-1 -mt-0.5 pb-0.5">
                  Experimental features actively in development. Try them out and help us test!
                </p>
              )}

              <div
                className={cn(
                  "rounded-3xl border divide-y overflow-hidden shadow-xs",
                  isBeta
                    ? "border-amber-500/30 bg-card divide-border/30"
                    : "border-border/50 bg-card divide-border/30"
                )}
              >
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
          );
        })}

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
