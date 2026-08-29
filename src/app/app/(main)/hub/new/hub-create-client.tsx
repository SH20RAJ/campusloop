"use client";

import { DedicatedHubType } from "@/components/communities/dedicated-hub-client";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Car,
  CheckCheck,
  Gamepad2,
  Home,
  Loader2,
  PackageSearch,
  Plus,
  Send,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface HubCreateClientProps {
  initialType?: DedicatedHubType;
  profileId: string;
}

const HUB_CATEGORIES: Array<{
  id: DedicatedHubType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  href: string;
}> = [
  {
    id: "lost_found",
    label: "Lost & Found",
    icon: PackageSearch,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    badge: "Report Item",
    href: "/app/lost-and-found",
  },
  {
    id: "marketplace",
    label: "Buy & Sell",
    icon: ShoppingBag,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    badge: "Sell Gear",
    href: "/app/marketplace",
  },
  {
    id: "gaming",
    label: "Gaming Arena",
    icon: Gamepad2,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    badge: "Host Lobby",
    href: "/app/gaming",
  },
  {
    id: "rideshare",
    label: "Ride Share",
    icon: Car,
    color: "text-sky-500 bg-sky-500/10 border-sky-500/30",
    badge: "Offer Ride",
    href: "/app/rideshare",
  },
  {
    id: "housing",
    label: "Housing & Flats",
    icon: Home,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    badge: "List Room",
    href: "/app/housing",
  },
  {
    id: "academics",
    label: "Academic Notes",
    icon: BookOpen,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    badge: "Share Material",
    href: "/app/academics",
  },
];

export function HubCreateClient({ initialType = "lost_found", profileId }: HubCreateClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type") as DedicatedHubType | null;
  const [hubType, setHubType] = useState<DedicatedHubType>(queryType || initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Specific Form States
  // Lost & Found
  const [lfType, setLfType] = useState<"LOST" | "FOUND">("LOST");
  const [location, setLocation] = useState("");
  const [reward, setReward] = useState("");

  // Marketplace
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [category, setCategory] = useState("Cycles");
  const [hostelLocation, setHostelLocation] = useState("");

  // Gaming
  const [gameName, setGameName] = useState("Valorant");
  const [mode, setMode] = useState("5v5 Competitive");
  const [rankTier, setRankTier] = useState("");
  const [gamerTag, setGamerTag] = useState("");
  const [slotsTotal, setSlotsTotal] = useState("5");
  const [scheduledAt, setScheduledAt] = useState("Tonight 10:30 PM");

  // Ride Share
  const [origin, setOrigin] = useState("Campus Main Gate");
  const [destination, setDestination] = useState("Railway Station / Airport");
  const [departureTime, setDepartureTime] = useState("Tomorrow 6:00 AM");
  const [totalSeats, setTotalSeats] = useState("4");
  const [pricePerSeat, setPricePerSeat] = useState("75");

  // Housing
  const [rentPerMonth, setRentPerMonth] = useState("4500");
  const [distanceFromCampus, setDistanceFromCampus] = useState("5 min walk");
  const [occupancyType, setOccupancyType] = useState("SINGLE_ROOM");
  const [genderPreference, setGenderPreference] = useState("ANY");

  // Academics
  const [subjectCode, setSubjectCode] = useState("CS201");
  const [subjectName, setSubjectName] = useState("Data Structures & Algorithms");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState("3");
  const [driveUrl, setDriveUrl] = useState("");

  const activeCategory = HUB_CATEGORIES.find((c) => c.id === hubType) || HUB_CATEGORIES[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a headline title");
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
        payload.hostelLocation = hostelLocation || "Campus Hostel";
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
        throw new Error(err.error || "Failed to publish listing");
      }

      sounds.ting();
      haptics.repost();
      toast.success("Published to Campus Hub! 🚀");
      router.push(activeCategory.href);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to publish");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col min-h-screen pb-24 border-x border-border/20 bg-background text-foreground select-none">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="size-4.5" />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground">
              New {activeCategory.label} Listing
            </h1>
            <p className="text-xs text-muted-foreground">Post to verified college peers</p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSubmitting || !title.trim()}
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              <span>Publish Listing</span>
            </>
          )}
        </button>
      </header>

      {/* ─── Category Selection Strip (Twitter/X Style Pills) ─── */}
      <div className="px-4 py-3 border-b border-border/20 overflow-x-auto scrollbar-none bg-muted/10">
        <div className="flex items-center gap-2 min-w-max">
          {HUB_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = hubType === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setHubType(cat.id);
                  sounds.tap();
                  haptics.light();
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Form Container ─── */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Headline Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              hubType === "lost_found"
                ? "e.g. Titan Watch with black leather strap found in Library"
                : hubType === "marketplace"
                ? "e.g. Hero Sprint Cycle in great condition with lock"
                : hubType === "gaming"
                ? "e.g. Valorant 5v5 Custom Room - Need 2 Players"
                : hubType === "rideshare"
                ? "e.g. Cab share from Campus to Airport"
                : hubType === "housing"
                ? "e.g. 1 BHK Flat Available near Gate 2"
                : "e.g. Endsem Notes & Previous Year Questions for CS201"
            }
            className="w-full h-11 px-4 rounded-2xl border border-border/60 bg-muted/20 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Dynamic Category-Specific Fields */}
        {hubType === "lost_found" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Report Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLfType("LOST")}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    lfType === "LOST"
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                      : "bg-muted/20 border-border/50 text-muted-foreground"
                  )}
                >
                  Lost Item (I lost this)
                </button>
                <button
                  type="button"
                  onClick={() => setLfType("FOUND")}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    lfType === "FOUND"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
                      : "bg-muted/20 border-border/50 text-muted-foreground"
                  )}
                >
                  Found Item (I found this)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Campus Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Library 2nd Floor, Room 304"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {hubType === "marketplace" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-card text-xs font-semibold text-foreground outline-none focus:border-primary"
              >
                <option value="NEW">Like New / Brand New</option>
                <option value="GOOD">Good / Gently Used</option>
                <option value="FAIR">Fair / Working</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Pickup Location</label>
              <input
                type="text"
                value={hostelLocation}
                onChange={(e) => setHostelLocation(e.target.value)}
                placeholder="e.g. Hostel 5 Common Room"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {hubType === "gaming" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Game Name</label>
              <select
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-card text-xs font-semibold text-foreground outline-none focus:border-primary"
              >
                <option value="Valorant">Valorant</option>
                <option value="BGMI">BGMI / PUBG Mobile</option>
                <option value="CS2">Counter-Strike 2</option>
                <option value="Dota 2">Dota 2</option>
                <option value="FIFA">EA Sports FC / FIFA</option>
                <option value="Chess">Chess.com</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Gamer Tag / ID</label>
              <input
                type="text"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                placeholder="e.g. Shaswat#IND"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Scheduled Time</label>
              <input
                type="text"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                placeholder="e.g. Tonight 11:00 PM"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {hubType === "rideshare" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Pickup Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Campus Main Gate"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Railway Station"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Departure Time</label>
              <input
                type="text"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="e.g. Tomorrow 6:30 AM"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Cost per Person (₹)</label>
              <input
                type="number"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                placeholder="e.g. 75"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {hubType === "housing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Monthly Rent (₹)</label>
              <input
                type="number"
                value={rentPerMonth}
                onChange={(e) => setRentPerMonth(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Distance to Campus</label>
              <input
                type="text"
                value={distanceFromCampus}
                onChange={(e) => setDistanceFromCampus(e.target.value)}
                placeholder="e.g. 5 min walk from Gate 2"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {hubType === "academics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Subject Code & Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. CS201 - Data Structures"
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Google Drive / Resource Link</label>
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Description Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Details & Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add helpful details, contact preferences, timings, or specs for your batchmates..."
            className="w-full p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all resize-none"
          />
        </div>
      </form>
    </div>
  );
}
