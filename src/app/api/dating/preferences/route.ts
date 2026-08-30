import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { resolveGenderPreference } from "@/lib/dating";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const GENDERS = ["DEFAULT", "MALE", "FEMALE", "ALL"] as const;
const SCOPES = ["GLOBAL", "CAMPUS"] as const;
const SORTS = ["COMPATIBILITY", "RECENT", "POPULAR"] as const;

export type DatingPreferences = {
  gender: (typeof GENDERS)[number];
  scope: (typeof SCOPES)[number];
  sort: (typeof SORTS)[number];
};

const DEFAULTS: DatingPreferences = { gender: "DEFAULT", scope: "GLOBAL", sort: "COMPATIBILITY" };

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const prefs = { ...DEFAULTS, ...(profile.datingPreferences ?? {}) };
    return NextResponse.json({
      preferences: prefs,
      recommendedGender: resolveGenderPreference(profile.gender, null),
    });
  } catch (error) {
    console.error("Error fetching dating preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const body = (await req.json()) as Partial<DatingPreferences>;
    const current = { ...DEFAULTS, ...(profile.datingPreferences ?? {}) };

    const next: DatingPreferences = {
      gender: GENDERS.includes(body.gender as never)
        ? (body.gender as DatingPreferences["gender"])
        : current.gender,
      scope: SCOPES.includes(body.scope as never)
        ? (body.scope as DatingPreferences["scope"])
        : current.scope,
      sort: SORTS.includes(body.sort as never) ? (body.sort as DatingPreferences["sort"]) : current.sort,
    };

    await db.update(userProfiles).set({ datingPreferences: next }).where(eq(userProfiles.id, profile.id));

    return NextResponse.json({ preferences: next });
  } catch (error) {
    console.error("Error saving dating preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
