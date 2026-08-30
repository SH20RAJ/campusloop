"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { ArrowLeft, Calendar, Image as ImageIcon, MapPin, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

const EVENT_TYPES = [
  { id: "HACKATHON", label: "Hackathon" },
  { id: "WORKSHOP", label: "Workshop" },
  { id: "FEST", label: "College Fest" },
  { id: "COMPETITION", label: "Competition" },
  { id: "SEMINAR", label: "Seminar / Talk" },
  { id: "MEETUP", label: "Meetup" },
];

const MODES = [
  { id: "OFFLINE", label: "In-Person (Campus)" },
  { id: "ONLINE", label: "Online" },
  { id: "HYBRID", label: "Hybrid" },
];

export function NewEventClient() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [eventType, setEventType] = useState("HACKATHON");
  const [mode, setMode] = useState("OFFLINE");
  const [venue, setVenue] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [participationType, setParticipationType] = useState("SOLO");
  const [prizesDescription, setPrizesDescription] = useState("");
  const [perksStr, setPerksStr] = useState("Certificates, Prizes, Loop Points");
  const [isAllColleges, setIsAllColleges] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim() || !clubName.trim() || !description.trim() || !startDate || !endDate) {
      toast.error("Please fill in all required fields (Title, Club, Description, Dates)");
      return;
    }

    setIsSubmitting(true);
    haptics.medium();

    try {
      const perks = perksStr
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          clubName,
          description,
          bannerUrl: bannerUrl.trim() || null,
          eventType,
          mode,
          venue: venue.trim() || null,
          meetingUrl: meetingUrl.trim() || null,
          startDate,
          endDate,
          participationType,
          eligibleInstitutionIds: isAllColleges ? ["ALL"] : [],
          prizesDescription: prizesDescription.trim() || null,
          perks,
          loopPointsReward: 30,
        }),
      });

      const data = (await res.json()) as Record<string, any>;
      if (!res.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      sounds.pop();
      toast.success("Campus Event published successfully! 🚀");
      mutate("/api/events");
      router.push(`/app/events/${data.event.slug || data.event.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-28 border-x border-border/40 bg-background max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>

        <h1 className="text-sm font-black text-foreground">Host a Campus Event</h1>

        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            1. Event Overview
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">
              Event Title <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. HackBIT 2026 — 36-Hour Hackathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 rounded-2xl text-xs h-10 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Tagline / Subtitle</label>
            <Input
              placeholder="e.g. Build the future of AI & Web3. ₹1.5L Prize Pool."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 rounded-2xl text-xs h-10"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">
              Organizing Club / Society <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. ACM BIT Mesra, IEEE Student Branch, EDC"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className="mt-1 rounded-2xl text-xs h-10 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">
              Banner Image URL (Unsplash or direct image link)
            </label>
            <div className="relative mt-1">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="https://images.unsplash.com/photo-..."
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="pl-9 rounded-2xl text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Category & Mode */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Category & Format
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
              {EVENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setEventType(t.id)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    eventType === t.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Event Mode</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    mode === m.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground border border-border/40"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">Venue / Offline Location</label>
              <Input
                placeholder="e.g. Cat Hall, BIT Mesra"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1 rounded-2xl text-xs h-10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Online Link (Google Meet/Discord)</label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="mt-1 rounded-2xl text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Timing & Dates */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            3. Date & Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 rounded-2xl text-xs h-10"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 rounded-2xl text-xs h-10"
              />
            </div>
          </div>
        </div>

        {/* Prizes & Perks */}
        <div className="space-y-4 pt-2 border-t border-border/40">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            4. Prizes & Details
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">Prizes Description</label>
            <Input
              placeholder="e.g. ₹1,50,000 Cash Pool + Cloud Credits + Swag Kits"
              value={prizesDescription}
              onChange={(e) => setPrizesDescription(e.target.value)}
              className="mt-1 rounded-2xl text-xs h-10"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">
              Perks (Comma-separated)
            </label>
            <Input
              placeholder="Certificates, Free Food, RedBull, +50 Loop Points"
              value={perksStr}
              onChange={(e) => setPerksStr(e.target.value)}
              className="mt-1 rounded-2xl text-xs h-10"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">
              Full Description & Rules <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              rows={6}
              placeholder="Describe the hackathon tracks, schedule, rules, and judging criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 rounded-2xl text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-border/40">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-full font-black text-sm bg-primary text-primary-foreground hover:opacity-90 shadow-md cursor-pointer"
          >
            {isSubmitting ? "Publishing Event..." : "Publish Campus Event 🚀"}
          </Button>
        </div>
      </form>
    </div>
  );
}
