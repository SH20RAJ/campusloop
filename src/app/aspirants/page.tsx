import type { Metadata } from "next";
import {
  BookOpen,
  Eye,
  MessageSquare,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { hexclaveServerApp } from "@/hexclave/server";

export const metadata: Metadata = {
  title: "CampusLoop for Aspirants — Viewer Mode for JEE, NEET & CUET | CampusLoop",
  description:
    "See what Indian college life is really like before picking a campus. Read-only access to authentic student discussions, hostel reviews, and senior advice at IITs, NITs, BITS, and top universities.",
  keywords: [
    "JEE Aspirants college life",
    "NEET Aspirants college reviews",
    "CUET campus reviews",
    "IIT confessions",
    "BITS Pilani zero attendance truth",
    "hostel food reviews India",
  ],
  alternates: {
    canonical: "https://campusloop.space/aspirants",
  },
  openGraph: {
    title: "CampusLoop for Aspirants — Viewer Mode for JEE, NEET & CUET",
    description:
      "Explore genuine campus culture and senior reviews before admission. Read-only access to 1,350+ verified college loops.",
    url: "https://campusloop.space/aspirants",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Aspirants Viewer Mode",
      },
    ],
  },
};

export default async function AspirantsPage() {
  const user = await hexclaveServerApp.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar isAuthenticated={!!user} />

      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 space-y-16">
          {/* ─── Hero Block ─── */}
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <Eye className="size-3.5" />
              Aspirant Viewer Mode
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">
              See what college life is{" "}
              <span className="bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                really like
              </span>{" "}
              before you get there.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Coaching brochures and marketing websites sell you glossy campus
              photos. CampusLoop gives JEE, NEET, and CUET aspirants read-only window
              into candid student discussions, hostel food reality, and placement
              truths.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/colleges"
                className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-7 py-3 text-xs shadow-xs transition-all hover:shadow-[0_4px_20px_rgba(147,51,234,0.35)]"
              >
                Browse Dream Campuses &rarr;
              </Link>
              <Link
                href="/handler/sign-up"
                className="rounded-full border border-border/80 bg-card hover:bg-muted/60 font-semibold px-6 py-3 text-xs text-foreground"
              >
                Create Free Viewer Account
              </Link>
            </div>
          </div>

          {/* ─── Reality Cards Comparison ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 space-y-3 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <BookOpen className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Authentic Academic Reality
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Learn how difficult mid-sems actually are, which professors teach
                well, and whether attendance rules are strictly enforced before
                locking in your college preference list.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 space-y-3 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MessageSquare className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Hostel & Mess Life
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Read real student confessions regarding hostel hygiene, late-night
                canteen options, Wi-Fi speeds, and room allotment policies straight
                from current batchmates.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 space-y-3 shadow-xs">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Trophy className="size-4" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Placement & Tech Culture
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Discover active coding societies, hackathon squads, and senior
                internship advice beyond inflated average package marketing charts.
              </p>
            </div>
          </div>

          {/* ─── How Viewer Mode Works ─── */}
          <div className="rounded-3xl border border-border/70 bg-zinc-50/50 dark:bg-[#0E131F]/50 p-6 sm:p-10 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground text-center">
              How Viewer Mode Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs leading-relaxed">
              <div className="space-y-2">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-sm">
                  Step 01
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Sign Up With Personal Email
                </h4>
                <p className="text-muted-foreground">
                  Aspirants can sign up with any personal email (Gmail/Outlook) to
                  activate read-only Viewer access.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-sm">
                  Step 02
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Follow Your Dream Campuses
                </h4>
                <p className="text-muted-foreground">
                  Pick your target colleges (IIT Delhi, BITS Pilani, BIT Mesra, NIT
                  Trichy) to read live feeds and senior tips.
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-sm">
                  Step 03
                </span>
                <h4 className="font-bold text-foreground text-sm">
                  Instant Upgrade on Admission
                </h4>
                <p className="text-muted-foreground">
                  Once admission counseling finishes and you get your college .ac.in
                  inbox, your account upgrades in place to full posting & Match Mode!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
