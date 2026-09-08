import type { Metadata } from "next";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Campus Events, Hackathons & College Fests",
  description:
    "Discover hackathons, technical workshops, college cultural fests, coding competitions, and campus meetups across 1,350+ Indian universities. Register solo or in teams on CampusLoop.",
  keywords: [
    "Campus Events",
    "College Hackathons India",
    "College Cultural Fests",
    "Technical Symposium",
    "Coding Competitions",
    "Student Meetups",
    "CampusLoop Events",
  ],
  alternates: { canonical: "https://campusloop.space/app/events" },
  openGraph: {
    title: "Campus Events, Hackathons & College Fests | CampusLoop",
    description:
      "Join hackathons, tech bootcamps, and college fests with verified students from your campus and across India.",
    url: "https://campusloop.space/app/events",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus Events & Hackathons",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Events, Hackathons & College Fests | CampusLoop",
    description:
      "Join hackathons, tech bootcamps, and college fests with verified students from your campus and across India.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function EventsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Indian College Events & Campus Hackathons",
    url: "https://campusloop.space/app/events",
    description:
      "Curated schedule of hackathons, workshops, and college cultural fests hosted by verified campus clubs across India.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop",
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
      <EventsClient />
    </>
  );
}
