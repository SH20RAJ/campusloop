import { desc, eq, ilike } from "drizzle-orm";
import { ExternalLink, Link2, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { institutions, posts } from "@/db/schema";
import { cleanSnippet } from "@/lib/utils";
import { resolveAdminSession } from "../_lib/guard";
import { EmbedsInspectorClient } from "./embeds-inspector-client";

export const metadata: Metadata = {
  title: "Embeds & Link Moderation Hub",
};

export const dynamic = "force-dynamic";

export default async function AdminEmbedsPage() {
  const { db } = await resolveAdminSession();

  // Query recent posts that contain external links or embeds
  const recentLinkPosts = await db
    .select({
      id: posts.id,
      body: posts.body,
      isAnonymous: posts.isAnonymous,
      pseudonym: posts.pseudonym,
      createdAt: posts.createdAt,
      institutionName: institutions.name,
    })
    .from(posts)
    .leftJoin(institutions, eq(posts.institutionId, institutions.id))
    .where(ilike(posts.body, "%http%"))
    .orderBy(desc(posts.createdAt))
    .limit(8)
    .catch(() => []);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Embeds &amp; Link Moderation Hub
          </h2>
          <p className="text-muted-foreground text-sm">
            Live URL embed sandbox, verified media providers, and timeline link inspection.
          </p>
        </div>
      </header>

      {/* Live Sandbox & Whitelist */}
      <EmbedsInspectorClient />

      {/* Recent Posts with External Links */}
      {recentLinkPosts.length > 0 && (
        <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Recent Timeline Posts with External Links
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor newly published posts containing media embeds or outbound links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLinkPosts.map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-2xl bg-muted/20 border border-border/30 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">
                    {post.isAnonymous ? post.pseudonym || "Anonymous Student" : "Verified Student"}
                  </span>
                  <span>{post.institutionName || "CampusLoop"}</span>
                </div>
                <p className="text-xs text-foreground leading-snug line-clamp-2">
                  {cleanSnippet(post.body, 120)}
                </p>
                <div className="flex items-center justify-end pt-1">
                  <Link
                    href={`/post/${post.id}`}
                    target="_blank"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Post</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
