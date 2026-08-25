import { Metadata } from "next";
import CollegesClient from "./colleges-client";

export const metadata: Metadata = {
  title: "Campus Directory & Colleges | CampusLoop",
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
  alternates: { canonical: "https://campusloop.space/colleges" },
  openGraph: {
    title: "Campus Directory & Colleges | CampusLoop",
    description: "Browse and search over 1,350+ verified colleges in India on CampusLoop.",
    url: "https://campusloop.space/colleges",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus Directory & Colleges | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Directory & Colleges | CampusLoop",
    description: "Browse and search over 1,350+ verified colleges in India on CampusLoop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};


export default function CollegesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indian College Directory & Campus Hubs",
    url: "https://campusloop.space/colleges",
    description:
      "Directory of 1,350+ accredited Indian universities and colleges on the CampusLoop network.",
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
      <CollegesClient />
    </>
  );
}
