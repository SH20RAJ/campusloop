import { Navigation } from "@/components/ui/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile || !profile.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  // Fetch some stats for the right sidebar widget
  const collegesCount = await db.select({ count: sql<number>`count(*)` }).from(institutions);
  const collegeName = profile.institutionId 
    ? (await db.query.institutions.findFirst({ where: eq(institutions.id, profile.institutionId) }))?.name 
    : "Your College";

  return (
    <div className="relative min-h-screen bg-background">
      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navigation isAdmin={profile.role === "ADMIN"} />

      {/* Main Container Layout */}
      <div className="flex md:pl-64 min-h-screen">
        {/* Center column (Feed / Main content) */}
        <main className="flex-1 w-full max-w-2xl px-4 py-8 pb-28 md:pb-8 mx-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
