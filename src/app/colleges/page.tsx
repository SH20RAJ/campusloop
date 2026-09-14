import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { hexclaveServerApp } from "@/hexclave/server";
import { CollegesPublicClient } from "./colleges-public-client";

export const metadata: Metadata = {
  title: "1,350+ Indian Colleges Directory & Campus Hubs | CampusLoop",
  description:
    "Explore verified student loops across 1,350+ Indian universities. Check if your college loop is active, request a new campus hub, or explore student feeds.",
  keywords: [
    "Indian College Directory",
    "IIT campus loops",
    "NIT student network",
    "BITS Pilani confessions",
    "BIT Mesra campus feed",
    "verified college students India",
  ],
  alternates: {
    canonical: "https://campusloop.space/colleges",
  },
  openGraph: {
    title: "1,350+ Indian Colleges Directory & Campus Hubs | CampusLoop",
    description:
      "Explore verified student loops across 1,350+ Indian universities. Check if your college loop is active or request a new campus hub.",
    url: "https://campusloop.space/colleges",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Colleges Directory",
      },
    ],
  },
};

export default async function CollegesDirectoryPage() {
  const user = await hexclaveServerApp.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar isAuthenticated={!!user} />
      <main className="flex-1 pt-32 pb-24">
        <CollegesPublicClient isAuthenticated={!!user} />
      </main>
      <LandingFooter />
    </div>
  );
}
