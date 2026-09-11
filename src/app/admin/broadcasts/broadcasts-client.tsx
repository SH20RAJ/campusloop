"use client";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Globe,
  Info,
  Layers,
  Megaphone,
  Radio,
  School,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface BroadcastsClientProps {
  institutions: Array<{ id: string; name: string }>;
  recentBroadcasts: Array<{
    id: string;
    title: string | null;
    body: string;
    scope: string;
    createdAt: string | Date | null;
    institutionName?: string | null;
  }>;
}

export function BroadcastsClient({ institutions, recentBroadcasts }: BroadcastsClientProps) {
  const [scope, setScope] = useState<"INDIA" | "CAMPUS">("INDIA");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(institutions[0]?.id || "");
  const [priority, setPriority] = useState<"INFO" | "ANNOUNCEMENT" | "WARNING" | "URGENT">("ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendNotification, setSendNotification] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [broadcastsList, setBroadcastsList] = useState(recentBroadcasts);

  const selectedCollegeName =
    institutions.find((i) => i.id === selectedInstitutionId)?.name || "Target Campus";

  async function handlePublish() {
    if (!title.trim() || !message.trim()) {
      toast.error("Please provide both a title and announcement message");
      return;
    }

    sounds.pop();
    haptics.heavy();
    setIsPublishing(true);

    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          scope,
          institutionId: selectedInstitutionId,
          priority,
          sendNotification,
        }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error || "Failed to publish broadcast");

      toast.success(data.message || "Broadcast published!");

      if (data.broadcastPost) {
        setBroadcastsList((prev) => [
          {
            id: data.broadcastPost.id,
            title: data.broadcastPost.title,
            body: data.broadcastPost.body,
            scope: data.broadcastPost.scope,
            createdAt: new Date().toISOString(),
            institutionName: scope === "CAMPUS" ? selectedCollegeName : "All Campuses",
          },
          ...prev,
        ]);
      }

      setTitle("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish broadcast");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ─── Creator & Live Preview Split ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Form (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Compose Campus Broadcast
            </h3>
            <p className="text-xs text-muted-foreground">
              Send system announcements, security advisories, or hub banners
            </p>
          </div>

          {/* Scope Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Broadcast Audience Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setScope("INDIA");
                }}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5",
                  scope === "INDIA"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe className="h-3.5 w-3.5" />
                  <span>All Campuses (India)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Visible to all 1,350+ indexed college hubs
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setScope("CAMPUS");
                }}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5",
                  scope === "CAMPUS"
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <School className="h-3.5 w-3.5" />
                  <span>Specific College Hub</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Targeted strictly to students of one college
                </p>
              </button>
            </div>
          </div>

          {/* College Picker if Scope is CAMPUS */}
          {scope === "CAMPUS" && institutions.length > 0 && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Target Institution
              </label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                className="w-full rounded-xl bg-muted/40 border border-border/50 p-2.5 text-xs font-semibold text-foreground outline-none"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Announcement Priority &amp; Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "INFO", label: "General Info", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
                { id: "ANNOUNCEMENT", label: "Official", color: "text-primary bg-primary/10 border-primary/30" },
                { id: "WARNING", label: "Advisory", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
                { id: "URGENT", label: "Urgent Alert", color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    sounds.tap();
                    haptics.light();
                    setPriority(p.id as any);
                  }}
                  className={cn(
                    "px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center",
                    priority === p.id
                      ? p.color + " shadow-xs font-black"
                      : "border-border/30 bg-muted/20 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End Semester Exams Schedule Announced"
              className="w-full h-10 px-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-bold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Message Content
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the full announcement body. Markdown formatting is supported..."
              className="w-full p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all resize-none"
            />
          </div>

          {/* Notification Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="sendNotification"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="size-4 rounded accent-primary cursor-pointer"
            />
            <label
              htmlFor="sendNotification"
              className="text-xs font-bold text-foreground cursor-pointer select-none flex items-center gap-1.5"
            >
              <Bell className="size-3.5 text-primary" />
              <span>Send in-app notifications to all matching verified students</span>
            </label>
          </div>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="w-full h-11 rounded-2xl bg-foreground text-background text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Send className={cn("size-4", isPublishing && "animate-pulse")} />
            <span>{isPublishing ? "Publishing..." : "Dispatch Broadcast Now"}</span>
          </button>
        </div>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Timeline Live Preview
            </h3>
            <p className="text-xs text-muted-foreground">
              How students see this announcement at the top of their feed
            </p>

            <div
              className={cn(
                "p-4 rounded-2xl border transition-all space-y-2.5 shadow-xs",
                priority === "URGENT"
                  ? "border-rose-500/40 bg-rose-500/10"
                  : priority === "WARNING"
                  ? "border-amber-500/40 bg-amber-500/10"
                  : priority === "INFO"
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-primary/40 bg-primary/10"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                    priority === "URGENT"
                      ? "bg-rose-500/20 text-rose-500"
                      : priority === "WARNING"
                      ? "bg-amber-500/20 text-amber-500"
                      : priority === "INFO"
                      ? "bg-blue-500/20 text-blue-500"
                      : "bg-primary/20 text-primary"
                  )}
                >
                  {priority === "URGENT"
                    ? "URGENT NOTICE"
                    : priority === "WARNING"
                    ? "CAMPUS ADVISORY"
                    : priority === "INFO"
                    ? "CAMPUS INFO"
                    : "OFFICIAL ANNOUNCEMENT"}
                </span>

                <span className="text-[10px] font-semibold text-muted-foreground">
                  {scope === "CAMPUS" ? selectedCollegeName : "All India"}
                </span>
              </div>

              <h4 className="text-sm font-black text-foreground leading-snug">
                {title.trim() || "Announcement Title Preview"}
              </h4>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {message.trim() ||
                  "This is a preview of the announcement body. Verified students will see this card highlighted on their campus feed."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Past Broadcasts Stream ─── */}
      {broadcastsList.length > 0 && (
        <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Recent Broadcast Dispatches
            </h3>
            <p className="text-xs text-muted-foreground">Audit record of previous platform-wide announcements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {broadcastsList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-bold text-foreground">{item.scope}</span>
                  <span>{item.institutionName || "CampusLoop Network"}</span>
                </div>
                {item.title && (
                  <h4 className="text-sm font-black text-foreground line-clamp-1">{item.title}</h4>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
