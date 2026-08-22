import "server-only";

import { getDb } from "@/db";

export type Db = ReturnType<typeof getDb>;
