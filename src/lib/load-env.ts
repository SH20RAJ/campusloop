import { existsSync } from "node:fs";

import { config } from "dotenv";

export function loadLocalEnv() {
	for (const path of [".env", ".env.local"]) {
		if (existsSync(path)) {
			config({ path, override: true, quiet: true });
		}
	}
}
