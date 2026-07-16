import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await hexclaveServerApp.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (profile?.onboardingCompleted) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-[32px] bg-card p-8 shadow-xl border border-white/5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary">Complete your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let's get you set up in your campus community.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
