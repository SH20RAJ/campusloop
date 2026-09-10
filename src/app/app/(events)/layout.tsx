import { ArrowLeft, Calendar, Eye, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FirstVisitNotificationPrompt } from "@/components/notifications/first-visit-notification-prompt";
import { Navigation } from "@/components/ui/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { isViewerProfile } from "@/lib/viewer";

export const metadata: Metadata = {
  title: {
    default: "Campus Events, Hackathons & College Fests | CampusLoop",
    template: "%s | CampusLoop Events",
  },
  description:
    "Discover hackathons, technical workshops, college cultural fests, coding competitions, and campus meetups across 1,350+ Indian universities. Register solo or in teams on CampusLoop.",
  openGraph: {
    title: "Campus Events, Hackathons & College Fests | CampusLoop",
    description:
      "Join hackathons, tech bootcamps, and college fests with verified students from your campus and across India.",
    url: "https://campusloop.space/app/events",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-events.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop Events — Hackathons & College Fests",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Events, Hackathons & College Fests | CampusLoop",
    description:
      "Discover hackathons, technical workshops, and college cultural fests across 1,350+ Indian universities.",
    images: ["https://campusloop.space/og-events.png"],
  },
};

export default async function EventsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  // ─── Authenticated User Layout (Full Screen, Left Navigation Drawer, ZERO Right Sidebar) ───
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

        <div className="flex md:pl-64 min-h-screen w-full">
          <main className="flex-1 w-full min-w-0 min-h-screen">
            {viewerMode && (
              <div className="sticky top-0 z-30 flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 backdrop-blur-md">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5 shrink-0" />
                  <span>
                    You&apos;re browsing in <strong>Viewer Mode</strong> — sign up with your college email to
                    host events, register in teams, and earn Loop Points.
                  </span>
                </span>
              </div>
            )}
            {children}
            <FirstVisitNotificationPrompt />
          </main>
        </div>
      </div>
    );
  }

  // ─── Guest / Public Visitor View (Zero Login Required to Discover Events) ───
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* Public Top Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-xl select-none">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex size-8.5 items-center justify-center rounded-full border border-border/40 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
              title="Campus Feed"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <Link href="/app/events" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="CampusLoop"
                className="size-7.5 object-contain shrink-0 transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                    CampusLoop
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/30">
                    Events
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground/80 hidden sm:inline">
                  Hackathons, Fests &amp; Campus Meetups
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/handler/sign-in?returnTo=/app/events/new"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Host Event</span>
            </Link>

            <Link
              href="/handler/sign-in?returnTo=/app/events"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-primary hover:opacity-90 text-primary-foreground shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="size-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">{children}</main>
    </div>
  );
}
