"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Layers,
  MessageSquare,
  Play,
  Radio,
  RefreshCw,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { sounds } from "@/lib/sounds";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface RedditItem {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  createdUtc: number;
  selftext: string;
  thumbnail?: string | null;
  over18: boolean;
}

interface ComposioHubClientProps {
  institutions: Array<{ id: string; name: string }>;
}

export function ComposioHubClient({ institutions }: ComposioHubClientProps) {
  // Reddit Studio State
  const [subreddit, setSubreddit] = useState("Btechtards");
  const [redditSort, setRedditSort] = useState("hot");
  const [redditLimit, setRedditLimit] = useState(6);
  const [targetCollegeId, setTargetCollegeId] = useState(institutions[0]?.id || "");
  const [isFetchingReddit, setIsFetchingReddit] = useState(false);
  const [redditPosts, setRedditPosts] = useState<RedditItem[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Cloudflare CDN State
  const [isPurgingCf, setIsPurgingCf] = useState(false);
  const [lastPurgeTime, setLastPurgeTime] = useState<string | null>(null);

  // Alert Dispatch State
  const [alertChannel, setAlertChannel] = useState<"discord" | "telegram">("discord");
  const [alertMessage, setAlertMessage] = useState(
    "Flagged confession #post_842 exceeded 5 toxicity reports. Auto-quarantined for admin review."
  );
  const [isDispatchingAlert, setIsDispatchingAlert] = useState(false);

  // Export State
  const [exportType, setExportType] = useState<"posts" | "users" | "colleges">("posts");
  const [isExporting, setIsExporting] = useState(false);

  // Trigger Reddit Fetch
  async function handleFetchReddit() {
    sounds.tap();
    haptics.light();
    setIsFetchingReddit(true);
    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch_reddit",
          payload: { subreddit, sort: redditSort, limit: redditLimit },
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to fetch Reddit posts");

      setRedditPosts(data.posts || []);
      toast.success(`Fetched ${data.count} posts from r/${data.subreddit}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch from Reddit");
    } finally {
      setIsFetchingReddit(false);
    }
  }

  // Import Reddit Post into CampusLoop
  async function handleImportPost(post: RedditItem) {
    sounds.pop();
    haptics.medium();
    setImportingId(post.id);
    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_reddit_post",
          payload: { redditPost: post, institutionId: targetCollegeId },
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to import post");

      toast.success(`Imported to CampusLoop timeline!`);
    } catch (err: any) {
      toast.error(err.message || "Import failed");
    } finally {
      setImportingId(null);
    }
  }

  // Cloudflare Purge Cache
  async function handlePurgeCloudflare() {
    sounds.pop();
    haptics.heavy();
    setIsPurgingCf(true);
    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "purge_cloudflare",
          payload: { zoneName: "campusloop.space", purgeEverything: true },
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Purge failed");

      setLastPurgeTime(new Date().toLocaleTimeString());
      toast.success(data.message || "Cloudflare CDN cache purged globally!");
    } catch (err: any) {
      toast.error(err.message || "Purge request failed");
    } finally {
      setIsPurgingCf(false);
    }
  }

  // Dispatch Moderation Alert
  async function handleDispatchAlert() {
    sounds.tap();
    haptics.medium();
    setIsDispatchingAlert(true);
    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dispatch_alert",
          payload: { channel: alertChannel, message: alertMessage, priority: "URGENT" },
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to dispatch alert");

      toast.success(`Test alert delivered to ${alertChannel.toUpperCase()} webhook!`);
    } catch (err: any) {
      toast.error(err.message || "Alert dispatch failed");
    } finally {
      setIsDispatchingAlert(false);
    }
  }

  // Export Data as JSON/CSV
  async function handleExportData() {
    sounds.tap();
    haptics.light();
    setIsExporting(true);
    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "export_data",
          payload: { exportType },
        }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Export failed");

      // Trigger browser download of JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campusloop_${exportType}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.count} records to JSON!`);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ─── Active Composio Connected Toolkits ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Connected Composio Toolkits
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time tool orchestration &amp; cross-platform integrations
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            2 Connected Toolkits Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Reddit */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-orange-500 uppercase tracking-wider">
                Reddit API
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">@u_Dull_Boysenberry_442</p>
            <p className="text-[11px] text-muted-foreground">
              Campus subreddit ingestion, hot threads &amp; controversial topics sync
            </p>
          </div>

          {/* 2. Cloudflare */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                Cloudflare
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">Zone: campusloop.space</p>
            <p className="text-[11px] text-muted-foreground">
              Edge CDN cache purge, WAF rules &amp; Super Bot Fight Mode control
            </p>
          </div>

          {/* 3. Discord & Telegram */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                Discord / Telegram
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                WEBHOOKS
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">Safety Alerts Channel</p>
            <p className="text-[11px] text-muted-foreground">
              High-priority toxicity alerts &amp; banned keyword notifications
            </p>
          </div>

          {/* 4. Google Sheets & Notion */}
          <div className="p-4 rounded-2xl bg-card border border-border/40 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">
                Google Sheets / DB
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                EXPORT READY
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">Reports &amp; Audit Logs</p>
            <p className="text-[11px] text-muted-foreground">
              Automated telemetry export, spreadsheet sync &amp; moderation logs
            </p>
          </div>
        </div>
      </section>

      {/* ─── Reddit Subreddit Ingestion Studio ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              Campus Reddit Subreddit Ingestion Studio
            </h3>
            <p className="text-xs text-muted-foreground">
              Fetch top discussions from Indian university subreddits and curate directly into campus feeds
            </p>
          </div>

          {/* Preset Campus Subreddits */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["Btechtards", "Indian_Academia", "delhiuniversity", "iitb", "BITSFilani"].map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubreddit(sub)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer",
                  subreddit === sub
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                r/{sub}
              </button>
            ))}
          </div>
        </div>

        {/* Fetch Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Subreddit Name
            </label>
            <div className="flex items-center rounded-xl bg-muted/40 border border-border/50 px-3 py-2">
              <span className="text-xs font-bold text-muted-foreground mr-1">r/</span>
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-foreground outline-none"
                placeholder="Btechtards"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Sort Order
            </label>
            <select
              value={redditSort}
              onChange={(e) => setRedditSort(e.target.value)}
              className="w-full rounded-xl bg-muted/40 border border-border/50 px-3 py-2 text-xs font-bold text-foreground outline-none"
            >
              <option value="hot">Hot Discussions</option>
              <option value="new">Newest Posts</option>
              <option value="top">Top Upvoted</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Post Limit
            </label>
            <select
              value={redditLimit}
              onChange={(e) => setRedditLimit(Number(e.target.value))}
              className="w-full rounded-xl bg-muted/40 border border-border/50 px-3 py-2 text-xs font-bold text-foreground outline-none"
            >
              <option value={5}>5 Posts</option>
              <option value={10}>10 Posts</option>
              <option value={15}>15 Posts</option>
              <option value={25}>25 Posts</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={isFetchingReddit}
              onClick={handleFetchReddit}
              className="w-full h-9.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isFetchingReddit && "animate-spin")} />
              <span>{isFetchingReddit ? "Fetching..." : "Fetch Subreddit"}</span>
            </button>
          </div>
        </div>

        {/* Target College Hub Picker for Ingestion */}
        {institutions.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="font-bold text-muted-foreground">Target Campus Hub:</span>
            <select
              value={targetCollegeId}
              onChange={(e) => setTargetCollegeId(e.target.value)}
              className="rounded-lg bg-muted/50 border border-border/40 px-2.5 py-1 text-xs font-semibold text-foreground outline-none max-w-xs truncate"
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Fetched Reddit Posts Result Stream */}
        {redditPosts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
              <span>Results ({redditPosts.length} posts from r/{subreddit})</span>
              <span>Sorted by {redditSort.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {redditPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-muted/20 border border-border/30 hover:border-border/60 transition-colors flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>u/{post.author}</span>
                      <div className="flex items-center gap-2 font-bold">
                        <span>▲ {post.score}</span>
                        <span>💬 {post.numComments}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
                      {post.title}
                    </h4>
                    {post.selftext && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.selftext}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/20">
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Reddit</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      type="button"
                      disabled={importingId === post.id}
                      onClick={() => handleImportPost(post)}
                      className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>{importingId === post.id ? "Importing..." : "Import to CampusLoop"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── Cloudflare Edge CDN Controller & Webhook Alerts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloudflare Controller */}
        <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Cloud className="h-4 w-4 text-amber-500" />
              Cloudflare Edge CDN Controller
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage edge cache, purge stale media assets, and verify CDN WAF defenses
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-muted/20 border border-border/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">Primary Domain</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Proxied (Orange Cloud)
                </span>
              </div>
              <p className="text-sm font-black text-foreground">campusloop.space</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                <span>SSL/TLS: Full (Strict)</span>
                <span>·</span>
                <span>Bot Fight Mode: Enabled</span>
              </div>
            </div>

            {lastPurgeTime && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Last edge cache purge executed at {lastPurgeTime}
              </p>
            )}

            <button
              type="button"
              disabled={isPurgingCf}
              onClick={handlePurgeCloudflare}
              className="w-full h-10 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", isPurgingCf && "animate-spin")} />
              <span>{isPurgingCf ? "Purging Edge CDN..." : "Purge Everything (CDN Cache)"}</span>
            </button>
          </div>
        </section>

        {/* Discord & Telegram Moderation Alert Dispatcher */}
        <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Moderation Webhook Alert Dispatcher
            </h3>
            <p className="text-xs text-muted-foreground">
              Broadcast critical moderation alerts to Discord and Telegram admin channels
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAlertChannel("discord")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  alertChannel === "discord"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                Discord Webhook
              </button>
              <button
                type="button"
                onClick={() => setAlertChannel("telegram")}
                className={cn(
                  "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  alertChannel === "telegram"
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                Telegram Bot
              </button>
            </div>

            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-muted/40 border border-border/50 p-2.5 text-xs font-medium text-foreground outline-none focus:border-foreground transition-all resize-none"
              placeholder="Enter moderation alert payload..."
            />

            <button
              type="button"
              disabled={isDispatchingAlert}
              onClick={handleDispatchAlert}
              className="w-full h-10 rounded-xl bg-foreground text-background text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Send className={cn("h-4 w-4", isDispatchingAlert && "animate-pulse")} />
              <span>{isDispatchingAlert ? "Dispatching..." : `Dispatch Alert to ${alertChannel.toUpperCase()}`}</span>
            </button>
          </div>
        </section>
      </div>

      {/* ─── Export Center (Google Sheets & JSON) ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              Platform Data Export &amp; Telemetry Hub
            </h3>
            <p className="text-xs text-muted-foreground">
              Extract verified moderation records, student profiles, and college directory for external analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExportType("posts")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                exportType === "posts"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Posts Feed
            </button>
            <button
              type="button"
              onClick={() => setExportType("users")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                exportType === "users"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              User Accounts
            </button>
            <button
              type="button"
              onClick={() => setExportType("colleges")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                exportType === "colleges"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Colleges Directory
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportData}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className={cn("h-3.5 w-3.5", isExporting && "animate-bounce")} />
              <span>{isExporting ? "Exporting..." : "Download JSON"}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
