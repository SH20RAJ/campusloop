import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function getDatabaseUrl() {
	const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;

	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL. Set DATABASE_URL or DB_URL before using the database.");
	}

	return databaseUrl;
}

const globalForDb = globalThis as typeof globalThis & {
	campusloopDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
	if (!globalForDb.campusloopDb) {
		const sql = neon(getDatabaseUrl());
		globalForDb.campusloopDb = drizzle({ client: sql, schema });
	}

	return globalForDb.campusloopDb;
}

export { schema };
