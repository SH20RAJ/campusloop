import type { Metadata } from "next";
import { resolveAdminSession } from "../_lib/guard";
import { SystemClient } from "./system-client";

export const metadata: Metadata = {
  title: "System Diagnostics & Telemetry",
};

export const dynamic = "force-dynamic";

export default async function AdminSystemPage() {
  await resolveAdminSession();

  const envMatrix = [
    {
      name: "DATABASE_URL",
      category: "Database",
      isConfigured: Boolean(process.env.DATABASE_URL),
      notes: "Neon Serverless PostgreSQL connection pool",
    },
    {
      name: "HEXCLAVE_PROJECT_ID",
      category: "Authentication",
      isConfigured: Boolean(process.env.HEXCLAVE_PROJECT_ID),
      notes: "Student verification and session management engine",
    },
    {
      name: "UPSTASH_REDIS_REST_URL",
      category: "Caching & Signaling",
      isConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      notes: "Sub-5ms user behavior tracking and interest affinity sets",
    },
    {
      name: "QDRANT_URL",
      category: "Vector Database",
      isConfigured: Boolean(process.env.QDRANT_URL),
      notes: "Semantic feed recommendations (circuit-breaker protected with relational fallback)",
    },
    {
      name: "COMPOSIO_API_KEY",
      category: "Integrations",
      isConfigured: Boolean(process.env.COMPOSIO_API_KEY),
      notes: "Multi-app orchestration (Reddit, Cloudflare, Discord, Telegram, Sheets)",
    },
    {
      name: "NEXT_PUBLIC_APP_URL",
      category: "Network",
      isConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL),
      notes: "Canonical domain binding (campusloop.space)",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            System Diagnostics &amp; Health Matrix
          </h2>
          <p className="text-muted-foreground text-sm">
            Service environment audits, live latency tests, and architectural invariant checks.
          </p>
        </div>
      </header>

      <SystemClient envMatrix={envMatrix} />
    </div>
  );
}
