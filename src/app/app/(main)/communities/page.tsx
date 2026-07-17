import { getDb } from "@/db";
import { communities, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { CommunitiesClientView, Community } from "./communities-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities | CampusLoop",
};

export default async function CommunitiesPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch all communities
  const allCommunities = await db.query.communities.findMany({
    orderBy: [desc(communities.createdAt)],
    with: {
      members: true,
      creator: {
        columns: {
          id: true,
          username: true,
          displayName: true,
        }
      },
    }
  });

  return (
    <CommunitiesClientView 
      initialCommunities={allCommunities as unknown as Community[]}
      profileId={profile.id}
    />
  );
}
