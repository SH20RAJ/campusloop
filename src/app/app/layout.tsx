import type { Metadata } from "next";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { institutionDomains, userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Default for everything behind auth: stay out of search indexes.
 * Public, indexable surfaces (post/[id], college/[id], colleges,
 * communities, hashtag/[tag], branch/[slug], …) explicitly opt back in
 * with `robots: { index: true }` in their own metadata.
 */
export const metadata: Metadata = {
	robots: {
		index: false,
		follow: true,
	},
};

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join");
  }

  const db = getDb();

  // If there are 0 users, auto-create the first user as ADMIN
  const profilesCount = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
  if (profilesCount[0]?.count === 0) {
    const fallbackInst = await db.query.institutions.findFirst();
    if (fallbackInst) {
      const email = user.primaryEmail || "admin@campusloop.com";
      const username = email.split("@")[0] || "admin";
      
      await db.insert(userProfiles).values({
        userId: user.id,
        username,
        displayName: "Admin",
        institutionId: fallbackInst.id,
        onboardingCompleted: true,
        role: "ADMIN",
        status: "ACTIVE",
      });
      
      redirect("/admin");
    }
  }

  let profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (profile?.role === "ADMIN") {
    return <>{children}</>;
  }

  const email = user.primaryEmail;
  if (!email) {
    redirect("/invalid-email");
  }
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    redirect("/invalid-email");
  }

  const whitelistedDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain),
  });

  if (!whitelistedDomain) {
    redirect("/invalid-email");
  }

  // Profile check: We do NOT auto-create profiles here.
  // If the profile does not exist or onboardingCompleted is false,
  // the user is directed to /app/onboarding by the page/layout guards.

  return <>{children}</>;
}
