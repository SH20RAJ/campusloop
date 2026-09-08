import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Campus Match · Dating & Friends | CampusLoop",
  description: "Connect with verified students across your college campus for friends, study buddies, and dating.",
  openGraph: {
    title: "Campus Match · Dating & Friends | CampusLoop",
    description: "Connect with verified students across your college campus for friends, study buddies, and dating.",
    url: "https://campusloop.space/app/dating",
    siteName: "CampusLoop Match",
    images: [{ url: "https://campusloop.space/og-dating.png", width: 1536, height: 1024, alt: "CampusLoop Match" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Match · Dating & Friends | CampusLoop",
    description: "Connect with verified students across your college campus for friends, study buddies, and dating.",
    images: ["https://campusloop.space/og-dating.png"],
  },
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
