import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ChatDashboard } from "./chat-dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | CampusLoop",
};

export default async function ChatPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/sign-in");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  return <ChatDashboard currentUserId={profile.id} />;
}
