import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { institutionDomains, institutions } from "@/db/schema";

export type InstitutionOption = {
	id: string;
	name: string;
	slug: string;
	state: string | null;
	district: string | null;
	website: string | null;
	websiteDomain: string | null;
};

export function extractEmailDomain(email?: string | null) {
	const domain = email?.split("@")[1]?.trim().toLowerCase();
	return domain || null;
}

export function normalizeSearchText(value: string) {
	return value.trim().toLowerCase();
}

export async function listInstitutionOptions(): Promise<InstitutionOption[]> {
	const db = getDb();

	return db
		.select({
			id: institutions.id,
			name: institutions.name,
			slug: institutions.slug,
			state: institutions.state,
			district: institutions.district,
			website: institutions.website,
			websiteDomain: institutions.websiteDomain,
		})
		.from(institutions)
		.orderBy(asc(institutions.name));
}

export async function findInstitutionByDomain(domain: string): Promise<InstitutionOption | null> {
	const db = getDb();
	const [match] = await db
		.select({
			id: institutions.id,
			name: institutions.name,
			slug: institutions.slug,
			state: institutions.state,
			district: institutions.district,
			website: institutions.website,
			websiteDomain: institutions.websiteDomain,
		})
		.from(institutionDomains)
		.innerJoin(institutions, eq(institutionDomains.institutionId, institutions.id))
		.where(eq(institutionDomains.domain, domain))
		.limit(1);

	return match ?? null;
}
