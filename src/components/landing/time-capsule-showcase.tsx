"use client";

import { Card,CardContent } from "@/components/ui/card";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
CheckCircle2,
Eye,
Hourglass,
Lock,
Unlock,
Wand2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "./reveal";

export function TimeCapsuleShowcase() {
  const [isSealed, setIsSealed] = useState(true);
  const [testPrediction, setTestPrediction] = useState("");
  const [buriedCount, setBuriedCount] = useState(14);
  const [hasBuried, setHasBuried] = useState(false);

  function handleBury(e: React.FormEvent) {
    e.preventDefault();
    if (!testPrediction.trim()) return;
    sounds.archive();
    haptics.repost();
    setBuriedCount((prev) => prev + 1);
    setHasBuried(true);
    setTestPrediction("");
    toast.success("Prediction sealed in demo vault! ⏳");
  }

  function handleToggleMode() {
    sounds.tap();
    haptics.light();
    setIsSealed(!isSealed);
  }

  return (
    <section className="relative w-full overflow-hidden border-t border-border/60 bg-gradient-to-b from-amber-500/[0.04] to-transparent py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl space-y-3 pb-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Only on CampusLoop • Zero Other Apps Have This
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-foreground">
            Campus Time Capsule &amp; Batch Legacy Vault
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Bury predictions, hostel confessions, and convocation letters to your future selves. Everything is cryptographically locked until graduation day or landmark college dates.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-12 items-center w-full min-w-0">
          {/* Left Explainer */}
          <div className="lg:col-span-5 space-y-5 w-full min-w-0">
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground">
                    1. Sealed Until Convocation
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    Contribute photos, voice notes, and predictions. No one on campus — not even moderators — can read them until the countdown timer expires.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Wand2 className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground">
                    2. Wild Campus Predictions
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    &ldquo;Who in our batch will start a unicorn?&rdquo;, &ldquo;Will the 2 AM canteen Maggi price ever drop?&rdquo;, &ldquo;Who will marry first?&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Unlock className="size-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground">
                    3. Unlocked Museum Timeline Wall
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    When the timer strikes zero, the vault erupts in an interactive campus museum wall for the entire graduating class to celebrate.
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle demo mode */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleMode}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/80 bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer max-w-full"
              >
                <Eye className="size-3.5 text-amber-500 shrink-0" />
                <span className="truncate">
                  Switch to {isSealed ? "Unlocked Museum Mode" : "Sealed Countdown Mode"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Interactive Capsule Card */}
          <div className="lg:col-span-7 w-full min-w-0">
            <Card className="w-full max-w-full overflow-hidden border border-border/80 bg-card shadow-xl">
              {/* Card Banner */}
              <div
                className="relative h-44 w-full bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />

                <div className="absolute top-3.5 right-3.5 z-10">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 backdrop-blur-md",
                      isSealed
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    )}
                  >
                    {isSealed ? <Lock className="size-3 shrink-0" /> : <Unlock className="size-3 shrink-0" />}
                    <span>{isSealed ? "Sealed Vault" : "Unlocked Museum"}</span>
                  </span>
                </div>

                <div className="absolute bottom-3 inset-x-4 sm:inset-x-5 z-10 min-w-0 pr-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block truncate">
                    BIT Mesra • Batch of 2026
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground truncate">
                    Class of 2026 Convocation Vault 🎓
                  </h3>
                </div>
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4 w-full min-w-0">
                {/* Countdown Ticker Box */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/30 w-full min-w-0">
                  <div className="flex items-center gap-2 text-xs min-w-0">
                    <Hourglass className="size-4 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-muted-foreground block text-[10px] uppercase truncate">
                        {isSealed ? "Target Unlock Date" : "Unlocked On"}
                      </span>
                      <span className="font-black text-foreground text-xs sm:text-sm block truncate">
                        {isSealed ? "Convocation Day • June 15, 2027" : "Orientation Fest Day"}
                      </span>
                    </div>
                  </div>

                  {isSealed ? (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold shrink-0 self-start sm:self-auto">
                      <div className="bg-background/80 border border-border/40 px-2 py-1 rounded-lg text-center min-w-[40px]">
                        <span className="text-sm font-black text-foreground">280</span>
                        <span className="block text-[8px] text-muted-foreground font-sans uppercase">Days</span>
                      </div>
                      <span className="font-black text-muted-foreground">:</span>
                      <div className="bg-background/80 border border-border/40 px-2 py-1 rounded-lg text-center min-w-[40px]">
                        <span className="text-sm font-black text-foreground">14</span>
                        <span className="block text-[8px] text-muted-foreground font-sans uppercase">Hrs</span>
                      </div>
                      <span className="font-black text-muted-foreground">:</span>
                      <div className="bg-background/80 border border-border/40 px-2 py-1 rounded-lg text-center min-w-[40px]">
                        <span className="text-sm font-black text-foreground">32</span>
                        <span className="block text-[8px] text-muted-foreground font-sans uppercase">Min</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                      All Entries Public to Batch
                    </span>
                  )}
                </div>

                {isSealed ? (
                  <div className="space-y-3 w-full min-w-0">
                    <div className="flex items-center justify-between text-xs min-w-0">
                      <span className="font-bold text-muted-foreground truncate">
                        <strong className="text-foreground font-black">{buriedCount}</strong> Memories &amp; Predictions Buried
                      </span>
                      {hasBuried && (
                        <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1 shrink-0 ml-2">
                          <CheckCircle2 className="size-3" />
                          <span>Your memory is sealed!</span>
                        </span>
                      )}
                    </div>

                    {/* Interactive Bury Input */}
                    <form onSubmit={handleBury} className="flex items-center gap-2 w-full min-w-0">
                      <input
                        type="text"
                        value={testPrediction}
                        onChange={(e) => setTestPrediction(e.target.value)}
                        placeholder="Bury a prediction (e.g. Ayush will build a unicorn)..."
                        className="flex-1 min-w-0 w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 cursor-pointer shadow-xs active:scale-95 shrink-0"
                      >
                        <Lock className="size-3" />
                        <span>Bury</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Unlocked Museum Wall Preview */
                  <div className="space-y-2.5 pt-1 w-full min-w-0">
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1 w-full min-w-0">
                      <div className="flex items-center justify-between text-[11px] min-w-0">
                        <span className="font-bold text-foreground truncate">@isha_mukherjee</span>
                        <span className="text-muted-foreground shrink-0 ml-2">Batch Letter</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">
                        &ldquo;Remember that 2:00 AM Maggi session at Hostel 11 when our project failed 4 times. Hope we all stayed close.&rdquo;
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/30 space-y-1 w-full min-w-0">
                      <div className="flex items-center justify-between text-[11px] min-w-0">
                        <span className="font-bold text-amber-500 truncate">@anonymous_time_traveler</span>
                        <span className="text-muted-foreground shrink-0 ml-2">Prediction Made 2025</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">
                        &ldquo;Prediction: In 2027, Ayush will move to Bangalore for fintech and I will still be debugging React hooks in production.&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
