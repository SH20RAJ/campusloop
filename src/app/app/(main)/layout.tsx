import { FirstVisitNotificationPrompt } from "@/components/notifications/first-visit-notification-prompt";
import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
    images: [{ url: "https://campusloop.space/og-image.png", width: 1200, height: 630, alt: "CampusLoop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Student Social Network",
    description: "Connect with verified students across Indian colleges. Share confessions, polls, and discussions.",
    images: ["https://campusloop.space/og-image.png"],
  },
};


export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedAuthUser();
  
  if (!user) {
    redirect("/handler/sign-in");
  }


  const profile = await getCachedUserProfile(user.id);

  if (!profile || !profile.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  const college = profile.institution;
  const viewerMode = await isViewerProfile(profile);

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation
        profile={profile}
        collegeName={viewerMode ? "Viewer Mode" : college?.name ?? "Your College"}
        isAdmin={profile.role === "ADMIN"}
        isViewer={viewerMode}
      />

      <div className="flex md:pl-64 min-h-screen max-w-full overflow-x-clip">
        <main className="flex-1 w-full min-w-0 max-w-full min-h-screen">
          {viewerMode && (
            <div className="sticky top-0 z-30 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
              <span>
                👀 You&apos;re browsing in <strong>Viewer Mode</strong> — sign up with your college
                email to post, vote, and chat.
              </span>
            </div>
          )}
          {children}
          <FirstVisitNotificationPrompt />
        </main>
        <aside className="hidden lg:block w-80 xl:w-[350px] shrink-0 border-l border-border/30 px-4 py-3">
          <RightSidebar />
        </aside>

      </div>
    </div>
  );
}

