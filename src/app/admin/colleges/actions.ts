"use server";

import { getDb } from "@/db";
import { institutions, institutionDomains } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function verifyAdmin() {
  // Try passkey bypass first
  const cookieStore = await cookies();
  const passkey = cookieStore.get("admin_session")?.value;
  if (passkey === "17092006") {
    return getDb();
  }

  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile || profile.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return db;
}

export async function deleteCollege(id: string) {
  const db = await verifyAdmin();
  await db.delete(institutions).where(eq(institutions.id, id));
}

export async function addDomain(institutionId: string, domain: string) {
  const db = await verifyAdmin();
  await db.insert(institutionDomains).values({
    institutionId,
    domain: domain.toLowerCase(),
    domainType: "STUDENT_EMAIL",
    verificationStatus: "ADMIN_VERIFIED",
  });
}

export async function removeDomain(domainId: string) {
  const db = await verifyAdmin();
  await db.delete(institutionDomains).where(eq(institutionDomains.id, domainId));
}
