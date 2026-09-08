import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademicsSearchClient } from "./search-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Academic Search: "${q}" | CampusLoop` : "Search Academic Notes, PYQs & Cheat Sheets | CampusLoop";
  const description = q
    ? `Search results for "${q}" in CampusLoop's academic vault. Find verified lecture notes, previous year question papers (PYQs), formula cheat sheets, and lab manuals.`
    : "Search across 9,200+ verified academic resources on CampusLoop. Find engineering notes, PYQs, cheat sheets, and lab manuals for your branch and semester.";

  return {
    title,
    description,
    alternates: {
      canonical: q
        ? `https://campusloop.space/app/academics/search?q=${encodeURIComponent(q)}`
        : "https://campusloop.space/app/academics/search",
    },
    openGraph: {
      title: `${title} | CampusLoop Academics`,
      description,
      url: "https://campusloop.space/app/academics/search",
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "website",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function AcademicsSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] w-full items-center justify-center">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AcademicsSearchClient initialQuery={q || ""} />
    </Suspense>
  );
}
