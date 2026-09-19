import type { Metadata } from "next";
import { ProductsClient } from "@/components/marketing/products-client";
import { hexclaveServerApp } from "@/hexclave/server";

export const metadata: Metadata = {
  title: "Products — CampusLoop App, Notebook & Digital Observatory",
  description:
    "Explore CampusLoop products: the verified student-only campus network, free browser-based JupyterLab, and Digital Observatory — an open-source research publication for technology and digital systems.",
  keywords: [
    "CampusLoop products",
    "CampusLoop Notebook",
    "Digital Observatory",
    "observatory.campusloop.space",
    "open source digital research",
    "free JupyterLab for students",
    "verified student network",
    "college social network India",
  ],
  alternates: { canonical: "https://campusloop.space/products" },
  openGraph: {
    title: "CampusLoop Products",
    description:
      "The verified campus network, free student JupyterLab, and Digital Observatory — an open-source publication for research on technology and digital systems.",
    url: "https://campusloop.space/products",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Products",
    description:
      "The verified campus network, free student JupyterLab, and Digital Observatory.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function ProductsPage() {
  const user = await hexclaveServerApp.getUser();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CampusLoop Products",
    url: "https://campusloop.space/products",
    description:
      "CampusLoop products: the verified student-only campus network, CampusLoop Notebook, and Digital Observatory.",
    publisher: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
    hasPart: [
      {
        "@type": "WebSite",
        name: "Digital Observatory",
        url: "https://observatory.campusloop.space",
        description:
          "An open-source research publication for technology, the internet, AI, platforms, and digital infrastructure.",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductsClient isAuthenticated={!!user} />
    </>
  );
}
