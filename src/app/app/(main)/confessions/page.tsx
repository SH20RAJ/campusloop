import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfessionsFeed } from "./confessions-feed";

export const metadata: Metadata = {
  title: "Campus Confessions — 100% Anonymous | CampusLoop",
  description:
    "Read and share anonymous confessions from your college. Identity-sealed with cryptographic pseudonyms — anonymous to peers, safe for the community.",
  keywords: [
    "Campus Confessions",
    "College Anonymous Confessions",
    "Indian College Confessions",
    "Anonymous Student Posts",
    "Campus Secrets",
  ],
  alternates: { canonical: "https://campusloop.space/app/confessions" },
  openGraph: {
    title: "Campus Confessions — 100% Anonymous | CampusLoop",
    description: "Read and share anonymous confessions from your college safely.",
    url: "https://campusloop.space/app/confessions",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus Confessions — 100% Anonymous | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Confessions — 100% Anonymous | CampusLoop",
    description: "Read and share anonymous confessions from your college safely.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};


export default function ConfessionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Campus Confessions Feed",
    url: "https://campusloop.space/app/confessions",
    description: "Cryptographically protected anonymous student confessions feed.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop Inc.",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="p-4 text-center text-xs text-muted-foreground">Loading confessions...</div>}>
        <ConfessionsFeed />
      </Suspense>
    </>
  );
}
