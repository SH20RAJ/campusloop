import type { Metadata } from "next";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = {
  title: "Public Investor & Tester Demo Access | CampusLoop",
  description:
    "Instant testing credentials and all-access demo account for investors, evaluators, and public testers to experience CampusLoop with all verified features unlocked.",
  keywords: [
    "CampusLoop Demo",
    "Investor Demo Account",
    "College Social Network Preview",
    "Interactive Campus Walkthrough",
  ],
  alternates: { canonical: "https://campusloop.space/demo" },
  openGraph: {
    title: "Public Investor & Tester Demo Access | CampusLoop",
    description:
      "Instant testing credentials and all-access demo account for investors, evaluators, and public testers to experience CampusLoop.",
    url: "https://campusloop.space/demo",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Investor & Tester Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Public Investor & Tester Demo Access | CampusLoop",
    description:
      "Instant testing credentials and all-access demo account for investors, evaluators, and public testers to experience CampusLoop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function DemoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CampusLoop Public Demo & Evaluation Environment",
    url: "https://campusloop.space/demo",
    description: "Interactive demo environment for evaluating CampusLoop verified student features.",
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
      <DemoClient />
    </>
  );
}
