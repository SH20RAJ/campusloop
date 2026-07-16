import { Navigation } from "@/components/ui/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  const college = profile.institutionId 
    ? await db.query.institutions.findFirst({ where: eq(institutions.id, profile.institutionId) })
    : null;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <Navigation 
        profile={profile} 
        collegeName={college?.name ?? "Your College"} 
        isAdmin={profile.role === "ADMIN"} 
      />

      {/* Main Chat Area */}
      <div className="flex md:pl-64 min-h-screen h-screen">
        <main className="flex-1 w-full h-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
