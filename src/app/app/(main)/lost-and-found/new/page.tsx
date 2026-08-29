import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { HubCreateClient } from "../../hub/new/hub-create-client";

export const metadata: Metadata = {
  title: "Report Lost or Found Item | CampusLoop",
  description: "Report lost IDs, keys, headphones, or report found items to verified students across your college.",
  alternates: { canonical: "https://campusloop.space/app/lost-and-found/new" },
};

export default async function NewLostAndFoundPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return <HubCreateClient initialType="lost_found" profileId={profile.id} />;
}
