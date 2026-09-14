"use client";

import { FooterEnterprise } from "@/components/ruixen/footer-enterprise";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function CleanFooter() {
  const brandMark = (
    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-xs">
      C
    </div>
  );

  const columns = [
    {
      title: "Campus",
      links: [
        { label: "Campus Feed", href: "/app" },
        { label: "Confessions", href: "/app/confessions" },
        { label: "Campus Stories", href: "/app/stories/new" },
        { label: "Match Mode (18+)", href: "/app/dating" },
      ],
    },
    {
      title: "Academics",
      links: [
        { label: "Notes & PYQs Vault", href: "/app/academics" },
        { label: "Upload Material", href: "/app/academics/upload" },
        { label: "Study Playlists", href: "/app/academics/playlists" },
      ],
    },
    {
      title: "Directory",
      links: [
        { label: "All Indian Campuses", href: "/colleges" },
        { label: "Top Engineering Hubs", href: "/colleges?type=engineering" },
        { label: "Aspirants Portal", href: "/aspirants" },
      ],
    },
    {
      title: "Trust & Safety",
      links: [
        { label: "Verification Guide", href: "/about" },
        { label: "Identity Escrow", href: "/privacy" },
        { label: "DPDP Compliance", href: "/privacy" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Community Guidelines", href: "/guidelines" },
      ],
    },
  ];

  const socials = [
    {
      icon: InstagramIcon,
      href: "https://www.instagram.com/campusloop.space/",
      label: "Instagram (@campusloop.space)",
    },
    {
      icon: LinkedInIcon,
      href: "https://www.linkedin.com/company/mycampusloop/?viewAsMember=true",
      label: "LinkedIn (CampusLoop)",
    },
    {
      icon: XIcon,
      href: "https://x.com/company/mycampusloop/",
      label: "X (@mycampusloop)",
    },
  ];

  const bottomLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Guidelines", href: "/guidelines" },
  ];

  return (
    <FooterEnterprise
      brandMark={brandMark}
      brandName="CampusLoop"
      description="The verified, privacy-first campus social network for Indian university students. Gated strictly by institutional email domains (.ac.in / .edu.in)."
      columns={columns}
      socials={socials}
      bottomLinks={bottomLinks}
      copyright={`© ${new Date().getFullYear()} CampusLoop Inc. All rights reserved. Compliant with Digital Personal Data Protection (DPDP) Act 2023.`}
    />
  );
}
