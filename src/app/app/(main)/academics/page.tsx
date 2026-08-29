import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcademicsClient } from "./academics-client";

export const metadata: Metadata = {
  title: "Academic Notes, PYQs & Cheat Sheets | CampusLoop",
  description:
    "Free semester exam question papers, verified professor notes, formula cheat sheets, and lab manuals shared by college students.",
  keywords: [
    "College Notes",
    "Semester PYQ Papers",
    "Engineering Cheat Sheets",
    "Lab Manuals",
    "Data Structures PYQ",
    "Operating Systems Notes",
    "BIT Mesra Academics",
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

export default async function AcademicsPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <AcademicsClient profileId={profile.id} />;
}
