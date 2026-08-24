import type { Metadata } from "next";
import { DiscoverFeed } from "./discover-feed";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Discover Campuses Across India | CampusLoop",
    description: "Explore trending posts, confessions, and student vibes from colleges across India.",
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
      <DiscoverFeed />
    </>
  );
}
