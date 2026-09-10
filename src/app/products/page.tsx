import type { Metadata } from "next";
import { CTABand, MarketingFooter, MarketingHeader, SectionHeading } from "@/components/marketing/system";
import { ProductsClient } from "@/components/products/products-client";
import { NOTEBOOK_URL, PRODUCTS } from "@/constants/products";
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
    mainEntity: {
      "@type": "ItemList",
      itemListElement: PRODUCTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SoftwareApplication",
          name: p.name,
          description: p.description,
          url: p.external ? NOTEBOOK_URL : `https://campusloop.space${p.href}`,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingHeader isAuthenticated={!!user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pt-28 pb-20">
          <SectionHeading
            eyebrow="Products"
            title="Student tools, built by CampusLoop."
            lede="The verified campus network — plus free standalone tools like Notebook, a browser-based JupyterLab session for every student."
          />
          <ProductsClient />
        </main>
        <CTABand
          title="Start with the campus. Stay for the tools."
          lede="Verify your college email once — the feed, the match, and the Notebook are all yours."
          primaryHref={user ? "/app" : "/handler/sign-up"}
          primaryLabel={user ? "Open app" : "Get verified"}
          secondaryHref={NOTEBOOK_URL}
          secondaryLabel="Launch Notebook"
        />
        <MarketingFooter />
      </div>
    </>
  );
}
