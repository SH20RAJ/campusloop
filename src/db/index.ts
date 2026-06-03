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
	return postgres(getDatabaseUrl(), {
		max: 10,
		prepare: false,
	});
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
