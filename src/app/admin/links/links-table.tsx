"use client";

import {
  BarChart3,
  Copy,
  ExternalLink,
  Globe,
  Laptop,
  Link2,
  Loader2,
  Plus,
  QrCode,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";

interface ShortLinkItem {
  id: string;
  slug: string;
  targetUrl: string;
  title: string | null;
  clicks: number;
  uniqueClicks: number;
  createdAt: string;
}

interface LinkClickItem {
  id: string;
  shortLinkId: string | null;
  refCode: string | null;
  ip: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referer: string | null;
  country: string | null;
  createdAt: string;
}

interface AdminLinksResponse {
  links: ShortLinkItem[];
  recentClicks: LinkClickItem[];
  deviceStats: Array<{ device: string | null; count: number }>;
  topReferrers: Array<{ referer: string | null; count: number }>;
  totalClicks: number;
  totalLinks: number;
}

export function AdminLinksClient() {
  const { data, isLoading, mutate } = useSWR<AdminLinksResponse>("/api/admin/links", fetcher);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [slug, setSlug] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !targetUrl) {
      toast.error("Please provide both slug and target URL");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, targetUrl, title }),
      });
      const result = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(result.error || "Failed to create short link");
      }

      toast.success(`Created /s/${slug}!`);
      setShowCreateModal(false);
      setSlug("");
      setTargetUrl("");
      setTitle("");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to create short link");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this short link?")) return;
    try {
      const res = await fetch(`/api/admin/links?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Short link deleted");
      mutate();
    } catch {
      toast.error("Could not delete short link");
    }
  }

  function copyLink(slug: string) {
    const full = `https://campusloop.space/s/${slug}`;
    navigator.clipboard.writeText(full);
    toast.success("Short link copied to clipboard! 📋");
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const links = data?.links || [];
  const clicks = data?.recentClicks || [];
  const deviceStats = data?.deviceStats || [];
  const topReferrers = data?.topReferrers || [];
  const totalClicks = data?.totalClicks || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Link2 className="size-6 text-primary" />
            Short Links &amp; Referral Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create branded redirect links (`/s/slug`), monitor marketing campaigns, and track viral referrals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all cursor-pointer select-none shrink-0"
        >
          <Plus className="size-4" />
          Create Short Link
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Links</p>
          <p className="text-2xl font-black text-foreground mt-1">{data?.totalLinks || 0}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Clicks Recorded</p>
          <p className="text-2xl font-black text-primary mt-1">{totalClicks}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Devices Breakdown</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            {deviceStats.map((d) => (
              <span key={d.device || "other"} className="flex items-center gap-1 font-semibold text-foreground">
                {d.device === "mobile" ? <Smartphone className="size-3.5 text-blue-500" /> : <Laptop className="size-3.5 text-emerald-500" />}
                {d.count} {d.device}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Short Links Table */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Active Short Links</h2>
          <span className="text-xs text-muted-foreground">{links.length} links</span>
        </div>

        {links.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No short links created yet. Click &quot;Create Short Link&quot; above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground font-bold">
                <tr>
                  <th className="p-3">Title / Campaign</th>
                  <th className="p-3">Short URL</th>
                  <th className="p-3">Target URL</th>
                  <th className="p-3 text-center">Clicks</th>
                  <th className="p-3">Created</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground max-w-[180px] truncate">
                      {link.title || link.slug}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-primary font-bold">/s/{link.slug}</span>
                        <button
                          type="button"
                          onClick={() => copyLink(link.slug)}
                          className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copy link"
                        >
                          <Copy className="size-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 max-w-[220px] truncate text-muted-foreground">
                      <a
                        href={link.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{link.targetUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                        {link.clicks}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(new Date(link.createdAt))}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(link.id)}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Clicks & Referrals Feed */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Recent Traffic Logs (Referrals &amp; Short Links)</h2>
          <span className="text-xs text-muted-foreground">{clicks.length} recent hits</span>
        </div>

        {clicks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No visitor clicks logged yet. Traffic with `?ref=...` or `/s/...` will appear here in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground font-bold sticky top-0 bg-card">
                <tr>
                  <th className="p-3">Campaign / Ref</th>
                  <th className="p-3">Device &amp; Browser</th>
                  <th className="p-3">Referrer Source</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {clicks.map((click) => (
                  <tr key={click.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">
                      {click.refCode || "direct"}
                    </td>
                    <td className="p-3 text-foreground">
                      <span className="capitalize">{click.device || "Desktop"}</span> · {click.browser || "Browser"} ({click.os || "OS"})
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-muted-foreground">
                      {click.referer || "Direct / App"}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {click.country || "IN"}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(new Date(click.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-foreground">Create Short Link</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Links will be accessible at <code className="font-mono text-primary font-bold">campusloop.space/s/[slug]</code>
            </p>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Campaign Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Raj LinkedIn Post"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Custom Slug</label>
                <div className="mt-1 flex items-center rounded-xl border border-input bg-background px-3 py-2 text-xs">
                  <span className="text-muted-foreground select-none">/s/</span>
                  <input
                    type="text"
                    required
                    placeholder="raj-linkedin"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent pl-1 font-mono text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Target URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://campusloop.space/app/academics or /app/dating"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-input px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
