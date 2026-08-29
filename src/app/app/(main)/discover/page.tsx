import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverFeed } from "./discover-feed";
import DiscoverLoading from "./loading";

export const metadata: Metadata = {
  title: "Discover Campuses Across India | CampusLoop",
  description:
    "Explore trending posts, confessions, and questions from verified students across every college on CampusLoop — switch between your campus loop and all of India.",
  keywords: [
    "Discover Indian Campuses",
    "All India Campus Feed",
    "Cross-College Discussions",
    "College Feed India",
  ],
  alternates: { canonical: "https://campusloop.space/app/discover" },
  openGraph: {
    title: "Discover Campuses Across India | CampusLoop",
    description: "Explore trending posts, confessions, and student vibes from colleges across India.",
    url: "https://campusloop.space/app/discover",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Discover Campuses Across India | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Campuses Across India | CampusLoop",
    description: "Explore trending posts, confessions, and student vibes from colleges across India.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};


export default function DiscoverPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Discover Indian Campuses",
    url: "https://campusloop.space/app/discover",
    description: "Explore trending campus discussions across Indian universities on CampusLoop.",
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
      <Suspense fallback={<DiscoverLoading />}>
        <DiscoverFeed />
      </Suspense>
    </>
  );
}
