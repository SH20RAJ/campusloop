import { ArrowLeft, BookOpen, GraduationCap, Sparkles, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FirstVisitNotificationPrompt } from "@/components/notifications/first-visit-notification-prompt";
import { Navigation } from "@/components/ui/navigation";
import { RightSidebar } from "@/components/ui/right-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: {
    default: "Academic Notes, PYQs & Cheat Sheets | CampusLoop Academics",
    template: "%s | CampusLoop Academics",
  },
  description:
    "Free semester exam question papers, verified professor notes, formula cheat sheets, and lab manuals shared by verified college students across India.",
  openGraph: {
    title: "CampusLoop Academics | College Notes & Exam PYQs",
    description:
      "Free semester exam question papers, verified professor notes, formula cheat sheets, and lab manuals.",
    url: "https://campusloop.space/app/academics",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
  },
};

export default async function AcademicsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  // If user is authenticated and completed onboarding, render standard logged-in layout
  if (profile?.onboardingCompleted) {
    const college = profile.institution;
    const viewerMode = await isViewerProfile(profile);

    return (
      <div className="relative min-h-screen bg-background">
        <Navigation
          profile={profile}
          collegeName={viewerMode ? "Viewer Mode" : (college?.name ?? "Your College")}
          isAdmin={profile.role === "ADMIN"}
          isViewer={viewerMode}
        />

        <div className="flex md:pl-64 min-h-screen max-w-full overflow-x-clip">
          <main className="flex-1 w-full min-w-0 max-w-full min-h-screen">
            {viewerMode && (
              <div className="sticky top-0 z-30 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
                <span>
                  👀 You&apos;re browsing in <strong>Viewer Mode</strong> — sign up with your college email to
                  post, vote, and chat.
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

  // ─── Guest / Public Visitor View (Zero Login Required to Browse & Download) ───
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-indigo-500/20">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl select-none">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Brand & Hub identifier */}
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex size-8.5 items-center justify-center rounded-full border border-border/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title="Campus Feed"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <Link href="/app/academics" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="CampusLoop"
                className="size-7.5 object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                    CampusLoop
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    Academics
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/80 hidden sm:inline">
                  BIT Mesra Hub &amp; All-India Engineering Vault
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Guest CTAs & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/handler/sign-in?returnTo=/app/academics"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="size-3.5 fill-amber-400 text-amber-400" />
              <span>Join Hub</span>
              <span className="hidden sm:inline px-1.5 py-0.2 text-[9px] rounded-full bg-indigo-700/80 text-white font-mono">
                +50 LP
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">{children}</main>

      {/* Bottom Sticky Guest Perk Callout on Mobile */}
      <div className="sticky bottom-0 z-40 border-t border-indigo-500/20 bg-background/95 backdrop-blur-md p-2.5 sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-7 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
              <GraduationCap className="size-4" />
            </span>
            <p className="text-[11px] text-muted-foreground truncate">
              Sign in to save notes to your vault &amp; earn 50 LP!
            </p>
          </div>
          <Link
            href="/handler/sign-in?returnTo=/app/academics"
            className="px-3 py-1.5 rounded-full text-[11px] font-black bg-indigo-600 text-white shrink-0 shadow-xs"
          >
            Claim 50 LP
          </Link>
        </div>
      </div>
    </div>
  );
}
