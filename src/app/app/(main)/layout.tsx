import { GlassBottomNav } from "@/components/ui/glass-bottom-nav";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
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

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* 
        pb-24 ensures content doesn't get hidden behind the floating bottom nav.
        bg-background is the off-white/dark color defined in globals.css 
      */}
      {children}
      <GlassBottomNav />
    </div>
  );
}
