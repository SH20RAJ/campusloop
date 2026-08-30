import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticlesHubClient } from "./articles-hub-client";

export const metadata: Metadata = {
  title: "Campus Articles & Student Long Reads | CampusLoop",
  description:
    "Read, write, and explore in-depth student articles, placement roadmaps, engineering guides, research, and campus stories from 1,350+ Indian colleges.",
  keywords: [
    "CampusLoop Articles",
    "Student Blog",
    "College Placement Experiences",
    "Engineering Guides",
    "Campus Stories",
    "Indian College Tech Blogs",
  ],
  alternates: {
    canonical: "https://campusloop.space/app/articles",
  },
  openGraph: {
    title: "Campus Articles & Student Long Reads | CampusLoop",
    description: "In-depth student articles, placement guides, and campus insights.",
    url: "https://campusloop.space/app/articles",
    siteName: "CampusLoop",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Articles & Student Long Reads | CampusLoop",
    description: "In-depth student articles, placement guides, and campus insights.",
    images: ["https://campusloop.space/og-image.png"],
  },
};

export default function ArticlesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "CampusLoop Student Articles",
    url: "https://campusloop.space/app/articles",
    description: "Verified student articles, roadmaps, and campus journalism.",
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
      <Suspense
        fallback={
          <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-10 w-48 bg-muted/40 rounded-full" />
            <div className="h-44 bg-muted/25 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 bg-muted/20 rounded-3xl" />
              <div className="h-64 bg-muted/20 rounded-3xl" />
            </div>
          </div>
        }
      >
        <ArticlesHubClient />
      </Suspense>
    </>
  );
}
