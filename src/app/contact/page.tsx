import type { Metadata } from "next";
import { ContactClient } from "./contact-client";

export const metadata: Metadata = {
  title: "Contact Support & Grievance Redressal | CampusLoop",
  description:
    "Get in touch with CampusLoop support, campus partnership desk, safety compliance, or the designated Grievance Officer under IT Rules 2021.",
  keywords: [
    "Contact CampusLoop",
    "CampusLoop Support",
    "Grievance Officer India",
    "Campus Partnership",
    "College Domain Whitelist",
  ],
  alternates: { canonical: "https://campusloop.space/contact" },
  openGraph: {
    title: "Contact Support & Grievance Redressal | CampusLoop",
    description: "Get in touch with CampusLoop support, safety compliance, and partnerships.",
    url: "https://campusloop.space/contact",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact Support & Grievance Redressal | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Support & Grievance Redressal | CampusLoop",
    description: "Get in touch with CampusLoop support, safety compliance, and partnerships.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact CampusLoop Support & Grievance Redressal",
    url: "https://campusloop.space/contact",
    description:
      "Contact desk for CampusLoop support, college partnerships, and statutory grievance redressal under IT Rules 2021.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop Inc.",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "support@campusloop.space",
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["en", "hi"],
        },
        {
          "@type": "ContactPoint",
          email: "grievance@campusloop.space",
          contactType: "regulatory grievance redressal",
          areaServed: "IN",
        },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContactClient />
    </>
  );
}
