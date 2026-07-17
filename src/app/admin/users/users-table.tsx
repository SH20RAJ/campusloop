"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateUserRole, updateUserStatus, deleteUserProfile, createUserProfile } from "./actions";
import { SearchIcon, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

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
  institutions: { id: string; name: string }[];
}

export function UsersTable({ initialUsers, page, totalPages, institutions }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState<string | null>(null); // holds profileId of updating user

  // Create User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newInstitutionId, setNewInstitutionId] = useState("");
  const [newRole, setNewRole] = useState<UserRow["role"]>("STUDENT");
  const [newStatus, setNewStatus] = useState<UserRow["status"]>("ACTIVE");
  const [isCreating, setIsCreating] = useState(false);

  // Set default institutionId
  useEffect(() => {
    if (institutions && institutions.length > 0 && !newInstitutionId) {
      setNewInstitutionId(institutions[0].id);
    }
  }, [institutions, newInstitutionId]);

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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newDisplayName.trim() || !newUsername.trim() || !newInstitutionId) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsCreating(true);
    try {
      await createUserProfile({
        displayName: newDisplayName,
        username: newUsername,
        institutionId: newInstitutionId,
        role: newRole,
        status: newStatus,
      });
      setNewDisplayName("");
      setNewUsername("");
      setShowAddForm(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteUser(profileId: string, displayName: string) {
    if (!window.confirm(`Are you sure you want to delete ${displayName}'s account? This action is permanent and will delete all their posts and data.`)) {
      return;
    }

    setIsLoading(profileId);
    try {
      await deleteUserProfile(profileId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Header Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
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

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add User Account
        </button>
      </div>

      {/* Add User Form Section */}
      {showAddForm && (
        <form onSubmit={handleCreateUser} className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-bold text-foreground">Create User Account</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Display Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background rounded-lg border border-border focus:ring-1 focus:ring-ring outline-none"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. johndoe"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background rounded-lg border border-border focus:ring-1 focus:ring-ring outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">College / Institution</label>
              <select
                required
                value={newInstitutionId}
                onChange={(e) => setNewInstitutionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background rounded-lg border border-border focus:ring-1 focus:ring-ring outline-none text-foreground"
              >
                <option value="" disabled>Select College</option>
                {institutions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRow["role"])}
                  className="w-full px-3 py-2 text-xs bg-background rounded-lg border border-border focus:ring-1 focus:ring-ring outline-none text-foreground"
                >
                  <option value="STUDENT">Student</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as UserRow["status"])}
                  className="w-full px-3 py-2 text-xs bg-background rounded-lg border border-border focus:ring-1 focus:ring-ring outline-none text-foreground"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-border hover:bg-muted text-muted-foreground font-bold text-xs px-4 py-2 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs px-4 py-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Save User"}
            </button>
          </div>
        </form>
      )}

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
                <th className="px-6 py-4 text-right">Actions</th>
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
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={isLoading === p.id}
                      onClick={() => handleDeleteUser(p.id, p.displayName)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {initialUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">No users found.</td>
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
