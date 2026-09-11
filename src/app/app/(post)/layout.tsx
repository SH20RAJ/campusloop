import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/ui/navigation";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Campus Loop | CampusLoop",
  description: "Explore student campus loops, confessions, polls, and discussions.",
  robots: { index: true, follow: true },
};

export default async function PostLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  // If user is authenticated but hasn't finished onboarding, complete onboarding
  if (user && !profile?.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  const college = profile?.institution;
  const viewerMode = profile ? await isViewerProfile(profile) : true;

  return (
    <div className="relative h-dvh w-full bg-background overflow-hidden select-none">
      <Navigation
        profile={profile || undefined}
        collegeName={viewerMode ? "Viewer Mode" : (college?.name ?? "Campus")}
        isAdmin={profile?.role === "ADMIN"}
        isViewer={viewerMode}
      />

      {/* Main Canvas without RightSidebar so wheel scroll controls the deck 100% */}
      <div className="flex md:pl-64 h-dvh w-full overflow-hidden">
        <main className="flex-1 w-full h-full overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
