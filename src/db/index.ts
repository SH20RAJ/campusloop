import { neon,NeonDbError,type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const MAX_DB_RETRIES = 2;

function isTransientDbError(error: unknown): boolean {
	if (error instanceof NeonDbError) {
		return !error.code;
	}
	return error instanceof TypeError;
}

function withRetry<R>(fn: () => Promise<R>): Promise<R> {
	return (async () => {
		for (let attempt = 0; ; attempt++) {
			try {
				return await fn();
			} catch (error) {
				if (attempt >= MAX_DB_RETRIES || !isTransientDbError(error)) {
					throw error;
				}
				await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
			}
		}
	})();
}

function createResilientSql(connectionString: string): NeonQueryFunction<false, false> {
	const sql = neon(connectionString);

	const retryingQuery = ((query: string, params?: unknown[], opts?: unknown) =>
		withRetry(() => sql.query(query, params as never, opts as never))) as unknown as NeonQueryFunction<false, false>;

	return new Proxy(retryingQuery, {
		get(_target, prop) {
			if (prop === "query") {
				return retryingQuery;
			}
			const value = Reflect.get(sql, prop);
			return typeof value === "function" ? value.bind(sql) : value;
		},
		apply(_target, _thisArg, args): Promise<unknown> {
			return withRetry(() => (sql as (...fnArgs: unknown[]) => Promise<unknown>)(...args));
		},
	});
}

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
		const sql = createResilientSql(getDatabaseUrl());
		globalForDb.campusloopDb = drizzle({ client: sql, schema });
	}

	return globalForDb.campusloopDb;
}

export { schema };
