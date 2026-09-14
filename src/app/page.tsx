import type { Metadata } from "next";
import { CampusHubSection } from "@/components/landing/campus-hub-section";
import { ClosingCTA } from "@/components/landing/closing-cta";
import { CommunitiesShowcase } from "@/components/landing/communities-showcase";
import { EcosystemBento } from "@/components/landing/ecosystem-bento";
import { LandingFAQSection } from "@/components/landing/faq-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LeaderboardRivalrySection } from "@/components/landing/leaderboard-rivalry-section";
import { MarketplaceSection } from "@/components/landing/marketplace-section";
import { MatchModeSection } from "@/components/landing/match-mode-section";
import { PhilosophySection } from "@/components/landing/philosophy-section";
import { SafetySection } from "@/components/landing/safety-section";
import { ThreeModesSection } from "@/components/landing/three-modes-section";
import { VerifiedAnonymitySection } from "@/components/landing/verified-anonymity-section";
import { hexclaveServerApp } from "@/hexclave/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.space"),
  title: "CampusLoop — The Verified Campus Social Layer",
  description:
    "CampusLoop is the verified student-only campus social network for Indian universities. Gated strictly by institutional email domains (.ac.in / .edu.in). Drop confessions anonymously, vote on live polls, trade dorm gear, and find study circles.",
  applicationName: "CampusLoop",
  authors: [{ name: "CampusLoop Team", url: "https://campusloop.space/about" }],
  generator: "Next.js",
  keywords: [
    "campus social layer",
    "verified student network",
    "college confessions anonymous",
    "campus communities India",
    "hostel marketplace",
    "college campus hub",
    "Indian universities social network",
    "campus polls",
    "peer notes and PYQs",
    "BIT Mesra campus loop",
    "IIT confessions",
    "BITS Pilani student network",
  ],
  referrer: "origin-when-cross-origin",
  creator: "CampusLoop Inc.",
  publisher: "CampusLoop Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://campusloop.space",
    types: {
      "application/rss+xml": "https://campusloop.space/feed.xml",
    },
  },
  openGraph: {
    title: "CampusLoop — The Verified Campus Social Layer",
    description:
      "Your campus has a social layer now. Gated strictly by official college email. Anonymous confessions with identity escrow, uncheatable polls, hostel marketplace, and verified communities.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop — The Verified Campus Social Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — The Verified Campus Social Layer",
    description:
      "Your campus has a social layer now. Verified student-only network across 1,350+ Indian colleges.",
    creator: "@mycampusloop",
    images: ["https://campusloop.space/opengraph-image.png"],
  },
};

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();
  const isAuthenticated = !!user;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://campusloop.space/#organization",
        name: "CampusLoop",
        url: "https://campusloop.space",
        logo: "https://campusloop.space/icons/icon-512x512.png",
        sameAs: [
          "https://www.instagram.com/campusloop.space/",
          "https://www.linkedin.com/company/mycampusloop/",
          "https://x.com/mycampusloop",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://campusloop.space/#website",
        url: "https://campusloop.space",
        name: "CampusLoop",
        publisher: { "@id": "https://campusloop.space/#organization" },
        inLanguage: "en-IN",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://campusloop.space/#software",
        name: "CampusLoop",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web, iOS, Android (PWA)",
        inLanguage: "en-IN",
        description:
          "Verified student-only campus social network for Indian colleges. Anonymous confessions with identity escrow, polls, communities, and hostel marketplace.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://campusloop.space/#breadcrumb",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://campusloop.space",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Colleges Directory",
            item: "https://campusloop.space/colleges",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "For Aspirants",
            item: "https://campusloop.space/aspirants",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://campusloop.space/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Can my professors, HODs, or college administration see who posted anonymously?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. CampusLoop is an independent student platform built with cryptographic identity escrow. Anonymous confessions store zero foreign-key references to your student profile in public query layers.",
            },
          },
          {
            "@type": "Question",
            name: "What if my college email isn't on the supported list yet?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can request your university hub in 30 seconds via the Colleges Directory or domain checker tool. If you have an active .ac.in or .edu.in domain, our system automatically provisions your campus hub once 5 students verify interest.",
            },
          },
          {
            "@type": "Question",
            name: "Is CampusLoop completely free for students?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, 100% free for verified college students forever.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* ─── Structured Data (JSON-LD) for Search Engines ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-clip selection:bg-blue-500/20 selection:text-blue-600">
        {/* SECTION 01: Floating Glass Navigation Bar */}
        <LandingNavbar isAuthenticated={isAuthenticated} />

        <main className="flex-1">
          {/* SECTION 02 & 03: Hero Section & Hero Product UI Mockup */}
          <HeroSection isAuthenticated={isAuthenticated} />

          {/* SECTION 04: One Campus. One Place. Ecosystem Bento */}
          <EcosystemBento />

          {/* SECTION 05: Verified + Anonymous Flow */}
          <VerifiedAnonymitySection />

          {/* SECTION 06: Three Modes Architecture */}
          <ThreeModesSection />

          {/* SECTION 07: Security, Trust & DPDP Act 2023 Compliance */}
          <SafetySection />

          {/* SECTION 08: Communities Showcase */}
          <CommunitiesShowcase />

          {/* SECTION 09: Match Mode (18+) */}
          <MatchModeSection />

          {/* SECTION 10: Campus Hub & Daily Utilities */}
          <CampusHubSection />

          {/* SECTION 11: Campus Marketplace */}
          <MarketplaceSection />

          {/* SECTION 12: Loop Points & Campus Leaderboard */}
          <LeaderboardRivalrySection />

          {/* SECTION 13: Product Philosophy */}
          <PhilosophySection />

          {/* SECTION 14: Frequently Asked Questions Accordion */}
          <LandingFAQSection />

          {/* SECTION 15: Final Closing Call to Action */}
          <ClosingCTA isAuthenticated={isAuthenticated} />
        </main>

        {/* SECTION 16: Premium Minimal Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
