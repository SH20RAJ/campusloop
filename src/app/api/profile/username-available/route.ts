import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { validateUsername } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * Handles that would collide with a real route or impersonate the platform.
 * Vanity profiles live at `/@handle`, so these are about `/u/` style links and
 * about not letting anyone register `admin` or `support`.
 */
const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "campusloop",
  "contact",
  "help",
  "login",
  "logout",
  "merchant",
  "moderator",
  "official",
  "privacy",
  "root",
  "safety",
  "settings",
  "signin",
  "signup",
  "staff",
  "support",
  "system",
  "team",
  "terms",
  "undefined",
  "null",
]);

export async function GET(req: NextRequest) {
  try {
    // Only signed-in users can probe handles, so this cannot be used to
    // enumerate the directory anonymously.
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = req.nextUrl.searchParams.get("username") || "";
    const candidate = raw.trim().toLowerCase();

    const validation = validateUsername(candidate);
    if (!validation.isValid) {
      return NextResponse.json({
        username: candidate,
        available: false,
        reason: validation.error,
      });
    }

    if (RESERVED_USERNAMES.has(candidate)) {
      return NextResponse.json({
        username: candidate,
        available: false,
        reason: "This username is reserved.",
      });
    }

    const db = getDb();

    // Someone editing their profile must not be told their own handle is taken.
    const [owner, existing] = await Promise.all([
      db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
        columns: { username: true },
      }),
      db.query.userProfiles.findFirst({
        where: eq(userProfiles.username, candidate),
        columns: { id: true },
      }),
    ]);

    if (owner?.username === candidate) {
      return NextResponse.json({ username: candidate, available: true, isCurrent: true });
    }

    return NextResponse.json({
      username: candidate,
      available: !existing,
      reason: existing ? "That username is already taken." : undefined,
    });
  } catch (error) {
    console.error("GET /api/profile/username-available error:", error);
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 });
  }
}
