import type { Metadata } from "next";
import { DocsHubClient } from "@/components/docs/docs-hub-client";
import { CTABand, MarketingFooter, MarketingHeader, SectionHeading } from "@/components/marketing/system";
import { hexclaveServerApp } from "@/hexclave/server";
import { DOCS_FEATURES } from "@/lib/docs-features";

export const metadata: Metadata = {
  title: "Feature Docs — How Every Part of CampusLoop Works",
  description:
    "Plain-English explainers for every CampusLoop feature: campus feed, anonymous confessions, polls, campus match, secret crush, stories, marketplace, academics vault, time capsule, Loop Points, communities, and verification safety.",
  keywords: [
    "CampusLoop docs",
    "CampusLoop features",
    "how CampusLoop works",
    "anonymous confessions explained",
    "campus match explained",
    "student marketplace guide",
  ],
  alternates: { canonical: "https://campusloop.space/docs" },
  openGraph: {
    title: "CampusLoop Docs — Every Feature, Explained",
    description:
      "Twelve plain-English explainers covering the feed, confessions, match, marketplace, academics, safety, and more.",
    url: "https://campusloop.space/docs",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop feature documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Docs — Every Feature, Explained",
    description:
      "Twelve plain-English explainers covering the feed, confessions, match, marketplace, and more.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function DocsHubPage() {
  const user = await hexclaveServerApp.getUser();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CampusLoop Feature Documentation",
    url: "https://campusloop.space/docs",
    description: "Plain-English explainers for every CampusLoop feature.",
    publisher: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: DOCS_FEATURES.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: f.title,
        url: `https://campusloop.space/docs/${f.slug}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingHeader isAuthenticated={!!user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-20">
          <SectionHeading
            eyebrow="Documentation"
            title="Every feature, explained in plain English."
            lede="Twelve short explainers — the problem each feature solves, how it works, and why it is built this way. Written for students, parents, and campus partners."
          />
          <DocsHubClient features={DOCS_FEATURES} />
        </main>
        <CTABand
          title="Read the theory. Then see it live."
          lede="Every feature below is running on real campuses today, gated by college email."
          primaryHref={user ? "/app" : "/handler/sign-up"}
          primaryLabel={user ? "Open app" : "Get verified"}
          secondaryHref="/colleges"
          secondaryLabel="Browse colleges"
        />
        <MarketingFooter />
      </div>
    </>
  );
}
