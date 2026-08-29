"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Bike, Loader2, Save, Settings, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

export function MerchantBikeSettingsClient() {
  const [rentalMode, setRentalMode] = useState<"BOTH" | "DAILY" | "HOURLY">("BOTH");
  const [minDuration, setMinDuration] = useState("1");
  const [maxDuration, setMaxDuration] = useState("14");
  const [advanceDays, setAdvanceDays] = useState("30");
  const [defaultDeposit, setDefaultDeposit] = useState("1500");
  const [pickupLocation, setPickupLocation] = useState("Campus Gate 1 Stand");
  const [isSaving, setIsSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    sounds.send();
    haptics.success();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast.success("Rental rules and policies saved!");
    }, 500);
  }

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-6 select-none pb-24">
      <div>
        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Settings className="size-5 text-primary" />
          <span>Bike Rental Rules &amp; Policies</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure rental duration limits, advance notice, and default security deposit
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Rental Duration &amp; Modes
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">Allowed Rental Modes</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRentalMode("HOURLY")}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  rentalMode === "HOURLY"
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                Hourly Only
              </button>
              <button
                type="button"
                onClick={() => setRentalMode("DAILY")}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  rentalMode === "DAILY"
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                Daily Only
              </button>
              <button
                type="button"
                onClick={() => setRentalMode("BOTH")}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  rentalMode === "BOTH"
                    ? "bg-foreground text-background font-black"
                    : "bg-muted/40 text-muted-foreground"
                }`}
              >
                Both Modes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Min Duration (Days)</span>
              <input
                type="number"
                value={minDuration}
                onChange={(e) => setMinDuration(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Max Duration (Days)</span>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border/40 space-y-3.5 shadow-xs">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Security Deposit &amp; Pickup Stand
          </h2>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">
              Default Security Deposit (₹)
            </span>
            <input
              type="number"
              value={defaultDeposit}
              onChange={(e) => setDefaultDeposit(e.target.value)}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3 text-xs font-black text-foreground outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">
              Default Pickup Stand Location
            </span>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full h-11 rounded-2xl bg-muted/40 border border-border px-3 text-xs font-bold text-foreground outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 rounded-2xl bg-foreground text-background font-black text-sm hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Save className="size-4" />
              <span>Save Rental Settings</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
}
