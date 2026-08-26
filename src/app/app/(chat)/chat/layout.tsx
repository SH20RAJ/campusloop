import { Navigation } from "@/components/ui/navigation";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Messages | CampusLoop",
  description: "Chat privately with verified students across your campus loop.",
  openGraph: {
    title: "Messages | CampusLoop",
    description: "Chat privately with verified students across your campus loop.",
    url: "https://campusloop.space/app/chat",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Messages | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Messages | CampusLoop",
    description: "Chat privately with verified students across your campus loop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: false, follow: false },
};

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedAuthUser();
  if (!user) redirect("/join");

  const profile = await getCachedUserProfile(user.id);
  if (!profile) redirect("/app/onboarding");

  return (
    <div className="relative min-h-screen h-[100dvh] bg-background overflow-hidden flex">
      {/* Desktop Navigation Sidebar */}
      <Navigation
        profile={profile}
        collegeName={profile.institution?.name ?? "Your College"}
        isAdmin={profile.role === "ADMIN"}
      />

      {/* Main Messenger Area */}
      <div className="flex-1 md:pl-64 h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
