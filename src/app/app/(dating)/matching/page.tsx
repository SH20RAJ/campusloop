import type { Metadata } from "next";
import { DatingAppClient } from "@/app/app/(dating)/dating/dating-app-client";

export const metadata: Metadata = {
  title: "Campus Match · Friends, Peers & Vibes",
  description:
    "Multipurpose campus matchmaking for verified college students. Connect with batchmates, study partners, soft dating, and campus talk buddies in a safe space.",
  keywords: [
    "Campus Match",
    "College Matchmaking",
    "Verified Student Friends",
    "Campus Study Partners",
    "College Swipe Deck",
    "Campus Romance Soft Dating",
  ],
  alternates: { canonical: "https://campusloop.space/app/matching" },
  openGraph: {
    title: "Campus Match · Verified Student Matchmaking",
    description: "Connect with verified college students for friends, study partners, and vibe matching.",
    url: "https://campusloop.space/app/matching",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Campus Match",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Match · Verified Student Matchmaking",
    description: "Connect with verified college students for friends, study partners, and vibe matching.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function MatchingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CampusLoop Campus Match",
    url: "https://campusloop.space/app/matching",
    applicationCategory: "SocialNetworkingApplication",
    description: "Verified student matchmaking deck with campus filters and instant messaging.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DatingAppClient />
    </>
  );
}
