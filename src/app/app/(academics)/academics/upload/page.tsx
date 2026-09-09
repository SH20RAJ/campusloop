import type { Metadata } from "next";
import { UploadAcademicClient } from "./upload-client";

export const metadata: Metadata = {
  title: "Upload & Share College Notes, PYQs & Solutions | CampusLoop Academics",
  description:
    "Contribute verified semester exam question papers, lecture notes, formula cheat sheets, and lab manuals to your Indian college hub. Earn Loop Points and help batchmates ace their exams.",
  keywords: [
    "Upload college notes",
    "Share semester PYQs",
    "Engineering study materials upload",
    "Upload question papers",
    "College lecture notes repository",
    "CampusLoop Academics upload",
  ],
  alternates: { canonical: "https://campusloop.space/app/academics/upload" },
  openGraph: {
    title: "Upload & Share College Notes, PYQs & Solutions | CampusLoop",
    description:
      "Contribute verified semester exam question papers, lecture notes, formula cheat sheets, and lab manuals to your college hub.",
    url: "https://campusloop.space/app/academics/upload",
    siteName: "CampusLoop Academics",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upload & Share College Notes, PYQs & Solutions | CampusLoop",
    description:
      "Contribute verified semester exam question papers, lecture notes, formula cheat sheets, and lab manuals to your college hub.",
  },
  robots: { index: true, follow: true },
};

export default function UploadAcademicPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Upload Academic Study Materials & Question Papers",
    url: "https://campusloop.space/app/academics/upload",
    description:
      "Creator studio for verified college students to publish handwritten notes, past question papers, and formula guides.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UploadAcademicClient />
    </>
  );
}
