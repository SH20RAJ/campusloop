import { Metadata } from "next";
import { OverviewClient } from "./overview-client";

export const metadata: Metadata = {
  title: "Platform Overview & Strategic Architecture | CampusLoop",
  description:
    "Comprehensive overview of CampusLoop's verified campus architecture, market sizing, network density moats, and product layers.",
  keywords: [
    "CampusLoop Overview",
    "Platform Architecture",
    "Student Social Network",
    "Campus Radius",
    "Campus Loop Ecosystem",
  ],
  alternates: { canonical: "https://campusloop.space/overview" },
  openGraph: {
    title: "Platform Overview | CampusLoop",
    description: "Comprehensive overview of CampusLoop's verified campus architecture.",
    url: "https://campusloop.space/overview",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Overview | CampusLoop",
    description: "Comprehensive overview of CampusLoop's verified campus architecture.",
  },
  robots: { index: true, follow: true },
};

export default function OverviewPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Platform Overview",
    url: "https://campusloop.space/overview",
    description:
      "Comprehensive architectural and strategic brief of CampusLoop social network.",
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
      <OverviewClient />
    </>
  );
}
