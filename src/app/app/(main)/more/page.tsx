import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { Metadata } from "next";
import { MoreClient } from "./more-client";

export const metadata: Metadata = {
  title: "More | CampusLoop",
  description: "Explore all campus directories, secret crush vault, match mode, confessions, and settings on CampusLoop.",
};

export default async function MorePage() {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;
  const isAdmin = profile?.role === "ADMIN";

  return <MoreClient isAdmin={isAdmin} />;
}
