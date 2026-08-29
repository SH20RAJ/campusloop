import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { HubCreateClient } from "../../hub/new/hub-create-client";

export const metadata: Metadata = {
  title: "List Flat / Roommate Opening | CampusLoop Housing",
  description: "Post student room vacancies, PG openings, and find verified college flatmates.",
  alternates: { canonical: "https://campusloop.space/app/housing/new" },
};

export default async function NewHousingPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient initialType="housing" profileId={profile.id} />;
}
