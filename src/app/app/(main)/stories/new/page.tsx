import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { StoryCreator } from "./story-creator";

export const metadata: Metadata = {
  title: "Create Story | CampusLoop",
};

export default async function CreateStoryPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    with: {
      institution: true,
    }
  });

  if (!profile) {
    redirect("/app/onboarding");
  }

  return (
    <StoryCreator profile={profile} />
  );
}
