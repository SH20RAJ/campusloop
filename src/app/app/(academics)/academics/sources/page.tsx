import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AcademicSourcesDirectory } from "@/components/academics/academic-sources-directory";

export const metadata: Metadata = {
  title: "Directory of Working Engineering Notes & PYQ Websites | CampusLoop",
  description:
    "Curated directory of active, working college websites for free engineering notes, past question papers (PYQs), lab manuals, and syllabus modules across Indian universities.",
  keywords: [
    "Websites for engineering notes",
    "Best websites for college PYQs",
    "BIT Mesra Question Paper Archive",
    "AKTU Quantum Series notes website",
    "VTU notes and question papers website",
    "JNTUH notes free download",
    "Anna University notes websites",
    "Free college notes PDF download sites",
    "Previous year question papers archive",
  ],
  alternates: { canonical: "https://campusloop.space/app/academics/sources" },
  openGraph: {
    title: "Directory of Engineering Notes & Question Paper Archives | CampusLoop",
    description:
      "Curated directory of verified working websites for free engineering notes, semester PYQs, and lab manuals.",
    url: "https://campusloop.space/app/academics/sources",
    siteName: "CampusLoop Academics",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AcademicSourcesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Curated Directory of Engineering Academic Sources & PYQ Archives",
    description:
      "Comprehensive directory of verified working university portals and student archives for free engineering lecture notes and previous year exam papers.",
    url: "https://campusloop.space/app/academics/sources",
    inLanguage: "en-IN",
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href="/app/academics"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Academic Vault</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Verified Sources &amp; Archives</span>
      </div>

      {/* Directory Component */}
      <AcademicSourcesDirectory />
    </div>
  );
}
