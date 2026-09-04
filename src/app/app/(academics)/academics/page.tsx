import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { AcademicsClient } from "./academics-client";

export const metadata: Metadata = {
  title: "Academic Notes, PYQs & Cheat Sheets | CampusLoop",
  description:
    "Free semester exam question papers, verified professor notes, formula cheat sheets, and lab manuals shared by college students. Zero-login direct PDF downloads.",
  keywords: [
    "College Notes",
    "Semester PYQ Papers",
    "Engineering Cheat Sheets",
    "Lab Manuals",
    "Data Structures PYQ",
    "Operating Systems Notes",
    "BIT Mesra Academics",
    "Free PDF Download",
  ],
  alternates: { canonical: "https://campusloop.space/app/academics" },
  openGraph: {
    title: "Academic Notes, PYQs & Cheat Sheets | CampusLoop",
    description:
      "Free semester exam question papers, verified professor notes, and formula cheat sheets shared by verified college students.",
    url: "https://campusloop.space/app/academics",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Academic Notes, PYQs & Cheat Sheets | CampusLoop",
    description:
      "Free semester exam question papers, verified professor notes, and formula cheat sheets shared by verified college students.",
  },
  robots: { index: true, follow: true },
};

interface AcademicsPageProps {
  searchParams?: Promise<{ id?: string }>;
}

export default async function AcademicsPage({ searchParams }: AcademicsPageProps) {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  const resolvedParams = searchParams ? await searchParams : undefined;
  if (resolvedParams?.id) {
    redirect(`/app/academics/${resolvedParams.id}`);
  }

  return <AcademicsClient profileId={profile?.id ?? null} />;
}
