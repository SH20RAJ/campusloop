"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";
import { InstagramIcon, LinkedinIcon, XIcon } from "@/components/ui/social-icons";
import { SOCIAL_LINKS } from "@/constants/socials";

const FOOTER_NAV = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Overview" },
      { href: "#ecosystem", label: "Campus Feed" },
      { href: "#communities", label: "Clubs & Societies" },
      { href: "#match", label: "Match Mode (18+)" },
      { href: "#marketplace", label: "Hostel Market" },
      { href: "/aspirants", label: "Aspirant Portal" },
    ],
  },
  {
    title: "Campuses",
    links: [
      { href: "/colleges", label: "Colleges Directory" },
      { href: "/colleges/bit-mesra", label: "BIT Mesra Hub" },
      { href: "/colleges/iit-delhi", label: "IIT Delhi Hub" },
      { href: "/colleges/bits-pilani", label: "BITS Pilani Hub" },
      { href: "/colleges", label: "Request Your College" },
    ],
  },
  {
    title: "Trust & Legal",
    links: [
      { href: "/safety", label: "Safety & Privacy" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "#safety", label: "DPDP 2023 Compliance" },
      { href: "/overview", label: "Platform Architecture" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/pitch", label: "Investor Pitch & Press" },
      { href: "/contact", label: "Campus Ambassadors" },
      { href: "/contact", label: "Contact Team" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-[#080C14] text-foreground">
      {/* ─── Investor & Campus Ambassador Expansion Band ─── */}
      <div className="border-b border-border/50 py-8 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Lead CampusLoop at your university
              </p>
              <p className="text-xs text-muted-foreground">
                Apply for the Campus Lead Fellowship. Launch your college hub, curate
                student moderators, and earn leadership grants.
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-xs"
          >
            Apply to be Campus Lead &rarr;
          </Link>
        </div>
      </div>

      {/* ─── Main Footer Columns ─── */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-5 gap-8 px-4 sm:px-6 py-12">
        <div className="col-span-2 md:col-span-1 space-y-3">
          <BrandLogo size="sm" href="/" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Verified Campus Social Layer. Strictly for verified college
            students across India.
          </p>

          {/* Social Links (Instagram -> LinkedIn -> X) */}
          <div className="flex items-center gap-2 pt-2">
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:text-pink-500 hover:border-pink-500/40"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:text-blue-500 hover:border-blue-500/40"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="size-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.x.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/40"
              aria-label="X"
            >
              <XIcon className="size-3" />
            </a>
          </div>
        </div>

        {FOOTER_NAV.map((group) => (
          <div key={group.title} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {group.title}
            </h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ─── Bottom Copyright Bar ─── */}
      <div className="border-t border-border/50 py-6 px-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CampusLoop Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <span>•</span>
            <Link href="/safety" className="hover:text-foreground">
              Safety Shield
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
