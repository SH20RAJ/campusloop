import type { Metadata } from "next";
import { Suspense } from "react";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { AcademicsSearchClient } from "./search-client";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    branch?: string;
    semester?: string;
    sort?: string;
    scope?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q
    ? `Academic Search: "${q}" | CampusLoop`
    : "Search Academic Notes, PYQs & Cheat Sheets | CampusLoop Vault";
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

export default async function AcademicsSearchPage({ searchParams }: SearchPageProps) {
  const [resolvedParams, user] = await Promise.all([searchParams, getCachedAuthUser()]);

  const profile = user ? await getCachedUserProfile(user.id) : null;

  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] w-full items-center justify-center">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AcademicsSearchClient
        profileId={profile?.id ?? null}
        initialQuery={resolvedParams?.q || ""}
        initialType={resolvedParams?.type || "all"}
        initialBranch={resolvedParams?.branch || "All"}
        initialSemester={resolvedParams?.semester || "all"}
        initialSort={resolvedParams?.sort || (resolvedParams?.q ? "relevance" : "latest")}
        initialScope={(resolvedParams?.scope as "campus" | "global") || "global"}
      />
    </Suspense>
  );
}
