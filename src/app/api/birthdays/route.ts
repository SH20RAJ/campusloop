import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!currentProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "CAMPUS";
    const targetDateParam = searchParams.get("date"); // e.g. "2026-08-23" or "08-23"
    const targetMonthParam = searchParams.get("month"); // e.g. "8" or "08"

    // Fetch active profiles with public DOB
    const conditions = [
      eq(userProfiles.status, "ACTIVE"),
      eq(userProfiles.isDobPrivate, false),
      isNotNull(userProfiles.dob),
    ];

    if (scope === "CAMPUS" && currentProfile.institutionId) {
      conditions.push(eq(userProfiles.institutionId, currentProfile.institutionId));
    }

    const profiles = await db.query.userProfiles.findMany({
      where: and(...conditions),
      with: {
        institution: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate(); // 1-31

    const todayMMDD = targetDateParam
      ? (targetDateParam.length === 10 ? targetDateParam.substring(5) : targetDateParam)
      : `${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;

    const todayCelebrants: typeof profiles = [];
    const upcomingCelebrants: Array<{
      profile: (typeof profiles)[number];
      daysUntil: number;
      birthMonth: number;
      birthDay: number;
    }> = [];
    const monthCelebrants: typeof profiles = [];

    const selectedMonthNum = targetMonthParam ? parseInt(targetMonthParam, 10) : null;

    for (const p of profiles) {
      if (!p.dob) continue;
      const parts = p.dob.split("-");
      if (parts.length < 3) continue;

      const birthMonth = parseInt(parts[1], 10);
      const birthDay = parseInt(parts[2], 10);
      const mmdd = `${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

      // Today's birthday
      if (mmdd === todayMMDD) {
        todayCelebrants.push(p);
      }

      // Filter by specified month if requested
      if (selectedMonthNum && birthMonth === selectedMonthNum) {
        monthCelebrants.push(p);
      }

      // Calculate days until next birthday
      const thisYearBirthday = new Date(now.getFullYear(), birthMonth - 1, birthDay);
      let diffDays = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        // Birthday already occurred this year, calculate for next year
        const nextYearBirthday = new Date(now.getFullYear() + 1, birthMonth - 1, birthDay);
        diffDays = Math.ceil((nextYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (diffDays >= 0 && diffDays <= 60 && mmdd !== todayMMDD) {
        upcomingCelebrants.push({
          profile: p,
          daysUntil: diffDays,
          birthMonth,
          birthDay,
        });
      }
    }

    // Sort upcoming by daysUntil ascending
    upcomingCelebrants.sort((a, b) => a.daysUntil - b.daysUntil);

    return NextResponse.json({
      today: todayCelebrants.map((p) => ({
        id: p.id,
        userId: p.userId,
        username: p.username,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        course: p.course,
        branch: p.branch,
        gender: p.gender,
        dob: p.dob,
        institution: p.institution,
      })),
      upcoming: upcomingCelebrants.slice(0, 30).map((u) => ({
        id: u.profile.id,
        userId: u.profile.userId,
        username: u.profile.username,
        displayName: u.profile.displayName,
        avatarUrl: u.profile.avatarUrl,
        course: u.profile.course,
        branch: u.profile.branch,
        gender: u.profile.gender,
        dob: u.profile.dob,
        daysUntil: u.daysUntil,
        birthMonth: u.birthMonth,
        birthDay: u.birthDay,
        institution: u.profile.institution,
      })),
      byMonth: monthCelebrants.map((p) => ({
        id: p.id,
        userId: p.userId,
        username: p.username,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        course: p.course,
        branch: p.branch,
        dob: p.dob,
        institution: p.institution,
      })),
      currentUserDob: currentProfile.dob,
      currentUserIsPrivate: currentProfile.isDobPrivate,
    });
  } catch (error) {
    console.error("Error fetching birthdays:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
