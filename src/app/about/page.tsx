import { Metadata } from "next";
import { AboutClient } from "@/components/about-client";

export const metadata: Metadata = {
  title: "About Us | CampusLoop",
  description:
    "Learn more about CampusLoop — the verified student-only campus social network built for 1,350+ Indian universities and colleges.",
  keywords: [
    "About CampusLoop",
    "CampusLoop Mission",
    "Verified Student Network",
    "College Social Network India",
    "Student Community Platform",
  ],
  alternates: { canonical: "https://campusloop.space/about" },
  openGraph: {
    title: "About Us | CampusLoop",
    description: "Learn more about CampusLoop — the verified student-only campus social network.",
    url: "https://campusloop.space/about",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | CampusLoop",
    description: "Learn more about CampusLoop — the verified student-only campus social network.",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About CampusLoop",
    url: "https://campusloop.space/about",
    description:
      "CampusLoop is the verified student-only social network connecting university students across 1,350+ institutions in India.",
    mainEntity: {
      "@type": "Organization",
      name: "CampusLoop Inc.",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
      sameAs: ["https://x.com/campusloop", "https://instagram.com/campusloop"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
