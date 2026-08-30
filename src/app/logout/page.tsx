import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LogoutClient } from "./logout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log Out | CampusLoop",
  description: "Logging out securely from your verified campus account.",
  robots: { index: false, follow: false },
};

export default async function LogoutPage() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    for (const c of allCookies) {
      if (
        c.name.includes("stack") ||
        c.name.includes("hexclave") ||
        c.name.includes("session") ||
        c.name.includes("token") ||
        c.name.includes("auth") ||
        c.name.startsWith("cl_")
      ) {
        cookieStore.delete(c.name);
      }
    }
  } catch (err) {
    console.warn("Logout page cookie deletion fallback:", err);
  }

  return <LogoutClient />;
}
