import { defineConfig } from "drizzle-kit";

import { loadLocalEnv } from "./src/lib/load-env";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;

if (!databaseUrl) {
	throw new Error("Missing DATABASE_URL. Set DATABASE_URL or DB_URL before running Drizzle commands.");
}

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
});
