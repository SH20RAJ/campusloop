import { DedicatedHubClient } from "@/components/communities/dedicated-hub-client";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Academic Notes & PYQs | CampusLoop",
  description: "Previous year question papers, verified semester notes, and study resources for college students.",
  alternates: { canonical: "https://campusloop.space/app/academics" },
};

export default async function AcademicsPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <DedicatedHubClient hubType="academics" profileId={profile.id} />;
}
