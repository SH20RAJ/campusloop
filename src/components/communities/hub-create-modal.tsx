"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { HubTabType } from "@/components/communities/campus-hub-strip";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface HubCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHub: HubTabType;
  onItemCreated?: (item: any) => void;
}

export function HubCreateModal({ isOpen, onClose, defaultHub, onItemCreated }: HubCreateModalProps) {
  const [hubType, setHubType] = useState<HubTabType>(
    defaultHub === "all" || defaultHub === "discussions" ? "lost_found" : defaultHub
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Specific Form States
  // Lost & Found
  const [lfType, setLfType] = useState<"LOST" | "FOUND">("LOST");
  const [location, setLocation] = useState("");
  const [reward] = useState("");

  // Marketplace
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [category] = useState("Cycles");
  const [hostelLocation] = useState("");

  // Gaming
  const [gameName, setGameName] = useState("Valorant");
  const [mode] = useState("5v5");
  const [rankTier] = useState("");
  const [gamerTag, setGamerTag] = useState("");
  const [slotsTotal] = useState("5");
  const [scheduledAt] = useState("Tonight 10:30 PM");

  // Ride Share
  const [origin] = useState("Campus Gate");
  const [destination, setDestination] = useState("Ranchi Railway Station");
  const [departureTime] = useState("Tomorrow 6:00 AM");
  const [totalSeats] = useState("4");
  const [pricePerSeat, setPricePerSeat] = useState("75");

  // Housing
  const [rentPerMonth] = useState("4500");
  const [distanceFromCampus] = useState("5 min walk");
  const [occupancyType] = useState("SINGLE_ROOM");
  const [genderPreference] = useState("ANY");

  // Academics
  const [subjectCode, setSubjectCode] = useState("CS201");
  const [subjectName] = useState("Data Structures");
  const [branch] = useState("Computer Science");
  const [semester] = useState("3");
  const [driveUrl, setDriveUrl] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    sounds.tap();
    haptics.light();

    try {
      const payload: any = {
        hubType,
        title: title.trim(),
        description: description.trim(),
      };

      if (hubType === "lost_found") {
        payload.type = lfType;
        payload.location = location || "Campus";
        payload.reward = reward || null;
      } else if (hubType === "marketplace") {
        payload.price = parseInt(price, 10) || 100;
        payload.condition = condition;
        payload.category = category;
        payload.hostelLocation = hostelLocation || "Hostel";
      } else if (hubType === "gaming") {
        payload.gameName = gameName;
        payload.mode = mode;
        payload.rankTier = rankTier || null;
        payload.gamerTag = gamerTag || null;
        payload.slotsTotal = parseInt(slotsTotal, 10) || 5;
        payload.scheduledAt = scheduledAt;
      } else if (hubType === "rideshare") {
        payload.origin = origin;
        payload.destination = destination;
        payload.departureTime = departureTime;
        payload.totalSeats = parseInt(totalSeats, 10) || 4;
        payload.availableSeats = parseInt(totalSeats, 10) - 1;
        payload.pricePerSeat = parseInt(pricePerSeat, 10) || 50;
      } else if (hubType === "housing") {
        payload.rentPerMonth = parseInt(rentPerMonth, 10) || 3000;
        payload.distanceFromCampus = distanceFromCampus;
        payload.occupancyType = occupancyType;
        payload.genderPreference = genderPreference;
        payload.location = location || "Near Campus Gate";
      } else if (hubType === "academics") {
        payload.subjectCode = subjectCode;
        payload.subjectName = subjectName;
        payload.branch = branch;
        payload.semester = parseInt(semester, 10) || 1;
        payload.driveUrl = driveUrl || null;
      }

      const res = await fetch("/api/communities/hub/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to create hub post");
      }

      const resData = (await res.json().catch(() => ({}))) as { item?: any };
      const item = resData.item;

      sounds.ting();
      haptics.repost();
      toast.success("Published to Campus Hub! 🚀");
      onItemCreated?.(item);
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to publish");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-foreground">Post to Campus Hub</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Connect with verified classmates in your college network
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Hub Category Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "lost_found", label: "Lost & Found" },
              { id: "marketplace", label: "Buy & Sell" },
              { id: "gaming", label: "Gaming" },
              { id: "rideshare", label: "Ride Share" },
              { id: "housing", label: "Housing" },
              { id: "academics", label: "Notes & PYQs" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sounds.tap();
                  haptics.light();
                  setHubType(cat.id as HubTabType);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer",
                  hubType === cat.id
                    ? "bg-foreground text-background shadow-xs"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Title / Headline *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  hubType === "lost_found"
                    ? "e.g. Titan Watch with black leather strap"
                    : hubType === "marketplace"
                      ? "e.g. Hero Sprint 21-Speed Cycle with lock"
                      : hubType === "gaming"
                        ? "e.g. Plat/Diamond 5v5 Valorant Scrims • Need 2 Duelists"
                        : hubType === "rideshare"
                          ? "e.g. Cab split to Ranchi Rly Station"
                          : hubType === "housing"
                            ? "e.g. 1 Room available in 3BHK flat near Back Gate"
                            : "e.g. DSA Handwritten End-Sem Notes + Solved PYQs"
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Hub-Specific Fields */}
            {hubType === "lost_found" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Report Type</label>
                  <select
                    value={lfType}
                    onChange={(e) => setLfType(e.target.value as any)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="LOST">Lost Item (I lost this)</option>
                    <option value="FOUND">Found Item (I found this)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Campus Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. CAT Hall Room 214"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {hubType === "marketplace" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="BRAND_NEW">Brand New</option>
                    <option value="LIKE_NEW">Like New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                  </select>
                </div>
              </div>
            )}

            {hubType === "gaming" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Game</label>
                  <select
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Valorant">Valorant</option>
                    <option value="Chess">Chess</option>
                    <option value="BGMI">BGMI / PUBG</option>
                    <option value="FIFA">EA FC / FIFA</option>
                    <option value="CS2">Counter-Strike 2</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Gamer / Riot Tag</label>
                  <input
                    type="text"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    placeholder="e.g. Viper#IN1"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {hubType === "rideshare" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Origin & Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination (e.g. Airport)"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Price per seat (₹)</label>
                  <input
                    type="number"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    placeholder="75"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {hubType === "academics" && (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Subject Code & Name</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS201"
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Google Drive / PDF Link
                  </label>
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Details & Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add helpful details, contact preferences, timings, or specs..."
                rows={3}
                className="w-full rounded-xl border border-border/80 bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/95 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    <span>Publish to Hub</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
