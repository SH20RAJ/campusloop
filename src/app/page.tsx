import type { Metadata } from "next";
import { CampusProblemSection } from "@/components/landing/campus-problem-section";
import { FinalCTASection } from "@/components/landing/final-cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFAQSection } from "@/components/landing/landing-faq-section";
import { ProductShowcaseSection } from "@/components/landing/product-showcase-section";
import { TractionSection } from "@/components/landing/traction-section";
import { VerifiedIdentitySection } from "@/components/landing/verified-identity-section";
import { ViewerModeSection } from "@/components/landing/viewer-mode-section";
import { WhyVerifiedSection } from "@/components/landing/why-verified-section";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { hexclaveServerApp } from "@/hexclave/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.space"),
  title: "CampusLoop — The Verified Campus Social Network for India",
  description:
    "CampusLoop is a verified student network for Indian colleges. Connect with classmates, join campus communities, speak anonymously, discover people, and explore campus life.",
  applicationName: "CampusLoop",
  authors: [{ name: "CampusLoop Team", url: "https://campusloop.space/about" }],
  generator: "Next.js",
  keywords: [
    "campus social network",
    "verified college students",
    "college confessions",
    "campus communities",
    "student marketplace",
    "BIT Mesra",
    "Indian universities",
    "campus discussions",
    "peer notes",
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
    title: "CampusLoop — The Verified Campus Social Network for India",
    description:
      "Your campus, finally on its own network. Connect with classmates, join campus communities, speak anonymously, and find your people without random outsiders.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop — The Verified Campus Social Network for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — The Verified Campus Social Network for India",
    description:
      "Your campus, finally on its own network. Connect with classmates, join campus communities, speak anonymously, and find your people without random outsiders.",
    creator: "@mycampusloop",
    images: ["https://campusloop.space/opengraph-image.png"],
  },
};

export default async function LandingPage() {
  const user = await hexclaveServerApp.getUser();
  const isAuthenticated = !!user;

  return (
    <>
      {/* ─── Structured Data (JSON-LD) for Search Engines ─── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
                  "Verified student-only campus social network for Indian colleges. Connect with classmates, join campus communities, speak anonymously, and explore campus life.",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "INR",
                },
              },
            ],
          }),
        }}
      />

      <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-clip">
        {/* Navigation Bar */}
        <MarketingHeader isAuthenticated={isAuthenticated} />

        {/* 01. Hero Section */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* 02. The Campus Problem */}
        <CampusProblemSection />

        {/* 03. Verified Identity & Accountable Anonymity */}
        <VerifiedIdentitySection />

        {/* 04. How CampusLoop Works */}
        <HowItWorksSection />

        {/* 05. Product Showcase (Modular Architecture) */}
        <ProductShowcaseSection />

        {/* 06. Viewer Mode (Aspirant Acquisition Funnel) */}
        <ViewerModeSection />

        {/* 07. Why Verified? (Comparison Table) */}
        <WhyVerifiedSection />

        {/* 08. Honest Pilot Traction & Campus Expansion */}
        <TractionSection />

        {/* 09. Frequently Asked Questions */}
        <LandingFAQSection />

        {/* 10. Final Call to Action */}
        <FinalCTASection isAuthenticated={isAuthenticated} />

        {/* Footer */}
        <MarketingFooter />
      </div>
    </>
  );
}
