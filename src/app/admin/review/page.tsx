import { CheckCircle2, ShieldAlert, VenetianMask, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { resolveAdminSession } from "../_lib/guard";
import { getPendingReviewPosts } from "../_lib/queries";
import { approvePendingPost, rejectPendingPost } from "../posts/actions";

export const metadata: Metadata = {
  title: "Review Queue",
};

function riskTone(score: number) {
  if (score >= 70) return "destructive" as const;
  if (score >= 45) return "secondary" as const;
  return "outline" as const;
}

export default async function ReviewQueuePage() {
  const { db } = await resolveAdminSession();
  const queue = await getPendingReviewPosts(db).catch(() => []);

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Review Queue
          </h2>
          <p className="text-muted-foreground text-sm">
            Posts flagged by automated filters or high-risk rules awaiting manual action.
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {queue.length} pending
        </Badge>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Queue is clear</h3>
          <p className="text-xs text-muted-foreground">No posts are awaiting review right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <Badge variant={riskTone(post.riskScore)}>Risk {post.riskScore}</Badge>
                <Badge variant="outline">{post.type}</Badge>
                {post.isAnonymous && (
                  <Badge variant="outline" className="text-muted-foreground inline-flex items-center gap-1">
                    <VenetianMask className="size-3" />
                    <span>{post.pseudonym || "anon"}</span>
                  </Badge>
                )}
                <span className="text-muted-foreground ml-auto">
                  {post.institutionName?.split(",")[0]} · {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">
                {post.body}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <form action={approvePendingPost.bind(null, post.id)}>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 gap-1.5 h-8 text-xs cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Publish
                  </Button>
                </form>
                <form action={rejectPendingPost.bind(null, post.id)}>
                  <Button size="sm" variant="destructive" className="gap-1.5 h-8 text-xs cursor-pointer">
                    <XCircle className="h-3.5 w-3.5" /> Hide
                  </Button>
                </form>
                <Link
                  href={`/app/post/${post.id}`}
                  target="_blank"
                  className="ml-auto text-[11px] font-semibold text-primary hover:underline"
                >
                  View live →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
