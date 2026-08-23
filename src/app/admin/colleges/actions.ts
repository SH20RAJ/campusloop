"use server";

import {
	institutions,
	institutionDomains,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminDb } from "../_lib/guard";

function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export async function createCollege(formData: FormData) {
	const db = await getAdminDb();

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || slugify(name);
  const state = formData.get("state") as string;
  const district = formData.get("district") as string;
  const website = formData.get("website") as string;
  const websiteDomain = formData.get("websiteDomain") as string;
  const domainsRaw = formData.get("domains") as string;

  if (!name || name.trim().length === 0) {
    throw new Error("College name is required");
  }

  if (!slug || slug.trim().length === 0) {
    throw new Error("Slug is required");
  }

  // Check slug uniqueness
  const existing = await db.query.institutions.findFirst({
    where: eq(institutions.slug, slug),
  });
  if (existing) {
    throw new Error("A college with this slug already exists");
  }

  const [college] = await db
    .insert(institutions)
    .values({
      name: name.trim(),
      slug,
      aisheCode: slug,
      state: state || null,
      district: district || null,
      website: website || null,
      websiteDomain: websiteDomain || null,
      country: "India",
      source: "admin_added",
    })
    .returning();

  // Parse and insert additional domains
  if (domainsRaw) {
    const domainList = domainsRaw
      .split(/[\s,]+/)
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    if (domainList.length > 0) {
      await db.insert(institutionDomains).values(
        domainList.map((domain) => ({
          institutionId: college.id,
          domain,
          domainType: "STUDENT_EMAIL" as const,
          verificationStatus: "ADMIN_VERIFIED" as const,
        }))
      );
    }
  }

  revalidatePath("/admin/colleges");
  redirect("/admin/colleges");
}

export async function deleteCollege(id: string) {
  const db = await getAdminDb();
  await db.delete(institutions).where(eq(institutions.id, id));
  revalidatePath("/admin/colleges");
}

export async function addDomain(institutionId: string, domain: string) {
  const db = await getAdminDb();
  await db.insert(institutionDomains).values({
    institutionId,
    domain: domain.toLowerCase(),
    domainType: "STUDENT_EMAIL",
    verificationStatus: "ADMIN_VERIFIED",
  });
  revalidatePath("/admin/colleges");
}

export async function removeDomain(domainId: string) {
  const db = await getAdminDb();
  await db.delete(institutionDomains).where(eq(institutionDomains.id, domainId));
  revalidatePath("/admin/colleges");
}
