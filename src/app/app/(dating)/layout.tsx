import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Campus Match · Dating & Friends | CampusLoop",
  description: "Connect with verified students across your college campus for friends, study buddies, and dating.",
};

export default async function DatingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  if (!user) {
    redirect("/handler/sign-in?returnTo=/app/matching");
  }

  const profile = await getCachedUserProfile(user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  return <>{children}</>;
}
