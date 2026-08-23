"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
	ADMIN_SESSION_COOKIE,
	ADMIN_SESSION_MAX_AGE_SECONDS,
	createAdminSessionToken,
	verifyAdminPasskey,
} from "../admin/_lib/session";

export async function loginWithPasskey(formData: FormData) {
	const passkey = String(formData.get("passkey") ?? "");

	if (!verifyAdminPasskey(passkey)) {
		throw new Error("Invalid passkey");
	}

	const cookieStore = await cookies();
	cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
	});

	redirect("/admin");
}
