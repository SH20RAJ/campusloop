import { Navigation } from "@/components/ui/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

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
        <main className="flex-1 w-full max-w-2xl px-0 py-0 pb-28 md:pb-0 mx-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
