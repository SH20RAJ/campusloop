import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

function getDatabaseUrl() {
	const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;

	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL. Set DATABASE_URL or DB_URL before using the database.");
	}

	return databaseUrl;
}

function createClient() {
	const options: postgres.Options<never> = {
		max: "Cloudflare" in globalThis ? 1 : 5,
		idle_timeout: 15,
		connect_timeout: 10,
		prepare: false,
	};

	// Cloudflare Workers' node:tls shim does not support rejectUnauthorized.
	// Passing an empty object to ssl options triggers a secure TLS connection
	// without passing any unsupported rejectUnauthorized parameters.
	if ("Cloudflare" in globalThis) {
		options.ssl = {};
	}

	return postgres(getDatabaseUrl(), options);
}

const globalForDb = globalThis as typeof globalThis & {
	campusloopSql?: ReturnType<typeof createClient>;
	campusloopDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
	if (!globalForDb.campusloopSql) {
		globalForDb.campusloopSql = createClient();
	}

	if (!globalForDb.campusloopDb) {
		globalForDb.campusloopDb = drizzle(globalForDb.campusloopSql, { schema });
	}

	return globalForDb.campusloopDb;
}

export { schema };
