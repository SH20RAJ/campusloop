import "server-only";

import type { getDb } from "@/db";

export type Db = ReturnType<typeof getDb>;
