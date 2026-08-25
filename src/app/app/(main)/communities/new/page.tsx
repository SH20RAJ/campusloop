import { Metadata } from "next";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { CreateCommunityClient } from "@/components/communities/create-community-client";

export const metadata: Metadata = {
  title: "Create a Student Community | CampusLoop",
  description: "Found a college sub-hub, branch group, or student community on CampusLoop and earn +100 LP Clout.",
  alternates: { canonical: "https://campusloop.space/app/communities/new" },
  openGraph: {
    title: "Create a Student Community | CampusLoop",
    description: "Found a college sub-hub or student community on CampusLoop.",
    url: "https://campusloop.space/app/communities/new",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Create a Student Community | CampusLoop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create a Student Community | CampusLoop",
    description: "Found a college sub-hub or student community on CampusLoop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: false, follow: false },
};


export default async function NewCommunityPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  return <CreateCommunityClient />;
}
