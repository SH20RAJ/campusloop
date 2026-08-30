import { ArrowLeft, LayoutDashboard, PenTool, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    images: [{ url: "https://campusloop.space/og-image.png", width: 1200, height: 630 }],
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
      {/* ─── Hashnode / Medium Style Top Navigation Bar ─── */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl select-none">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Feed Back Link + Logo & Publication Branding */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex size-8.5 items-center justify-center rounded-full border border-border/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title="Back to Campus Feed"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <Link href="/app/articles" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="CampusLoop"
                className="size-7.5 object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-foreground flex items-center gap-1">
                  <span>Campus</span>
                  <span className="text-primary font-black">Editorial</span>
                </span>
              </div>
            </Link>

            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black border border-primary/20 ml-1">
              <Sparkles className="size-3" />
              <span>Medium / Hashnode Edition</span>
            </span>
          </div>

          {/* Right: Actions (Write, Dashboard, Theme, User) */}
          <div className="flex items-center gap-2">
            <Link
              href="/app/articles/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-card hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Drafts &amp; Stats</span>
            </Link>

            <Link
              href="/app/articles/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
            >
              <PenTool className="size-3.5" />
              <span className="hidden sm:inline">Write (+15 LP)</span>
              <span className="sm:hidden">Write</span>
            </Link>

            <ThemeToggle className="size-8.5 rounded-full border border-border/40 bg-muted/40 hover:bg-muted" />

            <Link
              href="/app/profile"
              className="flex items-center gap-2 pl-1 group cursor-pointer"
              title={`Logged in as @${profile.username}`}
            >
              <Avatar className="size-8 border border-border/60 transition-transform group-hover:scale-105">
                <AvatarImage src={profile.avatarUrl || ""} />
                <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
                  {profile.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Viewer Mode Banner ─── */}
      {viewerMode && (
        <div className="sticky top-14 z-40 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
          <span>
            👀 You&apos;re browsing in <strong>Viewer Mode</strong> — connect your campus email to publish
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
