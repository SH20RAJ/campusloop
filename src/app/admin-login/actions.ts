"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginWithPasskey(formData: FormData) {
  const passkey = formData.get("passkey") as string;

  if (passkey === "17092006") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "17092006", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    redirect("/admin");
  } else {
    throw new Error("Invalid passkey");
  }
}
