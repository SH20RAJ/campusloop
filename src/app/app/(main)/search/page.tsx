import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search results for "${q}"` : "Search CampusLoop Network";
  const description = q
    ? `Explore colleges, night canteens, confessions, student profiles, and threads matching "${q}" on CampusLoop.`
    : "Search across 1,350+ verified Indian college hubs, night canteens, campus threads, confessions, and students.";

  return {
    title,
    description,
    alternates: {
      canonical: q
        ? `https://campusloop.space/app/search?q=${encodeURIComponent(q)}`
        : "https://campusloop.space/app/search",
    },
    openGraph: {
      title: `${title} | CampusLoop`,
      description,
      url: "https://campusloop.space/app/search",
      siteName: "CampusLoop",
      images: [{ url: "https://campusloop.space/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: q ? `Search results for "${q}"` : "Search CampusLoop Network",
    url: `https://campusloop.space/app/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    description:
      "Search verified student-only campus threads, night canteens, and university hubs on CampusLoop.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-muted-foreground font-bold">
            Loading search results...
          </div>
        }
      >
        <SearchClient initialQuery={q || ""} />
      </Suspense>
    </>
  );
}
