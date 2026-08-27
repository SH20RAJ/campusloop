import { PresenceHeartbeat } from "@/components/pwa/presence-heartbeat";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

/**
 * Default for everything behind auth: stay out of search indexes.
 * Public, indexable surfaces (post/[id], college/[id], colleges,
 * communities, hashtag/[tag], branch/[slug], …) explicitly opt back in
 * with `robots: { index: true }` in their own metadata.
 */
export const metadata: Metadata = {
	robots: {
		index: false,
		follow: true,
	},
};

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedAuthUser();
  if (!user) {
    redirect("/handler/sign-in");
  }


  const profile = await getCachedUserProfile(user.id);

  if (profile?.role === "ADMIN") {
    return (
      <>
        <PresenceHeartbeat />
        {children}
      </>
    );
  }

  const email = user.primaryEmail;
  if (!email) {
    redirect("/invalid-email");
  }
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    redirect("/invalid-email");
  }

  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}

