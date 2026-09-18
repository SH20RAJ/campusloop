import type { Metadata } from "next";
import { CleanCTA } from "@/components/landing/clean-cta";
import { CleanFAQ } from "@/components/landing/clean-faq";
import { CleanFeatures } from "@/components/landing/clean-features";
import { CleanFooter } from "@/components/landing/clean-footer";
import { CleanHero } from "@/components/landing/clean-hero";
import { CleanWorkflow } from "@/components/landing/clean-workflow";
import { InteractiveShowcase } from "@/components/landing/interactive-showcase";
import { MinimalLandingNavbar } from "@/components/landing/minimal-landing-navbar";
import { hexclaveServerApp } from "@/hexclave/server";

const SITE_URL = "https://campusloop.space";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "CampusLoop | Verified Campus Community for Indian College Students",
  description:
    "CampusLoop connects verified college students with campus conversations, anonymous posts, communities, events, and academic notes & PYQs.",
  applicationName: "CampusLoop",
  authors: [{ name: "CampusLoop Team", url: `${SITE_URL}/about` }],
  keywords: [
    "CampusLoop",
    "campus social network India",
    "verified student network",
    "college community India",
    "college confessions",
    "campus communities",
    "college notes",
    "college PYQs",
    "college events",
    "Indian college directory",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    title: "CampusLoop | Verified Campus Community",
    description:
      "Conversations, communities, events, notes and PYQs for verified college students in India.",
    url: SITE_URL,
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CampusLoop — Verified campus community for Indian college students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Verified Campus Community",
    description:
      "Conversations, communities, events, notes and PYQs for verified college students in India.",
    creator: "@mycampusloop",
    images: [`${SITE_URL}/og-image.png`],
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
        "@id": `${SITE_URL}/#organization`,
        name: "CampusLoop",
        url: SITE_URL,
        logo: `${SITE_URL}/icons/icon-512x512.png`,
        sameAs: [
          "https://www.instagram.com/campusloop.space/",
          "https://www.linkedin.com/company/mycampusloop/",
          "https://x.com/mycampusloop",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "CampusLoop",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-IN",
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#software`,
        name: "CampusLoop",
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        inLanguage: "en-IN",
        description:
          "Campus community platform for verified college students in India with conversations, communities, events and academic resources.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I join my campus?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Create an account with your institutional college email. CampusLoop checks the university domain and connects you to the appropriate campus hub.",
            },
          },
          {
            "@type": "Question",
            name: "Can I post anonymously?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. CampusLoop supports anonymous posting for eligible campus conversations, so the public post does not need to expose your student identity.",
            },
          },
          {
            "@type": "Question",
            name: "What if my college is not listed?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Use the Colleges Directory to find your university or request a new campus hub.",
            },
          },
          {
            "@type": "Question",
            name: "What can I find in Academics?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The academic vault can contain lecture notes, module resources, previous-year question papers, lab manuals, playlists and other student-contributed study material.",
            },
          },
          {
            "@type": "Question",
            name: "Does it cost anything to join?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CampusLoop is free for verified students.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="campusloop-landing flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MinimalLandingNavbar isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        <CleanHero isAuthenticated={isAuthenticated} />
        <InteractiveShowcase />
        <CleanFeatures />
        <CleanWorkflow />
        <CleanFAQ />
        <CleanCTA isAuthenticated={isAuthenticated} />
      </main>

      <CleanFooter />
    </div>
  );
}
