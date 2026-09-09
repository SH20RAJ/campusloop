import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getDb } from "@/db";
import { articles } from "@/db/schema";
import { ArticlesHubClient } from "./articles-hub-client";

export const metadata: Metadata = {
  title: "Campus Articles & Student Long Reads",
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
    title: "Campus Articles & Student Long Reads",
    description: "In-depth student articles, placement guides, and campus insights.",
    url: "https://campusloop.space/app/articles",
    siteName: "CampusLoop",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-articles.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop Editorial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Editorial — Student Tech & Campus Journalism",
    description:
      "Deep-dives, interview experiences, and campus guides written by verified university students.",
    images: ["https://campusloop.space/og-articles.png"],
  },
};

export default async function ArticlesPage() {
  const db = getDb();
  let initialArticles: any[] = [];

  try {
    initialArticles = await db.query.articles.findMany({
      where: eq(articles.status, "PUBLISHED"),
      orderBy: [desc(articles.publishedAt)],
      limit: 12,
      columns: { content: false },
      with: {
        author: {
          with: { institution: true },
        },
        institution: true,
      },
    });
  } catch (err) {
    console.error("Failed to load initial server articles:", err);
  }

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
    mainEntity: {
      "@type": "ItemList",
      itemListElement: initialArticles.map((art, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://campusloop.space/a/${art.slug}`,
        name: art.title,
        description: art.excerpt || art.subtitle,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            <div className="h-10 max-w-md bg-muted/40 rounded-2xl animate-pulse mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
                <div className="h-48 rounded-3xl bg-muted/40 animate-pulse" />
              </div>
              <div className="h-96 rounded-3xl bg-muted/40 animate-pulse" />
            </div>
          </div>
        }
      >
        <ArticlesHubClient initialArticles={initialArticles} />
      </Suspense>
    </>
  );
}
