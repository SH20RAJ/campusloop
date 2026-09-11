"use client";

import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface ServiceEnvInfo {
  name: string;
  category: string;
  isConfigured: boolean;
  notes: string;
}

interface SystemClientProps {
  envMatrix: ServiceEnvInfo[];
}

export function SystemClient({ envMatrix }: SystemClientProps) {
  const [isPingingDb, setIsPingingDb] = useState(false);
  const [dbPingResult, setDbPingResult] = useState<string | null>(null);

  const [isPingingRedis, setIsPingingRedis] = useState(false);
  const [redisPingResult, setRedisPingResult] = useState<string | null>(null);

  const [isPingingQdrant, setIsPingingQdrant] = useState(false);
  const [qdrantPingResult, setQdrantPingResult] = useState<string | null>(null);

  async function handlePingDb() {
    sounds.tap();
    haptics.light();
    setIsPingingDb(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping_db" }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error);

      setDbPingResult(`${data.latencyMs}ms (${data.status})`);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message || "Database ping failed");
    } finally {
      setIsPingingDb(false);
    }
  }

  async function handlePingRedis() {
    sounds.tap();
    haptics.light();
    setIsPingingRedis(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping_redis" }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error);

      setRedisPingResult(data.message);
      toast.info(data.message);
    } catch (err: any) {
      toast.error(err.message || "Redis ping failed");
    } finally {
      setIsPingingRedis(false);
    }
  }

  async function handlePingQdrant() {
    sounds.tap();
    haptics.light();
    setIsPingingQdrant(true);
    try {
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping_qdrant" }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data.error);

      setQdrantPingResult(data.message);
      toast.info(data.message);
    } catch (err: any) {
      toast.error(err.message || "Qdrant ping failed");
    } finally {
      setIsPingingQdrant(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ─── Live Diagnostics Bar ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Live Infrastructure Latency Diagnostics
          </h3>
          <p className="text-xs text-muted-foreground">
            Execute real-time round-trip latency pings against primary backend services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* DB Ping */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 flex flex-col justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" /> Neon Postgres
              </span>
              <p className="text-xs text-muted-foreground">SELECT 1 query roundtrip</p>
              {dbPingResult && (
                <p className="text-xs font-black text-emerald-500 pt-1">{dbPingResult}</p>
              )}
            </div>

            <button
              type="button"
              disabled={isPingingDb}
              onClick={handlePingDb}
              className="w-full h-8.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPingingDb && "animate-spin")} />
              <span>{isPingingDb ? "Pinging..." : "Ping Database"}</span>
            </button>
          </div>

          {/* Redis Ping */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 flex flex-col justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Upstash Redis
              </span>
              <p className="text-xs text-muted-foreground">Behavior set ping</p>
              {redisPingResult && (
                <p className="text-xs font-semibold text-foreground truncate pt-1">{redisPingResult}</p>
              )}
            </div>

            <button
              type="button"
              disabled={isPingingRedis}
              onClick={handlePingRedis}
              className="w-full h-8.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPingingRedis && "animate-spin")} />
              <span>{isPingingRedis ? "Pinging..." : "Ping Redis"}</span>
            </button>
          </div>

          {/* Qdrant Ping */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 flex flex-col justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Qdrant Cloud
              </span>
              <p className="text-xs text-muted-foreground">Vector collection health</p>
              {qdrantPingResult && (
                <p className="text-xs font-semibold text-foreground truncate pt-1">{qdrantPingResult}</p>
              )}
            </div>

            <button
              type="button"
              disabled={isPingingQdrant}
              onClick={handlePingQdrant}
              className="w-full h-8.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isPingingQdrant && "animate-spin")} />
              <span>{isPingingQdrant ? "Pinging..." : "Ping Qdrant"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Environment & Keys Configuration Matrix ─── */}
      <section className="p-5 rounded-3xl bg-card border border-border/40 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            Environment Configuration Matrix
          </h3>
          <p className="text-xs text-muted-foreground">
            Audit of active environment bindings without leaking sensitive secret tokens
          </p>
        </div>

        <div className="divide-y divide-border/20 rounded-2xl bg-muted/10 border border-border/30 overflow-hidden">
          {envMatrix.map((item) => (
            <div
              key={item.name}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">{item.name}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.notes}</p>
              </div>

              <span
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-center",
                  item.isConfigured
                    ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-amber-500 bg-amber-500/10 border border-amber-500/20"
                )}
              >
                {item.isConfigured ? "CONFIGURED" : "FALLBACK ACTIVE"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
