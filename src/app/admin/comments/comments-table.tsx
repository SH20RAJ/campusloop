"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ChevronLeft,ChevronRight,Eye,SearchIcon,Trash2 } from "lucide-react";
import { useRouter,useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { revealAnonymousAuthor,type RevealedIdentity } from "../anonymity-actions";
import { deleteComment } from "./actions";

interface CommentRow {
  id: string;
  body: string;
  isAnonymous: boolean;
  pseudonym?: string | null;
  createdAt: string | Date;
  author?: { displayName: string; username: string } | null;
  post?: { body: string } | null;
}

interface CommentsTableProps {
  initialComments: CommentRow[];
  page: number;
  totalPages: number;
}

export function CommentsTable({ initialComments, page, totalPages }: CommentsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Record<string, RevealedIdentity>>({});
  const [revealCommentId, setRevealCommentId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin/comments?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/comments?${params.toString()}`);
  }

  async function confirmDelete() {
    if (!deleteCommentId) return;
    const commentId = deleteCommentId;
    setActionLoading(commentId);
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted successfully");
      setDeleteCommentId(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete comment");
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmReveal() {
    if (!revealCommentId) return;
    const commentId = revealCommentId;
    setActionLoading(commentId);
    try {
      const identity = await revealAnonymousAuthor("COMMENT", commentId);
      setRevealed((prev) => ({ ...prev, [commentId]: identity }));
      toast.success("Anonymous author revealed (audit logged)");
      setRevealCommentId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reveal author");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card rounded-md border border-border focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-xs uppercase text-foreground">
              <tr>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Post Context</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialComments.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {c.isAnonymous ? (revealed[c.id]?.displayName ?? "👻 Anonymous") : c.author?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.isAnonymous
                          ? revealed[c.id]
                            ? `@${revealed[c.id].username} · ${revealed[c.id].accountStatus}`
                            : c.pseudonym || "anon"
                          : `@${c.author?.username}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {c.body}
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate">
                    {c.post?.body || "Original post deleted"}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.isAnonymous && !revealed[c.id] && (
                        <button
                          disabled={actionLoading === c.id}
                          onClick={() => setRevealCommentId(c.id)}
                          title="Reveal author (audit logged)"
                          className="p-1.5 rounded hover:bg-muted text-blue-500 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        disabled={actionLoading === c.id}
                        onClick={() => setDeleteCommentId(c.id)}
                        className="p-1.5 rounded hover:bg-muted text-destructive disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialComments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">No comments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/40">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reveal Author Modal */}
      <ConfirmDialog
        isOpen={Boolean(revealCommentId)}
        title="Reveal Anonymous Comment Author?"
        description="Are you sure you want to reveal the author of this comment? This action is permanently audit-logged with your admin ID."
        confirmText="Reveal Identity"
        variant="info"
        isLoading={Boolean(actionLoading && revealCommentId && actionLoading === revealCommentId)}
        onClose={() => setRevealCommentId(null)}
        onConfirm={confirmReveal}
      />

      {/* Delete Comment Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteCommentId)}
        title="Delete Comment?"
        description="Are you sure you want to delete this comment? It will be removed permanently."
        confirmText="Delete Comment"
        variant="danger"
        isLoading={Boolean(actionLoading && deleteCommentId && actionLoading === deleteCommentId)}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
