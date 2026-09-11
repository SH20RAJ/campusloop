import type { Metadata } from "next";
import { Suspense } from "react";
import CollegesClient from "./colleges-client";

export const metadata: Metadata = {
  title: "Campus Directory & Colleges",
  description:
    "Browse, search, and explore 1,350+ verified college hubs and student communities across Indian universities.",
  keywords: [
    "Indian College Directory",
    "College Hubs India",
    "Engineering Colleges",
    "Medical Colleges",
    "Campus Directory",
    "Verified Student Communities",
  ],
  alternates: { canonical: "https://campusloop.space/app/colleges" },
  openGraph: {
    title: "Campus Directory & Colleges",
    description: "Browse and search over 1,350+ verified colleges in India on CampusLoop.",
    url: "https://campusloop.space/app/colleges",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-colleges.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop College Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1,350+ Indian Colleges & Universities Directory | CampusLoop",
    description:
      "Explore campus feeds, verified student networks, and academic resources for 1,350+ Indian colleges.",
    images: ["https://campusloop.space/og-colleges.png"],
  },
  robots: { index: true, follow: true },
};

export default function CollegesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indian College Directory & Campus Hubs",
    url: "https://campusloop.space/app/colleges",
    description: "Directory of 1,350+ accredited Indian universities and colleges on the CampusLoop network.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop Inc.",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <CollegesClient />
      </Suspense>
    </>
  );
}
