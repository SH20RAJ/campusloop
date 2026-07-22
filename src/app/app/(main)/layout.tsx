import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  
  if (!user) {
    redirect("/join");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile || !profile.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  const college = profile.institutionId 
    ? await db.query.institutions.findFirst({ where: eq(institutions.id, profile.institutionId) })
    : null;

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation 
        profile={profile} 
        collegeName={college?.name ?? "Your College"} 
        isAdmin={profile.role === "ADMIN"} 
      />

      <div className="flex md:pl-64 min-h-screen">
        <main className="flex-1 w-full min-h-screen">
          {children}
        </main>
        <aside className="hidden xl:block w-72 xl:w-80 shrink-0 border-l border-border/40 p-4">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
