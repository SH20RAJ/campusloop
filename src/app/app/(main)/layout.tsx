import type { Metadata } from "next";
import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: {
    default: "CampusLoop | Student Social Network",
    template: "%s | CampusLoop",
  },
  description: "Connect with verified students across Indian colleges. Share confessions, polls, and discussions.",
  openGraph: {
    title: "CampusLoop | Student Social Network",
    description: "Connect with verified students across Indian colleges. Share confessions, polls, and discussions.",
    url: "https://campusloop.space/app",
    siteName: "CampusLoop",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "CampusLoop" }],
  },
};

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

  const viewerMode = await isViewerProfile(profile);

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation
        profile={profile}
        collegeName={viewerMode ? "Viewer Mode" : college?.name ?? "Your College"}
        isAdmin={profile.role === "ADMIN"}
        isViewer={viewerMode}
      />

      <div className="flex md:pl-64 min-h-screen">
        <main className="flex-1 w-full min-h-screen">
          {viewerMode && (
            <div className="sticky top-0 z-30 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
              <span>
                👀 You&apos;re browsing in <strong>Viewer Mode</strong> — sign up with your college
                email to post, vote, and chat.
              </span>
            </div>
          )}
          {children}
        </main>
        <aside className="hidden xl:block w-72 xl:w-80 shrink-0 border-l border-border/40 p-4">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
