import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = {
	title: "Complete Your Profile",
	description: "Set up your CampusLoop profile — pick your branch, year, and interests to join your campus feed.",
	robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const user = await hexclaveServerApp.getUser();
  
  if (!user) {
    redirect("/join");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (profile?.onboardingCompleted) {
    redirect("/app");
  }

  const emailUsername = user.primaryEmail?.split("@")[0] || "";
  const initialDisplayName = (user as { name?: string }).name || profile?.displayName || "";
  const initialUsername = profile?.username || emailUsername.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const initialAvatarUrl = profile?.avatarUrl || (user as { picture?: string }).picture || "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 select-none">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border/80">
        <div className="text-center space-y-1.5">
          <div className="inline-flex size-10 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary text-xl mb-1">
            🎓
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Set up your Campus Profile</h1>
          <p className="text-xs text-muted-foreground">
            Complete your student details to enter your campus community.
          </p>
        </div>
        <OnboardingForm
          initialDisplayName={initialDisplayName}
          initialUsername={initialUsername}
          initialAvatarUrl={initialAvatarUrl}
        />
      </div>
    </div>
  );
}
