"use server";

import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { isAllowedAdminEmail } from "../admin/_lib/session";

export async function checkAdminAccess() {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (isAllowedAdminEmail(user.primaryEmail)) {
    redirect("/admin");
  }

  throw new Error(
    `Access restricted: Account "${user.primaryEmail || "unknown"}" is not an authorized administrator.`
  );
}
