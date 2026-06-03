import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { institutionDomains, institutions, type NewInstitution } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

type CollegeCsvRow = {
	Aishe_Code?: string;
	Name?: string;
	State?: string;
	District?: string;
	Website?: string;
	Year_Of_Establishment?: string;
	Location?: string;
	Slug?: string;
};

const BATCH_SIZE = 500;

function requireDatabaseUrl() {
	const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;

	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL. Set DATABASE_URL or DB_URL before running db:seed.");
	}

	return databaseUrl;
}

function normalizeDomain(website?: string | null) {
	const raw = website?.trim();

	if (!raw) {
		return null;
	}

	return raw
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./i, "")
		.split(/[/?#]/)[0]
		.replace(/\/+$/g, "")
		.trim()
		.toLowerCase() || null;
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

function stableId(prefix: string, value: string) {
	const hash = createHash("sha256").update(value).digest("hex").slice(0, 24);
	return `${prefix}_${hash}`;
}

function parseYear(value?: string) {
	const year = Number.parseInt(value ?? "", 10);
	return Number.isFinite(year) ? year : null;
}

function chunk<T>(items: T[], size: number) {
	const chunks: T[][] = [];

	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}

	return chunks;
}

async function main() {
	const csvPath = path.join(process.cwd(), "src/lib/colleges.csv");
	const csv = await readFile(csvPath, "utf8");
	const rows = parse(csv, {
		bom: true,
		columns: true,
		relax_column_count: true,
		skip_empty_lines: true,
		trim: true,
	}) as CollegeCsvRow[];

	const usedSlugs = new Set<string>();
	const institutionsToInsert: NewInstitution[] = [];
	const domainsToInsert: (typeof institutionDomains.$inferInsert)[] = [];

	for (const row of rows) {
		const aisheCode = row.Aishe_Code?.trim();
		const name = row.Name?.trim();

		if (!aisheCode || !name) {
			continue;
		}

		let slug = slugify(row.Slug?.trim() || name);
		if (!slug) {
			slug = stableId("college", aisheCode);
		}

		if (usedSlugs.has(slug)) {
			slug = `${slug}-${slugify(aisheCode)}`;
		}
		usedSlugs.add(slug);

		const website = row.Website?.trim() || null;
		const websiteDomain = normalizeDomain(website);
		const institutionId = stableId("inst", aisheCode);

		institutionsToInsert.push({
			id: institutionId,
			aisheCode,
			name,
			slug,
			state: row.State?.trim() || null,
			district: row.District?.trim() || null,
			website,
			websiteDomain,
			yearOfEstablishment: parseYear(row.Year_Of_Establishment),
			locationType: row.Location?.trim() || null,
			country: "India",
			source: "colleges_csv",
		});

		if (websiteDomain) {
			domainsToInsert.push({
				id: stableId("domain", websiteDomain),
				institutionId,
				domain: websiteDomain,
				domainType: "WEBSITE",
				verificationStatus: "AUTO_IMPORTED",
			});
		}
	}

	const client = postgres(requireDatabaseUrl(), { max: 1, prepare: false });
	const db = drizzle(client);

	for (const batch of chunk(institutionsToInsert, BATCH_SIZE)) {
		await db.insert(institutions).values(batch).onConflictDoNothing();
	}

	for (const batch of chunk(domainsToInsert, BATCH_SIZE)) {
		await db.insert(institutionDomains).values(batch).onConflictDoNothing();
	}

	await client.end();

	console.log(
		`Seeded ${institutionsToInsert.length} institutions and ${domainsToInsert.length} website domains from colleges.csv.`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
