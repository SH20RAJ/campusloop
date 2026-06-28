import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { institutionDomains, userProfiles, institutions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/sign-in");
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

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (profile?.role === "ADMIN") {
    return <>{children}</>;
  }

  const email = user.primaryEmail;
  const domain = email?.split("@")[1]?.toLowerCase();

  if (!domain) {
    redirect("/invalid-email");
  }

  const whitelistedDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain),
  });

  if (!whitelistedDomain) {
    redirect("/invalid-email");
  }

  return <>{children}</>;
}
