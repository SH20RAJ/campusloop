"use client";

import { CalendarCheck2, Clock, Loader2, Lock, Trash2, Wrench, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";

export function MerchantAvailabilityClient() {
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState<"MAINTENANCE" | "MERCHANT_BLOCKED">("MAINTENANCE");
  const [blockStart, setBlockStart] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [blockEnd, setBlockEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [blockNotes, setBlockNotes] = useState("");
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const { data, isLoading, mutate } = useSWR<{
    fleet: any[];
    selectedBikeId: string;
    blocks: any[];
    bookings: any[];
  }>(`/api/merchant/bikes/availability${selectedBikeId ? `?bikeId=${selectedBikeId}` : ""}`, fetcher);

  const fleet = data?.fleet || [];
  const currentBikeId = selectedBikeId || data?.selectedBikeId || fleet[0]?.id;
  const currentBike = fleet.find((b) => b.id === currentBikeId);
  const blocks = data?.blocks || [];
  const bookings = data?.bookings || [];

  async function handleCreateBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBikeId) return;

    sounds.send();
    haptics.success();
    setIsSubmittingBlock(true);

    try {
      const res = await fetch("/api/merchant/bikes/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikeId: currentBikeId,
          startAt: new Date(blockStart).toISOString(),
          endAt: new Date(blockEnd).toISOString(),
          reason: blockReason,
          notes: blockNotes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to block time slot");
      mutate();
      toast.success("Time slot blocked!");
      setShowBlockModal(false);
      setBlockNotes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to block slot");
    } finally {
      setIsSubmittingBlock(false);
    }
  }

  async function handleDeleteBlock(blockId: string) {
    sounds.tap();
    haptics.light();

    try {
      const res = await fetch(`/api/merchant/bikes/availability?id=${blockId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      mutate();
      toast.success("Block removed");
    } catch {
      toast.error("Failed to remove block");
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 select-none pb-24">
      {/* ─── Header & Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            <span>Availability Calendar &amp; Slots</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Check upcoming vehicle reservations, block dates, or schedule servicing
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.tap();
            haptics.light();
            setShowBlockModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer w-fit"
        >
          <Lock className="size-3.5" />
          <span>Block Dates / Maintenance</span>
        </button>
      </div>

      {/* ─── Select Vehicle Dropdown Strip ─── */}
      <div className="p-4 rounded-3xl bg-card border border-border/40 space-y-2 shadow-xs">
        <label className="text-xs font-bold uppercase text-muted-foreground">Select Fleet Vehicle</label>
        <select
          value={currentBikeId}
          onChange={(e) => {
            sounds.tap();
            setSelectedBikeId(e.target.value);
          }}
          className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3.5 text-xs font-bold text-foreground outline-none"
        >
          {fleet.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.registrationNumber}) · Status: {b.status}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Schedule Timeline for Selected Bike ─── */}
      <div className="space-y-4">
        {/* Active Reservations */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CalendarCheck2 className="size-4 text-primary" />
            <span>Confirmed &amp; Active Student Bookings ({bookings.length})</span>
          </h2>

          {bookings.length > 0 ? (
            <div className="space-y-2.5">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-foreground">#{b.bookingNumber}</span>
                      <span className="font-semibold text-blue-400">
                        Student: {b.student?.displayName} (@{b.student?.username})
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {new Date(b.startAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(b.endAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              🟢 No active bookings overlapping this bike. It is open for new reservations!
            </p>
          )}
        </div>

        {/* Maintenance & Custom Blocks */}
        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wrench className="size-4 text-rose-500" />
            <span>Maintenance &amp; Locked Slots ({blocks.length})</span>
          </h2>

          {blocks.length > 0 ? (
            <div className="space-y-2.5">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-rose-500 uppercase">{block.reason}</span>
                      {block.notes && <span className="text-muted-foreground">· {block.notes}</span>}
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {new Date(block.startAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                      })}{" "}
                      →{" "}
                      {new Date(block.endAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(block.id)}
                    className="size-7 rounded-full bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
                    title="Unlock slot"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No maintenance blocks scheduled for this bike.</p>
          )}
        </div>
      </div>

      {/* ─── Block Time Slot Modal ─── */}
      {showBlockModal && (
        <div
          onClick={() => setShowBlockModal(false)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border/50 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
              <div>
                <h3 className="text-base font-black text-foreground">Block Time Slot</h3>
                <p className="text-xs text-muted-foreground">
                  Prevent students from booking during servicing
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Reason for Block *
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as any)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                >
                  <option value="MAINTENANCE">🔧 Scheduled Maintenance &amp; Servicing</option>
                  <option value="MERCHANT_BLOCKED">🔒 Private Reserve / Unavailable</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Start Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  End Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Notes (Optional)</label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="e.g. Engine oil change, brake pad inspection..."
                  className="w-full h-10 rounded-xl bg-muted/40 border border-border px-3 text-xs font-medium text-foreground outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingBlock}
                  className="w-full h-11 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmittingBlock ? <Loader2 className="size-4 animate-spin" /> : "Confirm & Lock Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
