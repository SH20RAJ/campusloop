import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { isViewerProfile } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";
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

  if (await isViewerProfile(profile)) {
    redirect("/app");
  }

  return (
    <StoryCreator profile={profile} />
  );
}
