import type { Metadata } from "next";
import { resolveAdminSession } from "../_lib/guard";
import { ComposioHubClient } from "./composio-hub-client";

export const metadata: Metadata = {
  title: "Composio Integrations & Automation Hub",
};

export const dynamic = "force-dynamic";

export default async function AdminComposioPage() {
  const { db } = await resolveAdminSession();

  const institutions = await db.query.institutions.findMany({
    columns: {
      id: true,
      name: true,
    },
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Composio Integrations &amp; Automation Hub
          </h2>
          <p className="text-muted-foreground text-sm">
            Orchestrate Reddit campus sync, Cloudflare edge CDN, webhook moderation alerts, and data exports.
          </p>
        </div>
      </header>

      <ComposioHubClient institutions={institutions} />
    </div>
  );
}
