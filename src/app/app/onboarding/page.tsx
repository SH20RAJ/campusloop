import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutionDomains } from "@/db/schema";
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

  const email = user.primaryEmail || "";
  const rawEmailUser = email.split("@")[0] || "";
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";
  const whitelistedDomain = emailDomain
    ? await db.query.institutionDomains.findFirst({
        where: eq(institutionDomains.domain, emailDomain),
      })
    : null;
  const viewerMode = !whitelistedDomain;

  // Smart Name Parser: e.g. "shaswat.raj" -> "Shaswat Raj", "aarav_sharma" -> "Aarav Sharma"
  function parseNameFromEmail(raw: string): string {
    const parts = raw
      .replace(/[0-9]+/g, " ")
      .split(/[\._\-\+ ]+/)
      .filter((p) => p.length > 0)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    
    if (parts.length > 0) {
      return parts.join(" ");
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  const extractedName = parseNameFromEmail(rawEmailUser);
  const initialDisplayName = (user as { name?: string }).name || profile?.displayName || extractedName || "";
  const initialUsername = profile?.username || rawEmailUser.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "") || "student";
  const initialAvatarUrl = profile?.avatarUrl || (user as { picture?: string }).picture || "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 select-none">
      <div className="w-full max-w-lg space-y-6 rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border/80">
        <div className="text-center space-y-1.5">
          <div className="inline-flex size-10 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center text-primary text-xl mb-1">
            🎓
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {viewerMode ? "Set up your Viewer Profile" : "Set up your Campus Profile"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {viewerMode
              ? "You're joining with a personal email, so you'll get read-only Viewer access."
              : "Complete your student details to enter your campus community."}
          </p>
        </div>
        {viewerMode && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-left text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
            👀 <strong>Viewer Mode</strong> — browse campus feeds, confessions, and polls across
            1,350+ colleges, but posting, voting, and chat stay locked. Perfect for JEE/NEET
            aspirants. Sign up later with your official college email to unlock everything.
          </div>
        )}
        <OnboardingForm
          initialDisplayName={initialDisplayName}
          initialUsername={initialUsername}
          initialAvatarUrl={initialAvatarUrl}
        />
      </div>
    </div>
  );
}
