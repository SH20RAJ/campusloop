import type { Metadata } from "next";
import { ProductsClient } from "@/components/marketing/products-client";
import { hexclaveServerApp } from "@/hexclave/server";

export const metadata: Metadata = {
  title: "Products — CampusLoop App & Free Student JupyterLab",
  description:
    "Explore CampusLoop products: the verified student-only campus network for 1,350+ Indian colleges, plus CampusLoop Notebook — free browser-based JupyterLab sessions for students.",
  keywords: [
    "CampusLoop products",
    "CampusLoop Notebook",
    "free JupyterLab for students",
    "student Jupyter notebook",
    "verified student network",
    "college social network India",
  ],
  alternates: { canonical: "https://campusloop.space/products" },
  openGraph: {
    title: "CampusLoop Products",
    description:
      "The verified campus network plus CampusLoop Notebook — free JupyterLab sessions for students, right in the browser.",
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
      "The verified campus network plus CampusLoop Notebook — free JupyterLab sessions for students.",
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
      "CampusLoop products: the verified student-only campus network and CampusLoop Notebook, free JupyterLab sessions for students.",
    publisher: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductsClient isAuthenticated={!!user} />
    </>
  );
}
