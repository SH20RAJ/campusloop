"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deletePost } from "./actions";
import { SearchIcon, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface PostRow {
  id: string;
  body: string;
  type: string;
  isAnonymous: boolean;
  createdAt: string | Date;
  author?: { displayName: string; username: string } | null;
}

interface PostsTableProps {
  initialPosts: PostRow[];
  page: number;
  totalPages: number;
}

export function PostsTable({ initialPosts, page, totalPages }: PostsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin/posts?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/posts?${params.toString()}`);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setActionLoading(postId);
    try {
      await deletePost(postId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete post");
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
            placeholder="Search posts..."
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
                <th className="px-6 py-4">Content</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialPosts.map((post) => (
                <tr key={post.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {post.isAnonymous ? "Anonymous" : post.author?.displayName}
                      </span>
                      {!post.isAnonymous && (
                        <span className="text-xs text-muted-foreground">@{post.author?.username}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground max-w-md truncate">
                    {post.body}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-muted text-foreground">
                      {post.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={actionLoading === post.id}
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded hover:bg-muted text-destructive disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {initialPosts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">No posts found.</td>
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
    </div>
  );
}
