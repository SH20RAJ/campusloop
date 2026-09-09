import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EditorialHeader } from "@/components/articles/editorial-header";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: {
    default: "CampusLoop Editorial | Student Articles, Placement Roadmaps & Tech Deep Dives",
    template: "%s | CampusLoop Editorial",
  },
  description:
    "Long-form placement guides, interview experiences, AI research, and campus journalism written by verified students across 1,350+ Indian colleges.",
  openGraph: {
    title: "CampusLoop Editorial | Student Articles & Placement Roadmaps",
    description: "Read long-form campus stories and placement roadmaps written by verified seniors.",
    url: "https://campusloop.space/app/articles",
    siteName: "CampusLoop Editorial",
    images: [
      {
        url: "https://campusloop.space/og-articles.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop Editorial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop Editorial | Student Articles & Placement Roadmaps",
    description: "Read long-form campus stories and placement roadmaps written by verified seniors.",
    images: ["https://campusloop.space/og-articles.png"],
  },
};

export default async function ArticlesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  const profile = await getCachedUserProfile(user.id);
  if (!profile?.onboardingCompleted) {
    redirect("/app/onboarding");
  }

  const viewerMode = await isViewerProfile(profile);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* ─── Editorial Navigation Bar (Hidden on Writer/Editor on mobile & desktop) ─── */}
      <EditorialHeader profile={profile} />

      {/* ─── Viewer Mode Banner ─── */}
      {viewerMode && (
        <div className="sticky top-14 z-40 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
          <Eye className="size-3.5 text-amber-500 shrink-0" />
          <span>
            You&apos;re browsing in <strong>Viewer Mode</strong> — connect your campus email to publish
            articles and earn LP.
          </span>
        </div>
      )}

      {/* ─── Publication Content Stream ─── */}
      <main className="flex-1 w-full">{children}</main>

      {/* ─── Minimal Publication Footer ─── */}
      <footer className="border-t border-border/30 bg-muted/20 py-8 text-center text-xs text-muted-foreground select-none">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CampusLoop" className="size-5 object-contain" />
            <span className="font-bold text-foreground">CampusLoop Editorial Hub</span>
            <span>— Verified Indian Student Network</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <Link href="/app" className="hover:text-foreground">
              Campus Feed
            </Link>
            <Link href="/app/articles/new" className="hover:text-foreground">
              Write Article
            </Link>
            <Link href="/safety" className="hover:text-foreground">
              Guidelines
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
