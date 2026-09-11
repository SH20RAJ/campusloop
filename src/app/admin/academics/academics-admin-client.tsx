"use client";

import {
  BookOpen,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export interface AcademicResourceItem {
  id: string;
  title: string;
  description: string | null;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
  fileUrl: string | null;
  driveUrl: string | null;
  downloadsCount: number;
  upvotesCount: number;
  isVerified: boolean;
  createdAt: string | Date | null;
  institutionName?: string | null;
  uploaderName?: string | null;
}

interface AcademicsAdminClientProps {
  initialResources: AcademicResourceItem[];
}

export function AcademicsAdminClient({ initialResources }: AcademicsAdminClientProps) {
  const [resources, setResources] = useState<AcademicResourceItem[]>(initialResources);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredResources = resources.filter((res) => {
    if (filter === "PENDING" && res.isVerified) return false;
    if (filter === "VERIFIED" && !res.isVerified) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    return (
      res.title.toLowerCase().includes(q) ||
      res.subjectCode.toLowerCase().includes(q) ||
      res.subjectName.toLowerCase().includes(q) ||
      res.branch.toLowerCase().includes(q) ||
      (res.institutionName && res.institutionName.toLowerCase().includes(q))
    );
  });

  const totalCount = resources.length;
  const verifiedCount = resources.filter((r) => r.isVerified).length;
  const pendingCount = totalCount - verifiedCount;
  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloadsCount || 0), 0);

  async function handleToggleVerify(id: string, currentStatus: boolean) {
    sounds.pop();
    haptics.medium();
    setProcessingId(id);
    const nextStatus = !currentStatus;

    try {
      const res = await fetch("/api/admin/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_verify",
          resourceId: id,
          isVerified: nextStatus,
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to update verification status");

      setResources((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isVerified: nextStatus } : item))
      );
      toast.success(nextStatus ? "Resource verified and badged!" : "Resource unverified");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this resource?")) return;

    sounds.tap();
    haptics.heavy();
    setProcessingId(id);

    try {
      const res = await fetch("/api/admin/academics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          resourceId: id,
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setResources((prev) => prev.filter((item) => item.id !== id));
      toast.success("Resource removed from vault");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Metric Pills ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Total Vault Items
          </p>
          <p className="text-2xl font-black text-foreground">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Pending Review
          </p>
          <p className="text-2xl font-black text-foreground">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Verified Notes
          </p>
          <p className="text-2xl font-black text-foreground">{verifiedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-blue-500" /> Vault Downloads
          </p>
          <p className="text-2xl font-black text-foreground">{totalDownloads}</p>
        </div>
      </div>

      {/* ─── Controls & Search ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl shrink-0">
          {(["ALL", "PENDING", "VERIFIED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sounds.tap();
                haptics.light();
                setFilter(tab);
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                filter === tab
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "ALL"
                ? `All (${totalCount})`
                : tab === "PENDING"
                ? `Pending (${pendingCount})`
                : `Verified (${verifiedCount})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject code, branch..."
            className="w-full h-10 pl-9 pr-4 rounded-full bg-muted/40 border border-border/50 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
          />
        </div>
      </div>

      {/* ─── Resources List ─── */}
      {filteredResources.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border/50 bg-card/40 space-y-2">
          <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-bold text-foreground">No academic resources found</p>
          <p className="text-xs text-muted-foreground">
            {search ? "Try clearing your search query" : "No study materials in this tab"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs flex flex-col justify-between gap-3 hover:border-border/70 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {res.resourceType}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {res.subjectCode} · Sem {res.semester}
                      </span>
                      {res.isVerified ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          PENDING
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-foreground leading-snug truncate">
                      {res.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{res.subjectName}</p>
                  </div>
                </div>

                {res.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{res.description}</p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                  <span>{res.branch}</span>
                  <span>·</span>
                  <span>{res.institutionName || "CampusLoop"}</span>
                  <span>·</span>
                  <span>{res.downloadsCount || 0} downloads</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/20">
                <div className="flex items-center gap-2">
                  {res.fileUrl && (
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Direct PDF</span>
                    </a>
                  )}
                  {res.driveUrl && (
                    <a
                      href={res.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Drive Link</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processingId === res.id}
                    onClick={() => handleToggleVerify(res.id, res.isVerified)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50",
                      res.isVerified
                        ? "bg-muted text-muted-foreground hover:text-foreground"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                    )}
                  >
                    {res.isVerified ? (
                      <>
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Revoke</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verify</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === res.id}
                    onClick={() => handleDelete(res.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
