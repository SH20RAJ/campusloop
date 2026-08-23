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

  return {
    title: `${title} | CampusLoop`,
    description,
    openGraph: {
      title: `${title} | CampusLoop`,
      description,
      url: `https://campusloop.space/app/branch/${decoded}`,
    },
  };
}

export default function BranchDirectoryPage() {
  return <BranchDirectoryClient />;
}
