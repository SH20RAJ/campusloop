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
        <main className="flex-1 w-full max-w-2xl px-4 py-8 pb-28 md:pb-8 mx-auto border-r border-border min-h-screen">
          {children}
        </main>

        {/* Right column (Widgets / College stats - Desktop only) */}
        <aside className="hidden lg:block w-80 px-6 py-8 space-y-6 shrink-0 h-screen sticky top-0">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Campus Identity</h3>
              <p className="text-sm text-muted-foreground mt-1">{collegeName}</p>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Connected to CampusLoop network</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Network Stats</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active Colleges</span>
              <span className="font-medium text-foreground">{collegesCount[0]?.count || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification status</span>
              <span className="text-xs rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 font-medium">Verified student</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
