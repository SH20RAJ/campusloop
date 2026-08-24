import { Metadata } from "next";
import { BranchDirectoryClient } from "./branch-client";
import { findBranchBySlug } from "@/lib/academic-constants";

interface BranchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BranchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const branchInfo = findBranchBySlug(decoded);
  const title = branchInfo ? `${branchInfo.name} Students Hub` : `${decoded.replace(/-/g, " ")} Students Hub`;
  const description = `Connect with verified students enrolled in ${title} across Indian college campuses.`;
  const url = `https://campusloop.space/app/branch/${decoded}`;

  return {
    title: `${title} | CampusLoop`,
    description,
    keywords: [title, "branch directory", "engineering departments", "student networking"],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | CampusLoop`,
      description,
      url,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | CampusLoop`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BranchDirectoryPage({ params }: BranchPageProps) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const branchInfo = findBranchBySlug(decoded);
  const title = branchInfo ? branchInfo.name : decoded.replace(/-/g, " ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${title} Student Hub`,
    url: `https://campusloop.space/app/branch/${decoded}`,
    description: `Directory of verified students enrolled in ${title}.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BranchDirectoryClient />
    </>
  );
}
