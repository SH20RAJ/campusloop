"use client";

import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/ui/social-icons";
import { BETA_HUB_ITEMS, MORE_HUB_SECTIONS } from "@/constants/navigation";
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
  const [isBetaOpen, setIsBetaOpen] = useState(false);

  const coreHubsSection = MORE_HUB_SECTIONS.find((s) => s.group === "Core Campus Hubs");
  const otherSections = MORE_HUB_SECTIONS.filter((s) => s.group !== "Core Campus Hubs");

  return (
    <div className="min-h-screen pb-24 text-foreground select-none max-w-2xl mx-auto px-4 pt-3 space-y-6">
      {/* ─── Sticky Minimal Top Bar ─── */}
      <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-background/85 backdrop-blur-xl border-b border-border/30 -mx-4 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight">More on CampusLoop</h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              Explore campus directories, utilities, communities &amp; socials
            </p>
          </div>
        </div>
      </div>

      {/* ─── ⚡ CORE CAMPUS HUBS (Featured 2x2 Grid) ─── */}
      {coreHubsSection && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3 text-primary" />
              <span>Core Campus Hubs</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {coreHubsSection.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col justify-between p-4 rounded-3xl border border-border/50 bg-card/60 hover:bg-muted/40 hover:border-border transition-all group cursor-pointer shadow-xs relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <AnimatedIcon icon={Icon} animation="pop" size={22} />
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                          item.badgeColor || "bg-muted text-muted-foreground border-border/50"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 min-w-0">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.label}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 🧪 BETA & EXPERIMENTAL HUBS ACCORDION (Space Saving) ─── */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsBetaOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-3xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer shadow-xs select-none group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Zap className="size-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Beta &amp; Experimental Hubs
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {BETA_HUB_ITEMS.length} Labs
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">Marketplace, Random Loop, Capsule &amp; Gaming</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300 transition-colors">
              {isBetaOpen ? "Collapse" : "Expand"}
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-amber-400 transition-transform duration-200",
                isBetaOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {isBetaOpen && (
          <div className="rounded-3xl border border-border/50 bg-card/60 divide-y divide-border/20 overflow-hidden shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            {BETA_HUB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                      <AnimatedIcon icon={Icon} animation="pop" size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {item.label}
                        </p>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                              item.badgeColor || "bg-muted text-muted-foreground border-border/50"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.desc && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── GROUPED SECTIONS (No duplicates) ─── */}
      <div className="space-y-6">
        {otherSections.map((section) => (
          <div key={section.group} className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
              {section.group}
            </h2>

            <div className="rounded-3xl border border-border/50 bg-card/60 divide-y divide-border/20 overflow-hidden shadow-xs">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/60 text-foreground group-hover:scale-105 transition-transform shrink-0">
                        <AnimatedIcon icon={Icon} animation="pop" size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {item.label}
                          </p>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                                item.badgeColor || "bg-muted text-muted-foreground border-border/50"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.desc && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ─── Admin Moderation Console ─── */}
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
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30 shrink-0">
                    <Shield className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground group-hover:text-destructive transition-colors">
                      Admin Moderation Console
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reports, content moderation, keyword triggers &amp; campus analytics
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-foreground shrink-0 ml-2" />
              </Link>
            </div>
          </div>
        )}

        {/* ─── Official Social Media Channels (Instagram highlighted per AGENTS.md rule 10) ─── */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
            Official Channels
          </h2>

          <div className="grid grid-cols-3 gap-2.5">
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 text-pink-400 hover:text-pink-300 transition-all cursor-pointer group shadow-2xs"
            >
              <InstagramIcon className="size-5 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-bold mt-1 text-foreground">Instagram</span>
              <span className="text-[9px] text-pink-400 font-bold">{SOCIAL_LINKS.instagram.handle}</span>
            </a>

            <a
              href={SOCIAL_LINKS.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-all cursor-pointer group shadow-2xs"
            >
              <LinkedinIcon className="size-5 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-bold mt-1 text-foreground">LinkedIn</span>
              <span className="text-[9px] text-blue-400 font-bold">{SOCIAL_LINKS.linkedin.handle}</span>
            </a>

            <a
              href={SOCIAL_LINKS.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-border/50 bg-card hover:bg-muted/40 text-foreground transition-all cursor-pointer group shadow-2xs"
            >
              <XIcon className="size-5 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-bold mt-1 text-foreground">X (Twitter)</span>
              <span className="text-[9px] text-muted-foreground font-bold">{SOCIAL_LINKS.x.handle}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
