"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateUserRole, updateUserStatus } from "./actions";
import { SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface UserRow {
  id: string;
  displayName: string;
  username: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  institution?: { name: string } | null;
}

interface UsersTableProps {
  initialUsers: UserRow[];
  page: number;
  totalPages: number;
}

export function UsersTable({ initialUsers, page, totalPages }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState<string | null>(null); // holds profileId of updating user

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  }

  async function handleRoleChange(profileId: string, role: "STUDENT" | "MODERATOR" | "ADMIN") {
    setIsLoading(profileId);
    try {
      await updateUserRole(profileId, role);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleStatusChange(profileId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED") {
    setIsLoading(profileId);
    try {
      await updateUserStatus(profileId, status);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsLoading(null);
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
            placeholder="Search username or name..."
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

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted text-xs uppercase text-foreground">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">College</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {initialUsers.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{p.displayName}</span>
                      <span className="text-xs text-muted-foreground">@{p.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {p.institution?.name || "No College"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.role}
                      disabled={isLoading === p.id}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as UserRow["role"])}
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-ring"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={p.status}
                      disabled={isLoading === p.id}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as UserRow["status"])}
                      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-ring"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </td>
                </tr>
              ))}
              {initialUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">No users found.</td>
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
