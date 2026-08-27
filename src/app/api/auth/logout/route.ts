import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
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

    return NextResponse.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ success: true, message: "Logged out with fallback" });
  }
}

export async function GET() {
  return POST();
}
