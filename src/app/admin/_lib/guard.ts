import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { userProfiles,type UserProfile } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq,sql } from "drizzle-orm";
import { ADMIN_SESSION_COOKIE,isValidAdminSessionToken } from "./session";

type Db = ReturnType<typeof getDb>;

/**
 * Single source of truth for admin authorization.
 *
 * Two paths:
 * 1. Signed passkey session cookie — owner convenience on read surfaces.
 *    NEVER accepted for identity reveal (see anonymity-actions).
 * 2. Hexclave session with role === "ADMIN" — required for sensitive actions.
 */

function hasPasskeySession(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
	return isValidAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function getAdminDb(): Promise<Db> {
	const cookieStore = await cookies();
	if (hasPasskeySession(cookieStore)) {
		return getDb();
	}
	const { db } = await requireAdminProfile();
	return db;
}

/** Strict path: a real logged-in ADMIN profile. Used for reveal & audit. */
export async function requireAdminProfile(): Promise<{ db: Db; profile: UserProfile }> {
	const user = await hexclaveServerApp.getUser();
	if (!user) throw new Error("Unauthorized");

	const db = getDb();
	const profile = await db.query.userProfiles.findFirst({
		where: eq(userProfiles.userId, user.id),
	});

	if (!profile || profile.role !== "ADMIN") {
		throw new Error("Forbidden — ADMIN role required");
	}

	return { db, profile };
}

export type AdminSessionContext = {
	db: Db;
	profile: UserProfile | null;
	isLegacyPasskey: boolean;
};

/** Layout-level check: signed passkey session OR ADMIN profile. Also bootstraps first admin. */
export async function resolveAdminSession(): Promise<AdminSessionContext> {
	const cookieStore = await cookies();
	const isLegacyPasskey = hasPasskeySession(cookieStore);
	const db = getDb();

	if (!isLegacyPasskey) {
		const user = await hexclaveServerApp.getUser();
		if (!user) redirect("/admin-login");

		await bootstrapFirstAdmin(db, user.id, user.primaryEmail);

		const profile = await db.query.userProfiles.findFirst({
			where: eq(userProfiles.userId, user.id),
		});
		if (!profile || profile.role !== "ADMIN") redirect("/admin-login");

		return { db, profile, isLegacyPasskey: false };
	}

	return { db, profile: null, isLegacyPasskey: true };
}

async function bootstrapFirstAdmin(db: Db, userId: string, email?: string | null) {
	const [count] = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
	if (count.count !== 0) return;

	const fallbackInst = await db.query.institutions.findFirst();
	if (!fallbackInst) return;

	await db.insert(userProfiles).values({
		userId,
		username: (email?.split("@")[0] || "admin").toLowerCase(),
		displayName: "Admin",
		institutionId: fallbackInst.id,
		onboardingCompleted: true,
		role: "ADMIN",
		status: "ACTIVE",
	});
}
