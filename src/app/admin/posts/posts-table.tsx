"use client";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RotateCcw,
  SearchIcon,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { type RevealedIdentity, revealAnonymousAuthor } from "../anonymity-actions";
import {
  deletePost,
  restoreAllSeededPosts,
  toggleHidePost,
  togglePostSeededStatus,
  unlistAllSeededPosts,
} from "./actions";
import type { PostAnonFilter, PostOriginFilter, PostStatusFilter } from "./page";

const statusTabs: { value: PostStatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PUBLISHED", label: "✅ Published" },
  { value: "HIDDEN", label: "🙈 Hidden (Unlisted)" },
  { value: "PENDING_REVIEW", label: "⚠️ Flagged" },
  { value: "DELETED", label: "🗑️ Deleted" },
];

const originTabs: { value: PostOriginFilter; label: string }[] = [
  { value: "all", label: "All Origins" },
  { value: "real", label: "👤 Real Students Only" },
  { value: "seeded", label: "🤖 Seeded / Bot Data" },
];

const anonTabs: { value: PostAnonFilter; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "anon", label: "👻 Anonymous" },
  { value: "public", label: "Named" },
];

interface AuthorInfo {
  id: string;
  username: string;
  displayName: string;
  officialName?: string | null;
  email?: string | null;
  isSeeded?: boolean;
}

interface PostRow {
  id: string;
  body: string;
  type: string;
  isAnonymous: boolean;
  isSeeded: boolean;
  pseudonym?: string | null;
  status: string;
  riskScore?: number;
  createdAt: string | Date;
  institution?: { name: string; slug?: string } | null;
  author?: AuthorInfo | null;
}

interface PostsTableProps {
  initialPosts: PostRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  activeStatus: PostStatusFilter;
  activeAnon: PostAnonFilter;
  activeOrigin: PostOriginFilter;
  realCount: number;
  seededCount: number;
}

const statusBadgeTone: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  PENDING_REVIEW: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  HIDDEN: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  DELETED: "bg-red-500/15 text-red-500 border-red-500/30",
};

export function PostsTable({
  initialPosts,
  page,
  totalPages,
  totalCount,
  activeStatus,
  activeAnon,
  activeOrigin,
  realCount,
  seededCount,
}: PostsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, RevealedIdentity>>({});
  const [revealPostId, setRevealPostId] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [showUnlistConfirm, setShowUnlistConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`/admin/posts?${params.toString()}`);
  }

  async function runAction(postId: string, fn: () => Promise<unknown>, successMsg = "Action completed") {
    setActionLoading(postId);
    try {
      await fn();
      toast.success(successMsg);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleHide(postId: string) {
    await runAction(postId, () => toggleHidePost(postId), "Post visibility updated");
  }

  async function handleToggleSeeded(postId: string, currentIsSeeded: boolean) {
    await runAction(
      postId,
      () => togglePostSeededStatus(postId, !currentIsSeeded),
      currentIsSeeded ? "Post marked as REAL student content" : "Post marked as SEEDED / BOT"
    );
  }

  async function handleUnlistAllSeeded() {
    setActionLoading("bulk_unlist");
    try {
      await unlistAllSeededPosts();
      toast.success("All seeded bot posts unlisted & hidden from public website!");
      setShowUnlistConfirm(false);
      router.refresh();
    } catch {
      toast.error("Failed to unlist seeded posts");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRestoreAllSeeded() {
    setActionLoading("bulk_restore");
    try {
      await restoreAllSeededPosts();
      toast.success("Seeded bot posts restored to published status");
      setShowRestoreConfirm(false);
      router.refresh();
    } catch {
      toast.error("Failed to restore seeded posts");
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmReveal() {
    if (!revealPostId) return;
    const postId = revealPostId;
    await runAction(
      postId,
      async () => {
        const identity = await revealAnonymousAuthor("POST", postId);
        setRevealed((prev) => ({ ...prev, [postId]: identity }));
        setRevealPostId(null);
      },
      "Anonymous author revealed (audit logged)"
    );
  }

  async function confirmDelete() {
    if (!deletePostId) return;
    const postId = deletePostId;
    await runAction(
      postId,
      async () => {
        await deletePost(postId);
        setDeletePostId(null);
      },
      "Post deleted successfully"
    );
  }

  return (
    <div className="space-y-4">
      {/* ─── Bulk Moderation Banner ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <UserCheck className="size-3.5" />
              <span>{realCount} Authentic Student Posts</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
              <Bot className="size-3.5" />
              <span>{seededCount} Seeded Bot Posts</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Seeded posts are unlisted from public feeds so students only see real peer conversations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowUnlistConfirm(true)}
            disabled={actionLoading === "bulk_unlist"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <EyeOff className="size-3.5" />
            <span>Unlist All Seeded</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRestoreConfirm(true)}
            disabled={actionLoading === "bulk_restore"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="size-3.5" />
            <span>Restore Seeded</span>
          </button>
        </div>
      </div>

      {/* ─── Filters & Search Bar ─── */}
      <div className="flex flex-col gap-3">
        {/* Origin Tabs (Real vs Seeded) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Origin:</span>
          {originTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                pushParams((p) => {
                  p.set("origin", tab.value);
                  p.delete("page");
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeOrigin === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Status:</span>
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                pushParams((p) => {
                  p.set("status", tab.value);
                  p.delete("page");
                })
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeStatus === tab.value
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Anonymity Filter + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Type:</span>
            {anonTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  pushParams((p) => {
                    p.set("anon", tab.value);
                    p.delete("page");
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  activeAnon === tab.value
                    ? "bg-foreground/90 text-background"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              pushParams((p) => {
                if (search.trim()) p.set("q", search.trim());
                else p.delete("q");
                p.delete("page");
              });
            }}
            className="relative flex-1 sm:max-w-xs"
          >
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search post text..."
              className="w-full h-9 rounded-xl bg-muted/40 border border-border/60 pl-9 pr-3 text-xs outline-none focus:border-primary transition-colors text-foreground"
            />
          </form>
        </div>
      </div>

      {/* ─── Posts Table ─── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-bold">Post Content</th>
                <th className="px-4 py-3 font-bold">Author &amp; Origin</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs">
              {initialPosts.map((post) => {
                const isReal = !post.isSeeded;
                return (
                  <tr
                    key={post.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      post.status === "HIDDEN" ? "opacity-75 bg-muted/5" : ""
                    }`}
                  >
                    {/* Post Content */}
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                            {post.type}
                          </span>
                          {post.isAnonymous && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              👻 {post.pseudonym || "Anon"}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/70">
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-foreground font-medium line-clamp-3 leading-relaxed break-words">
                          {post.body}
                        </p>

                        {post.institution && (
                          <p className="text-[10px] text-muted-foreground/80 truncate">
                            🏫 {post.institution.name}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Author & Origin */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        {isReal ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            <UserCheck className="size-3" />
                            <span>Real Student</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-muted text-muted-foreground border border-border">
                            <Bot className="size-3" />
                            <span>Seeded Bot</span>
                          </div>
                        )}

                        {post.author ? (
                          <div className="text-[11px]">
                            <p className="font-bold text-foreground truncate max-w-[150px]">
                              {post.author.displayName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                              @{post.author.username}
                            </p>
                            {post.author.email && (
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono truncate max-w-[150px]">
                                {post.author.email}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic">Anonymous author</p>
                        )}

                        {revealed[post.id] && (
                          <div className="text-[10px] p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            ID: @{revealed[post.id].username} ({revealed[post.id].displayName || "N/A"})
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          statusBadgeTone[post.status] ?? "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {post.status === "HIDDEN" ? "🙈 HIDDEN / UNLISTED" : post.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Instant Hide / Unhide Toggle */}
                        {post.status === "PUBLISHED" ? (
                          <button
                            type="button"
                            disabled={actionLoading === post.id}
                            onClick={() => handleToggleHide(post.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                            title="Hide / Unlist from website feeds"
                          >
                            <EyeOff className="size-3" />
                            <span>Hide</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionLoading === post.id}
                            onClick={() => handleToggleHide(post.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                            title="Unhide / Publish to website feeds"
                          >
                            <Eye className="size-3" />
                            <span>Unhide</span>
                          </button>
                        )}

                        {/* Toggle Seeded Flag if needed */}
                        <button
                          type="button"
                          disabled={actionLoading === post.id}
                          onClick={() => handleToggleSeeded(post.id, post.isSeeded)}
                          className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title={
                            post.isSeeded ? "Switch to Real Student Content" : "Switch to Seeded Content"
                          }
                        >
                          {post.isSeeded ? <UserCheck className="size-3.5" /> : <Bot className="size-3.5" />}
                        </button>

                        {/* Reveal Anonymous identity (audit logged) */}
                        {post.isAnonymous && !revealed[post.id] && (
                          <button
                            type="button"
                            disabled={actionLoading === post.id}
                            onClick={() => setRevealPostId(post.id)}
                            title="Reveal anonymous author (audit logged)"
                            className="p-1.5 rounded-xl hover:bg-muted text-blue-500 transition-colors cursor-pointer"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        )}

                        {/* Delete post */}
                        <button
                          type="button"
                          disabled={actionLoading === post.id}
                          onClick={() => setDeletePostId(post.id)}
                          title="Delete post permanently"
                          className="p-1.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {initialPosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No posts found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground font-medium">
            {totalCount.toLocaleString()} posts total · Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => pushParams((p) => p.set("page", String(page - 1)))}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-xs font-bold text-foreground">{page}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => pushParams((p) => p.set("page", String(page + 1)))}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Confirm Dialogs ─── */}
      <ConfirmDialog
        isOpen={showUnlistConfirm}
        onClose={() => setShowUnlistConfirm(false)}
        title="Unlist All Seeded Bot Posts?"
        description="This will set all 1,350+ seeded bot posts to HIDDEN across the platform without deleting them. Only authentic student posts will remain visible on all feeds."
        confirmText="Unlist All Seeded"
        onConfirm={handleUnlistAllSeeded}
      />

      <ConfirmDialog
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        title="Restore Seeded Posts?"
        description="This will set all seeded posts back to PUBLISHED status."
        confirmText="Restore Seeded"
        onConfirm={handleRestoreAllSeeded}
      />

      <ConfirmDialog
        isOpen={Boolean(revealPostId)}
        onClose={() => setRevealPostId(null)}
        title="Reveal Anonymous Author?"
        description="Dean-level moderation action. This reveals the true author identity and logs an immutable audit event."
        confirmText="Reveal Identity"
        onConfirm={confirmReveal}
      />

      <ConfirmDialog
        isOpen={Boolean(deletePostId)}
        onClose={() => setDeletePostId(null)}
        title="Delete Post?"
        description="This will mark the post as DELETED."
        confirmText="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
