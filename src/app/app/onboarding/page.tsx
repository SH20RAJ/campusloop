import { getDb } from "@/db";
import { institutionDomains,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";
import { Lock } from "lucide-react";
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
    redirect("/handler/sign-in");
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-4 pb-4 sm:px-6">
        {/* ─── Header ─── */}
        <header className="flex items-center gap-2.5 border-b border-border/40 py-5">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black">
            <img src="/logo.png" alt="" className="h-full w-full scale-110 object-cover" />
          </div>
          <span className="text-sm font-black tracking-tight text-foreground">
            Campus<span className="text-primary">Loop</span>
          </span>
        </header>

        <div className="pt-7">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {viewerMode ? "Set up your preview profile" : "Set up your profile"}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
            {viewerMode
              ? "You signed up with a personal email, so you're on Campus Preview — read-only access to campus life."
              : "A few details so your classmates can find you."}
          </p>
        </div>

        {viewerMode && (
          <div className="mt-5 rounded-2xl border border-border/60 bg-muted/25 p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-black text-foreground">
              <Lock className="size-3.5 text-amber-500" />
              You&apos;ll need a college email to interact
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Browse feeds, confessions, polls and campus hubs across 1,350+ colleges, and save
              anything worth keeping. Posting, voting, chat and matching unlock when you verify an
              official college email on this same account — nothing you save is lost.
            </p>
          </div>
        )}

        <OnboardingForm
          variant={viewerMode ? "viewer" : "student"}
          initialDisplayName={initialDisplayName}
          initialUsername={initialUsername}
          initialAvatarUrl={initialAvatarUrl}
        />
      </div>
    </div>
  );
}
