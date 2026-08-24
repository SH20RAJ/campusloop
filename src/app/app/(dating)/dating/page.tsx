import { Metadata } from "next";
import { DatingAppClient } from "./dating-app-client";

export const metadata: Metadata = {
  title: "Campus Match & Dating | CampusLoop",
  description:
    "Swipe to connect with verified college students. Filter by college, department, and shared passions in a safe, student-only environment.",
  keywords: [
    "Campus Dating",
    "College Matchmaking",
    "Verified Student Dating",
    "Campus Match India",
    "College Swipe Deck",
  ],
  alternates: { canonical: "https://campusloop.space/app/dating" },
  openGraph: {
    title: "Campus Match & Dating | CampusLoop",
    description: "Connect with verified college students in a safe, student-only environment.",
    url: "https://campusloop.space/app/dating",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Match & Dating | CampusLoop",
    description: "Connect with verified college students in a safe, student-only environment.",
  },
  robots: { index: true, follow: true },
};

export default function DatingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CampusLoop Campus Match",
    url: "https://campusloop.space/app/dating",
    applicationCategory: "SocialNetworkingApplication",
    description:
      "Verified student matchmaking deck with campus filters and instant messaging.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DatingAppClient />
    </>
  );
}
