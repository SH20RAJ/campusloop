"use client";

import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Radio,
  School,
  SearchIcon,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isOnline, presenceLabel } from "@/lib/presence";
import { formatTimeAgo } from "@/lib/utils";
import { createUserProfile, deleteUserProfile, updateUserRole, updateUserStatus } from "./actions";

export interface UserAnalyticsStats {
  total: number;
  active: number;
  suspended: number;
  banned: number;
  students: number;
  moderators: number;
  admins: number;
  onlineNow: number;
  activeToday: number;
  recent7d: number;
  verifiedBadge: number;
  avgPoints: number;
}

export interface UserRow {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  institution?: { name: string; slug?: string | null } | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  gender?: string | null;
  points?: number | null;
  createdAt: Date | string;
  lastSeenAt?: Date | string | null;
}

type RoleFilter = "ALL" | "STUDENT" | "MODERATOR" | "ADMIN";
type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "BANNED";
type SortFilter = "RECENT" | "ACTIVE" | "POINTS" | "OLDEST";

interface UsersTableProps {
  initialUsers: UserRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  institutions: { id: string; name: string }[];
  activeRole: RoleFilter;
  activeStatus: StatusFilter;
  activeSort: SortFilter;
  analytics: UserAnalyticsStats;
}

const roleTabs: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "All Roles" },
  { value: "STUDENT", label: "Students" },
  { value: "MODERATOR", label: "Moderators" },
  { value: "ADMIN", label: "Admins" },
];

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Any Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BANNED", label: "Banned" },
];

const sortTabs: { value: SortFilter; label: string; icon: typeof Calendar }[] = [
  { value: "RECENT", label: "Newest Signups", icon: Calendar },
  { value: "ACTIVE", label: "Recently Active", icon: Radio },
  { value: "POINTS", label: "Highest Clout (LP)", icon: Zap },
  { value: "OLDEST", label: "Earliest Users", icon: Users },
];

export function UsersTable({
  initialUsers,
  page,
  totalPages,
  totalCount,
  institutions,
  activeRole,
  activeStatus,
  activeSort,
  analytics,
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

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

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`/admin/users?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams((params) => {
      if (search.trim()) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
    });
  }

  function handlePageChange(newPage: number) {
    pushParams((params) => {
      params.set("page", newPage.toString());
    });
  }

  async function handleRoleChange(profileId: string, role: "STUDENT" | "MODERATOR" | "ADMIN") {
    setIsLoading(profileId);
    try {
      await updateUserRole(profileId, role);
      toast.success("User role updated successfully");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleStatusChange(profileId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED") {
    setIsLoading(profileId);
    try {
      await updateUserStatus(profileId, status);
      toast.success("User status updated successfully");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newDisplayName.trim() || !newUsername.trim() || !newInstitutionId) {
      toast.error("Please fill in all required fields.");
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
      toast.success("User profile created! 🎉");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setIsLoading(userToDelete.id);
    try {
      await deleteUserProfile(userToDelete.id);
      toast.success("User account deleted.");
      setUserToDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user.");
    } finally {
      setIsLoading(null);
    }
  }

  function formatExact(dateVal?: Date | string | null) {
    if (!dateVal) return "";
    try {
      return format(new Date(dateVal), "dd MMM yyyy, hh:mm a");
    } catch {
      return "";
    }
  }

  function formatShort(dateVal?: Date | string | null) {
    if (!dateVal) return "";
    try {
      return format(new Date(dateVal), "dd MMM, hh:mm a");
    } catch {
      return "";
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Executive Analytics KPI Grid ─── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Accounts */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Enrolled</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{analytics.total.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-500">
              {analytics.active.toLocaleString()} active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {analytics.students} students · {analytics.moderators} mods · {analytics.admins} admins
          </p>
        </div>

        {/* Metric 2: Live Presence */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Live Presence</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Radio className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="inline-flex items-center gap-1.5 text-2xl font-black text-foreground">
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {analytics.onlineNow}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">online now</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {analytics.activeToday} active in the last 24 hours
          </p>
        </div>

        {/* Metric 3: Signup Velocity */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Signup Velocity</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">
              +{analytics.recent7d.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-purple-500">this week</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            New verified institutional signups (7 days)
          </p>
        </div>

        {/* Metric 4: Verified Clout & Loop Points */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Verified Clout</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">
              {analytics.verifiedBadge.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-500">Gold Stars</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            ≥150 LP verified badge · Avg {analytics.avgPoints} LP / user
          </p>
        </div>
      </div>

      {/* ─── Search, Filters & Actions Bar ─── */}
      <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, @username, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
            />
          </form>

          {/* Add User Button */}
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <UserPlus className="size-3.5" />
            <span>{showAddForm ? "Close Form" : "Create User"}</span>
          </button>
        </div>

        {/* Filter Pills: Roles, Statuses, and Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-border/40 text-xs">
          {/* Left: Role & Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Pills */}
            <div className="flex items-center rounded-xl bg-muted/40 p-0.5 border border-border/50">
              {roleTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    pushParams((params) => {
                      params.set("role", tab.value);
                      params.set("page", "1");
                    })
                  }
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    activeRole === tab.value
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div className="flex items-center rounded-xl bg-muted/40 p-0.5 border border-border/50">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    pushParams((params) => {
                      params.set("status", tab.value);
                      params.set("page", "1");
                    })
                  }
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    activeStatus === tab.value
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Sort By Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Sort:</span>
            <select
              value={activeSort}
              onChange={(e) =>
                pushParams((params) => {
                  params.set("sort", e.target.value);
                  params.set("page", "1");
                })
              }
              className="rounded-xl border border-border/80 bg-background px-2.5 py-1 text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {sortTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Create User Form Drawer ─── */}
      {showAddForm && (
        <form
          onSubmit={handleCreateUser}
          className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="size-4 text-emerald-500" /> Create Student Account
            </h3>
            <span className="text-xs text-muted-foreground">Mock user for testing or manual onboarding</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Display Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:ring-1 focus:ring-primary outline-none"
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
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">
                College / Institution
              </label>
              <select
                required
                value={newInstitutionId}
                onChange={(e) => setNewInstitutionId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:ring-1 focus:ring-primary outline-none text-foreground cursor-pointer"
              >
                <option value="" disabled>
                  Select College
                </option>
                {institutions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRow["role"])}
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:ring-1 focus:ring-primary outline-none text-foreground cursor-pointer"
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
                className="w-full px-3 py-2 text-xs bg-background rounded-xl border border-border focus:ring-1 focus:ring-primary outline-none text-foreground cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-border hover:bg-muted text-muted-foreground font-bold text-xs px-4 py-2 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs px-4 py-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Save User"}
            </button>
          </div>
        </form>
      )}

      {/* ─── Users Table ─── */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs text-muted-foreground">
            <thead className="bg-muted/50 border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-foreground">
              <tr>
                <th className="px-5 py-3.5">Student / User</th>
                <th className="px-5 py-3.5">Campus</th>
                <th className="px-5 py-3.5">Signed Up</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-4 py-3.5 text-center">Clout (LP)</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {initialUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    No accounts found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                initialUsers.map((p) => {
                  const online = isOnline(p.lastSeenAt);
                  const activeLabel = presenceLabel(p.lastSeenAt);
                  const exactCreatedAt = formatExact(p.createdAt);
                  const exactLastSeenAt = formatExact(p.lastSeenAt);
                  const hasBlueBadge = (p.points ?? 0) >= 150;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      {/* Column 1: Student / User Details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="size-9 border border-border/50 shrink-0">
                              <AvatarImage src={p.avatarUrl || ""} alt={p.displayName} />
                              <AvatarFallback className="text-[11px] font-black bg-muted text-foreground">
                                {p.displayName?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {online && (
                              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span
                                className="font-bold text-foreground truncate max-w-[140px]"
                                title={p.displayName}
                              >
                                {p.displayName}
                              </span>
                              {hasBlueBadge && (
                                <span title="Verified Blue Badge (≥150 LP)">
                                  <ShieldCheck className="size-3.5 fill-[#1d9bf0] text-background shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Link
                                href={`/@${p.username}`}
                                target="_blank"
                                className="hover:text-primary transition-colors truncate max-w-[110px]"
                                title={`@${p.username}`}
                              >
                                @{p.username}
                              </Link>
                              {(p.branch || p.year) && (
                                <>
                                  <span>·</span>
                                  <span
                                    className="truncate max-w-[90px]"
                                    title={`${p.branch || ""} ${p.year ? `'${p.year.toString().slice(-2)}` : ""}`}
                                  >
                                    {p.branch || "Student"} {p.year ? `'${p.year.toString().slice(-2)}` : ""}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Campus / Institution */}
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center gap-1.5 min-w-0 max-w-[180px]"
                          title={p.institution?.name || "No College"}
                        >
                          <School className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            {p.institution?.name?.split(",")[0] || "Independent Student"}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Signed Up (Human Readable) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col" title={`Signed up on: ${exactCreatedAt}`}>
                          <span className="font-bold text-foreground">
                            {formatTimeAgo(p.createdAt) || "Recently"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/80">
                            {formatShort(p.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Last Active (Human Readable + Presence Status) */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {online ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                            title={`Active right now (Last ping: ${exactLastSeenAt || "Just now"})`}
                          >
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active now
                          </span>
                        ) : p.lastSeenAt ? (
                          <div className="flex flex-col" title={`Last seen: ${exactLastSeenAt}`}>
                            <span className="font-bold text-foreground">
                              {activeLabel || formatTimeAgo(p.lastSeenAt)}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80">
                              {formatShort(p.lastSeenAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic">Never active</span>
                        )}
                      </td>

                      {/* Column 5: Clout (Loop Points) */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            (p.points ?? 0) >= 300
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                              : (p.points ?? 0) >= 150
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : (p.points ?? 0) >= 50
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                  : "bg-muted/40 text-muted-foreground border-border/50"
                          }`}
                          title={`Loop Points: ${p.points ?? 0}`}
                        >
                          <Zap className="size-2.5" />
                          {p.points ?? 0} LP
                        </span>
                      </td>

                      {/* Column 6: Role */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={p.role}
                          disabled={isLoading === p.id}
                          onChange={(e) => handleRoleChange(p.id, e.target.value as UserRow["role"])}
                          className="rounded-lg border border-border/80 bg-background px-2 py-1 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
                        >
                          <option value="STUDENT">Student</option>
                          <option value="MODERATOR">Moderator</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>

                      {/* Column 7: Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={p.status}
                          disabled={isLoading === p.id}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as UserRow["status"])}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50 ${
                            p.status === "ACTIVE"
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                              : p.status === "SUSPENDED"
                                ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                                : "border-destructive/40 text-destructive bg-destructive/5"
                          }`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="BANNED">Banned</option>
                        </select>
                      </td>

                      {/* Column 8: Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Link
                            href={`/@${p.username}`}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="View public profile"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isLoading === p.id}
                            onClick={() => setUserToDelete({ id: p.id, name: p.displayName })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Table Pagination ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-muted/20 border-t border-border/60 text-xs text-muted-foreground">
          <div>
            Showing <strong className="text-foreground">{initialUsers.length}</strong> of{" "}
            <strong className="text-foreground">{totalCount.toLocaleString()}</strong> student accounts
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border/80 bg-background font-semibold hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </button>

            <span className="font-semibold text-foreground px-1">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border/80 bg-background font-semibold hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Delete Confirmation Dialog ─── */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Delete User Account"
        description={`Are you sure you want to permanently delete the account of ${userToDelete?.name}? All their posts, comments, Loop Points, and campus history will be wiped.`}
        confirmText="Delete Account"
        onConfirm={handleDeleteUser}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
}
