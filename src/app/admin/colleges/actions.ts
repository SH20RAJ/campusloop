"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { institutionDomains, institutions } from "@/db/schema";

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

export async function updateCollegeDetails(
  id: string,
  data: {
    name: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    nirfRank?: number | null;
    description?: string | null;
    website?: string | null;
    state?: string | null;
    district?: string | null;
    yearOfEstablishment?: number | null;
    extraData?: Record<string, unknown> | null;
  }
) {
  const db = await getAdminDb();

  await db
    .update(institutions)
    .set({
      name: data.name.trim(),
      logoUrl: data.logoUrl ? data.logoUrl.trim() : null,
      bannerUrl: data.bannerUrl ? data.bannerUrl.trim() : null,
      nirfRank: data.nirfRank || null,
      description: data.description ? data.description.trim() : null,
      website: data.website ? data.website.trim() : null,
      state: data.state ? data.state.trim() : null,
      district: data.district ? data.district.trim() : null,
      yearOfEstablishment: data.yearOfEstablishment || null,
      extraData: data.extraData || null,
    })
    .where(eq(institutions.id, id));

  revalidatePath("/admin/colleges");
  revalidatePath("/colleges");
}
