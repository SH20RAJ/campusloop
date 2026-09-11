import type { Metadata } from "next";
import { DocsHubClient } from "@/components/docs/docs-hub-client";
import { CTABand, MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { hexclaveServerApp } from "@/hexclave/server";
import { DOCS_FEATURES } from "@/lib/docs-features";

export const metadata: Metadata = {
  title: "CampusLoop Engineering Docs — Viral Architecture Teardowns",
  description:
    "Twelve deep-dive engineering essays on how CampusLoop works: anonymous confessions, campus feed ranking, secret crush escrow, ungameable polls, student marketplace, and cryptographic safety.",
  keywords: [
    "CampusLoop docs",
    "CampusLoop architecture",
    "how CampusLoop works",
    "anonymous confessions explained",
    "college social network engineering",
    "BIT Mesra tech stack",
  ],
  alternates: { canonical: "https://campusloop.space/docs" },
  openGraph: {
    title: "CampusLoop Engineering Docs — Viral Architecture Teardowns",
    description:
      "Twelve deep-dive engineering essays on campus networks, accountable anonymity, and cryptographic verification.",
    url: "https://campusloop.space/docs",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop architectural documentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Engineering Docs — Viral Architecture Teardowns",
    description:
      "Twelve deep-dive engineering essays on campus networks, accountable anonymity, and cryptographic verification.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function DocsHubPage() {
  const user = await hexclaveServerApp.getUser();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CampusLoop Architecture & Engineering Documentation",
    url: "https://campusloop.space/docs",
    description: "Twelve deep-dive engineering essays explaining every CampusLoop subsystem.",
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
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 pt-24 sm:pt-32 pb-20 space-y-12">
          {/* Twitter / Grok Publication Heading */}
          <div className="space-y-4 max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
              {"CAMPUSLOOP_ENGINEERING // ARCHITECTURAL_ESSAYS"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
              How CampusLoop works.
              <br />
              <span className="text-muted-foreground font-semibold">Zero marketing fluff.</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Twelve deep-dive engineering teardowns on campus social networks, game theory of accountable
              anonymity, ungameable polling math, and cryptographic institutional verification.
            </p>
          </div>

          <DocsHubClient features={DOCS_FEATURES} />
        </main>

        <CTABand
          title="Read the architecture. Now see it live."
          lede="Every feature detailed here is running on real campuses today, gatekept by university email."
          primaryHref={user ? "/app" : "/handler/sign-up"}
          primaryLabel={user ? "Open campus timeline" : "Get verified"}
          secondaryHref="/colleges"
          secondaryLabel="Explore colleges in viewer mode"
        />
        <MarketingFooter />
      </div>
    </>
  );
}
