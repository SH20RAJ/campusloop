"use client";

import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Code2,
  Coffee,
  Compass,
  Eye,
  Flame,
  Gift,
  Globe,
  Image as ImageIcon,
  Laptop,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Mic,
  Palette,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { MarkdownEditor } from "@/components/common/markdown-editor";
import { UnsplashImagePicker } from "@/components/common/unsplash-image-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

// ─── Constants & Curated Presets ─────────────────────────────────────────────

interface EventTypeOption {
  id: string;
  label: string;
  desc: string;
  icon: typeof Code2;
  accent: string;
}

const EVENT_TYPES: EventTypeOption[] = [
  {
    id: "HACKATHON",
    label: "Hackathon",
    desc: "Coding sprints, builds & demos",
    icon: Code2,
    accent: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10",
  },
  {
    id: "WORKSHOP",
    label: "Workshop",
    desc: "Hands-on tech & creative bootcamps",
    icon: BookOpen,
    accent: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    id: "FEST",
    label: "College Fest",
    desc: "Annual fests, cultural nights & expos",
    icon: Sparkles,
    accent: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "COMPETITION",
    label: "Competition",
    desc: "Debates, case-comps & design wars",
    icon: Trophy,
    accent: "text-violet-500 border-violet-500/30 bg-violet-500/10",
  },
  {
    id: "SEMINAR",
    label: "Seminar / Talk",
    desc: "Guest lectures & alumni keynotes",
    icon: Mic,
    accent: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "MEETUP",
    label: "Meetup",
    desc: "Informal student gatherings & mixers",
    icon: Users,
    accent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  },
  {
    id: "CULTURAL",
    label: "Cultural",
    desc: "Music, dance, theatre & photography",
    icon: Palette,
    accent: "text-rose-500 border-rose-500/30 bg-rose-500/10",
  },
  {
    id: "SPORTS",
    label: "Sports / Esports",
    desc: "Tournaments, gaming & athletics",
    icon: Flame,
    accent: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  },
];

const MODES = [
  {
    id: "OFFLINE",
    label: "In-Person",
    desc: "Physical on-campus gathering",
    icon: Building2,
  },
  {
    id: "ONLINE",
    label: "Online",
    desc: "Google Meet, Zoom or Discord",
    icon: Globe,
  },
  {
    id: "HYBRID",
    label: "Hybrid",
    desc: "Physical hall with virtual stream",
    icon: Laptop,
  },
];

const PARTICIPATION_TYPES = [
  {
    id: "SOLO",
    label: "Solo Only",
    desc: "Individual registrants only",
    icon: User,
  },
  {
    id: "TEAM",
    label: "Teams Only",
    desc: "Form a squad to compete",
    icon: Users2,
  },
  {
    id: "BOTH",
    label: "Solo or Team",
    desc: "Open for individuals & teams",
    icon: UserPlus,
  },
];

const PRESET_BANNERS = [
  {
    title: "Hackathon Neon Grid",
    category: "Hackathon",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Vibrant Campus Fest",
    category: "Fest",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Tech Workshop & Code",
    category: "Workshop",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Gaming & Esports Arena",
    category: "Esports",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  },
];

const CAMPUS_VENUE_SUGGESTIONS = [
  "Main Auditorium",
  "Seminar Hall 1",
  "Computer Lab 3",
  "Open Air Amphitheatre",
  "SAC Student Activity Centre",
  "Campus Innovation Hub",
];

const SUGGESTED_PERKS = [
  { label: "Certificates", icon: Award },
  { label: "Cash Prizes", icon: Trophy },
  { label: "Loop Points", icon: Sparkles },
  { label: "Free Food & Snacks", icon: Coffee },
  { label: "Swag Kit & Stickers", icon: Gift },
  { label: "Cloud Credits", icon: Cloud },
  { label: "Internship Referrals", icon: Briefcase },
  { label: "1-on-1 Mentorship", icon: Compass },
];

const DESCRIPTION_TEMPLATE = `## About the Event

Tell students what this event is about, why it matters, and what makes it exciting to attend.

## Tracks & Themes

- **Track 1: AI & Automation** — Real-world intelligence and autonomous workflows.
- **Track 2: Open Innovation** — High-impact campus & social problem solving.
- **Track 3: Web & App Craft** — Consumer grade apps, design systems and tools.

## Schedule & Timeline

| Time | Session |
| --- | --- |
| 10:00 AM | Welcome Keynote & Problem Statements Unveiling |
| 12:30 PM | Mentorship Review Round 1 |
| 04:00 PM | Pitching & Live Demonstrations |
| 06:00 PM | Winners Announcement & Trophy Presentation |

## Rules & Eligibility

1. Valid student identity card is mandatory for verified participation.
2. Teams can have 1 to 4 members. Cross-college teams are welcome.
3. Original submissions only — build during the hackathon timeline.

## Judging Criteria

- **Innovation & Originality (30%)** — Novelty and creative problem-solving.
- **Execution & Technical Polish (40%)** — Usability, stability, and completion.
- **Campus & Market Impact (30%)** — Real-world utility for students.
`;

const DRAFT_KEY = "campusloop:event-draft";

export function NewEventClient() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [clubName, setClubName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);
  const [eventType, setEventType] = useState("HACKATHON");
  const [mode, setMode] = useState("OFFLINE");
  const [venue, setVenue] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [participationType, setParticipationType] = useState("SOLO");
  const [minTeamSize, setMinTeamSize] = useState("1");
  const [maxTeamSize, setMaxTeamSize] = useState("4");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [entryFee, setEntryFee] = useState("Free");
  const [prizesDescription, setPrizesDescription] = useState("");
  const [perks, setPerks] = useState<string[]>(["Certificates", "Cash Prizes", "Loop Points"]);
  const [perkInput, setPerkInput] = useState("");
  const [loopPointsReward, setLoopPointsReward] = useState("30");
  const [isAllColleges, setIsAllColleges] = useState(true);
  const [visibility, setVisibility] = useState<"PUBLIC" | "UNLISTED" | "PRIVATE">("PUBLIC");

  // Interaction State
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydrated = useRef(false);

  // ─── Draft Persistence ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const d = JSON.parse(saved) as Record<string, unknown>;
      if (typeof d.title === "string") setTitle(d.title);
      if (typeof d.tagline === "string") setTagline(d.tagline);
      if (typeof d.clubName === "string") setClubName(d.clubName);
      if (typeof d.description === "string") setDescription(d.description);
      if (typeof d.bannerUrl === "string") setBannerUrl(d.bannerUrl);
      if (typeof d.eventType === "string") setEventType(d.eventType);
      if (typeof d.mode === "string") setMode(d.mode);
      if (typeof d.venue === "string") setVenue(d.venue);
      if (typeof d.meetingUrl === "string") setMeetingUrl(d.meetingUrl);
      if (typeof d.startDate === "string") setStartDate(d.startDate);
      if (typeof d.endDate === "string") setEndDate(d.endDate);
      if (typeof d.registrationDeadline === "string") setRegistrationDeadline(d.registrationDeadline);
      if (typeof d.participationType === "string") setParticipationType(d.participationType);
      if (typeof d.prizesDescription === "string") setPrizesDescription(d.prizesDescription);
      if (Array.isArray(d.perks)) setPerks(d.perks as string[]);
      if (d.title || d.description) setDraftRestored(true);
    } catch {
      // Ignore corrupt drafts
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated.current) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title,
            tagline,
            clubName,
            description,
            bannerUrl,
            eventType,
            mode,
            venue,
            meetingUrl,
            startDate,
            endDate,
            registrationDeadline,
            participationType,
            prizesDescription,
            perks,
          })
        );
        const now = new Date();
        setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // Storage best-effort
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [
    title,
    tagline,
    clubName,
    description,
    bannerUrl,
    eventType,
    mode,
    venue,
    meetingUrl,
    startDate,
    endDate,
    registrationDeadline,
    participationType,
    prizesDescription,
    perks,
  ]);

  const isTeamEvent = participationType === "TEAM" || participationType === "BOTH";
  const needsVenue = mode === "OFFLINE" || mode === "HYBRID";
  const needsLink = mode === "ONLINE" || mode === "HYBRID";

  // ─── Readiness Calculator ───────────────────────────────────────────────────
  const readinessChecklist = useMemo(() => {
    return [
      { id: "title", label: "Event Title & Club Name", done: Boolean(title.trim() && clubName.trim()) },
      { id: "schedule", label: "Start & End Schedule", done: Boolean(startDate && endDate) },
      {
        id: "location",
        label: "Venue or Virtual Link",
        done: Boolean(
          (needsVenue && venue.trim()) || (needsLink && meetingUrl.trim()) || (!needsVenue && !needsLink)
        ),
      },
      { id: "banner", label: "Visual Banner Image", done: Boolean(bannerUrl.trim()) },
      { id: "description", label: "Description (>50 chars)", done: Boolean(description.trim().length >= 50) },
      {
        id: "rewards",
        label: "Prize Pool or Perks",
        done: Boolean(prizesDescription.trim() || perks.length > 0),
      },
    ];
  }, [
    title,
    clubName,
    startDate,
    endDate,
    needsVenue,
    venue,
    needsLink,
    meetingUrl,
    bannerUrl,
    description,
    prizesDescription,
    perks,
  ]);

  const readinessPercent = useMemo(() => {
    const doneCount = readinessChecklist.filter((c) => c.done).length;
    return Math.round((doneCount / readinessChecklist.length) * 100);
  }, [readinessChecklist]);

  // ─── Date Quick Helpers ─────────────────────────────────────────────────────
  function applyDatePreset(daysFromNow: number, hour = 10, durationHours = 6) {
    const start = new Date();
    start.setDate(start.getDate() + daysFromNow);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + durationHours);

    // Format to YYYY-MM-DDTHH:mm
    const toIsoLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDate(toIsoLocal(start));
    setEndDate(toIsoLocal(end));
    toast.success("Schedule preset applied");
    haptics.light();
  }

  async function handleBannerUpload(file: File) {
    if (!file) return;
    setIsUploadingBanner(true);
    haptics.light();
    const toastId = toast.loading("Uploading high-res banner...");
    try {
      const { displayUrl } = await uploadImageToImgBB(file);
      setBannerUrl(displayUrl);
      toast.success("Banner uploaded successfully", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Banner upload failed", { id: toastId });
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  function togglePerk(perk: string) {
    setPerks((prev) => (prev.includes(perk) ? prev.filter((p) => p !== perk) : [...prev, perk]));
  }

  function handleAddPerk(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const clean = perkInput.trim();
    if (clean && !perks.includes(clean)) {
      setPerks((prev) => [...prev, clean]);
      setPerkInput("");
      haptics.light();
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Best effort
    }
  }

  function validate(): string | null {
    if (!title.trim()) return "Give your event a clear title.";
    if (!clubName.trim()) return "Tell students which club or society is hosting.";
    if (!description.trim()) return "Add an event description so attendees know what to expect.";
    if (!startDate || !endDate) return "Select both a start and an end date/time.";

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return "The end time must be later than the start time.";

    if (registrationDeadline && new Date(registrationDeadline) > start) {
      return "Registrations must close on or before the event starts.";
    }
    if (needsVenue && !venue.trim() && mode === "OFFLINE") {
      return "Add a campus venue so students know where to report.";
    }
    if (isTeamEvent && Number(minTeamSize) > Number(maxTeamSize)) {
      return "Minimum team size cannot be greater than maximum team size.";
    }
    return null;
  }

  async function submit(status: "PUBLISHED" | "DRAFT") {
    if (isSubmitting) return;

    const problem = validate();
    if (problem) {
      toast.error(problem);
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    haptics.medium();

    try {
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
          registrationDeadline: registrationDeadline || null,
          participationType,
          minTeamSize: isTeamEvent ? Number(minTeamSize) || 1 : 1,
          maxTeamSize: isTeamEvent ? Number(maxTeamSize) || 4 : 1,
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          isPaid,
          entryFee: isPaid ? entryFee.trim() || "Paid" : "Free",
          eligibleInstitutionIds: isAllColleges ? ["ALL"] : [],
          prizesDescription: prizesDescription.trim() || null,
          perks,
          loopPointsReward: Number(loopPointsReward) || 30,
          status,
          visibility,
        }),
      });

      const data = (await res.json()) as Record<string, any>;
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      clearDraft();
      sounds.ting();
      toast.success(
        status === "DRAFT" ? "Draft saved. Publish whenever you're ready." : "Campus Event published live!"
      );
      mutate("/api/events");
      router.push(`/app/events/${data.event?.slug || data.event?.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedCategory = EVENT_TYPES.find((t) => t.id === eventType) ?? EVENT_TYPES[0];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary/20">
      {/* ─── Sticky Top Control Bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex size-8.5 items-center justify-center rounded-full border border-border/50 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Events</span>
                <span className="text-muted-foreground/40">/</span>
                <h1 className="text-sm font-black tracking-tight text-foreground sm:text-base">
                  Host an Event
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  <Sparkles className="size-2.5" />
                  +50 LP Host
                </span>
              </div>
              {lastSavedTime && (
                <p className="text-[10px] font-medium text-muted-foreground">Autosaved at {lastSavedTime}</p>
              )}
            </div>
          </div>

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle (Edit vs Live Preview) */}
            <div className="flex lg:hidden rounded-full border border-border/50 bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setMobileTab("edit")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                  mobileTab === "edit"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("preview")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all cursor-pointer",
                  mobileTab === "preview"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="size-3" />
                Preview
              </button>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => submit("DRAFT")}
              className="hidden sm:inline-flex h-8.5 cursor-pointer gap-1.5 rounded-full border-border/60 px-3.5 text-xs font-bold"
            >
              <Save className="size-3.5" />
              Save Draft
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={() => submit("PUBLISHED")}
              className="h-8.5 cursor-pointer gap-1.5 rounded-full bg-primary px-4 text-xs font-black text-primary-foreground shadow-sm shadow-primary/25 hover:opacity-90 active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5 fill-primary-foreground" />
              )}
              <span>Publish Event</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Draft Restored Banner */}
      {draftRestored && (
        <div className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs font-medium text-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-primary" />
              Restored your saved event draft from browser storage.
            </span>
            <button
              type="button"
              onClick={() => {
                clearDraft();
                setDraftRestored(false);
                toast.info("Draft cleared");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <Trash2 className="size-3" />
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Workspace: Split 12-Column Grid ─────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Form Builder (7 cols) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit("PUBLISHED");
            }}
            className={cn("space-y-8 lg:col-span-7", mobileTab === "preview" ? "hidden lg:block" : "block")}
          >
            {/* ── 1. Event Identity ────────────────────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    1
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">Event Essentials</h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Core metadata &amp; branding
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-foreground">
                  Event Title <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. HackBIT 2026: 36-Hour National Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 h-11 rounded-2xl text-sm font-semibold bg-background"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="text-xs font-bold text-foreground">Tagline / Catchy Pitch</label>
                <Input
                  placeholder="e.g. Build with AI & Web3. ₹2,00,000 Prize Pool + Mentorship from founders."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Short one-liner shown on feed cards and social preview links.
                </p>
              </div>

              {/* Organizing Club */}
              <div>
                <label className="text-xs font-bold text-foreground">
                  Organizing Club or Chapter <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. ACM Student Chapter, IEEE, Google Developer Group, EDC"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="mt-1.5 h-10 rounded-2xl text-xs font-semibold bg-background"
                />
              </div>

              {/* Visual Category Selection */}
              <div>
                <label className="text-xs font-bold text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {EVENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = eventType === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          setEventType(t.id);
                          haptics.light();
                        }}
                        className={cn(
                          "group flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-97",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-7 items-center justify-center rounded-xl border transition-colors mb-2",
                            isSelected
                              ? t.accent
                              : "border-border/40 bg-background text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <Icon className="size-3.5" />
                        </div>
                        <span className="text-xs font-black text-foreground">{t.label}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 2. Visual Banner & Cover ──────────────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    2
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">
                    Event Banner &amp; Visuals
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  21:9 or 16:9 ratio recommended
                </span>
              </div>

              {/* Banner Preview or Placeholder */}
              <div className="relative aspect-21/9 w-full overflow-hidden rounded-2xl border border-border/50 bg-muted/40 group">
                {bannerUrl ? (
                  <>
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                      onError={() => toast.error("Unable to load image link")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        <selectedCategory.icon className="size-3 text-primary" />
                        {selectedCategory.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBannerUrl("")}
                        className="rounded-full bg-destructive/80 px-2.5 py-1 text-[11px] font-bold text-destructive-foreground hover:bg-destructive transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/40 bg-background/50">
                      <ImageIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">No banner selected yet</p>
                      <p className="text-[11px] text-muted-foreground">
                        Pick a curated campus preset below or upload custom club artwork.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Curated Presets & Unsplash */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Quick Campus Presets</label>
                  <button
                    type="button"
                    onClick={() => setShowUnsplashPicker(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline cursor-pointer"
                  >
                    <Camera className="size-3.5" />
                    <span>Search Unsplash</span>
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.title}
                      onClick={() => {
                        setBannerUrl(preset.url);
                        haptics.light();
                      }}
                      className={cn(
                        "group relative aspect-16/9 overflow-hidden rounded-xl border text-left transition-all cursor-pointer",
                        bannerUrl === preset.url
                          ? "border-primary ring-2 ring-primary/40 shadow-xs"
                          : "border-border/40 hover:border-border"
                      )}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-black text-white line-clamp-1">
                        {preset.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Upload or URL */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Paste direct image link, or pick from Unsplash / upload →"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="h-10 rounded-2xl text-xs bg-background flex-1"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowUnsplashPicker(true)}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 text-xs font-black text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Camera className="size-3.5" />
                    <span>Unsplash</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl border border-border/50 bg-muted/40 px-3.5 text-xs font-black text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingBanner ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>Upload</span>
                  </button>
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleBannerUpload(file);
                }}
              />
            </div>

            {/* ── 3. Format, Venue & Virtual Links ─────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    3
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">Format &amp; Venue</h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">Where students join</span>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-xs font-bold text-foreground">
                  Event Mode <span className="text-destructive">*</span>
                </label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {MODES.map((m) => {
                    const Icon = m.icon;
                    const isSelected = mode === m.id;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setMode(m.id);
                          haptics.light();
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-97",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-xl border shrink-0",
                            isSelected
                              ? "border-primary/40 bg-primary text-primary-foreground"
                              : "border-border/40 bg-background text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground">{m.label}</p>
                          <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Inputs */}
              <div className="space-y-3">
                {needsVenue && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <MapPin className="size-3.5 text-primary" />
                      Campus Venue <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Main Auditorium, Hall 3, BIT Mesra"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="mt-1.5 h-10 rounded-2xl text-xs font-semibold bg-background"
                    />

                    {/* Quick Venue Chips */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground self-center mr-1">
                        Suggestions:
                      </span>
                      {CAMPUS_VENUE_SUGGESTIONS.map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => {
                            setVenue(v);
                            haptics.light();
                          }}
                          className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {needsLink && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Globe className="size-3.5 text-primary" />
                      Virtual Stream / Room URL
                    </label>
                    <Input
                      placeholder="https://meet.google.com/... or Discord Server link"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Shared with registered attendees before the event begins.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── 4. Schedule & Registration Window ────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    4
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">Date &amp; Deadlines</h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">IST Local Time</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset(3, 10, 8)}
                  className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  +3 Days (Full Day)
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(7, 9, 36)}
                  className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Next Weekend Hackathon (36h)
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(14, 14, 4)}
                  className="rounded-full border border-border/50 bg-muted/30 px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  In 2 Weeks (Workshop)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    Starts At <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Clock className="size-3.5 text-primary" />
                    Ends At <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    required
                    min={startDate || undefined}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Registration Closes On (Optional)</label>
                <Input
                  type="datetime-local"
                  max={startDate || undefined}
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Leave blank if registrations remain open until the event starts.
                </p>
              </div>
            </div>

            {/* ── 5. Participation & Team Structure ────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    5
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">
                    Participation &amp; Scope
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Team rules &amp; eligibility
                </span>
              </div>

              {/* Participation Mode */}
              <div>
                <label className="text-xs font-bold text-foreground">How Students Join</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PARTICIPATION_TYPES.map((p) => {
                    const Icon = p.icon;
                    const isSelected = participationType === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setParticipationType(p.id);
                          haptics.light();
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-97",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-8 items-center justify-center rounded-xl border shrink-0",
                            isSelected
                              ? "border-primary/40 bg-primary text-primary-foreground"
                              : "border-border/40 bg-background text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-foreground">{p.label}</p>
                          <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Size Stepper (if teams) */}
              {isTeamEvent && (
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3.5">
                  <div>
                    <label className="text-xs font-bold text-foreground">Min Team Size</label>
                    <Input
                      type="number"
                      min={1}
                      max={Number(maxTeamSize) || 10}
                      value={minTeamSize}
                      onChange={(e) => setMinTeamSize(e.target.value)}
                      className="mt-1 h-9 rounded-xl text-xs bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground">Max Team Size</label>
                    <Input
                      type="number"
                      min={Number(minTeamSize) || 1}
                      max={20}
                      value={maxTeamSize}
                      onChange={(e) => setMaxTeamSize(e.target.value)}
                      className="mt-1 h-9 rounded-xl text-xs bg-background"
                    />
                  </div>
                </div>
              )}

              {/* Audience & Participant Cap */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-foreground">Attendee Cap (Optional)</label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 250 (Leave blank for unlimited)"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground">Loop Points (Attendee Reward)</label>
                  <Input
                    type="number"
                    min={0}
                    max={200}
                    value={loopPointsReward}
                    onChange={(e) => setLoopPointsReward(e.target.value)}
                    className="mt-1.5 h-10 rounded-2xl text-xs bg-background"
                  />
                </div>
              </div>

              {/* Entry Fee Switch */}
              <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Entry Fee / Ticket</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isPaid ? "Paid registration required" : "100% Free for verified college students"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isPaid && (
                    <Input
                      placeholder="e.g. ₹150 per team"
                      value={entryFee === "Free" ? "" : entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      className="h-8.5 w-36 rounded-xl text-xs bg-background font-semibold"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsPaid((p) => !p);
                      haptics.light();
                    }}
                    className={cn(
                      "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
                      isPaid ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    aria-pressed={isPaid}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-background shadow-xs transition-transform",
                        isPaid ? "translate-x-5.5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Campus Audience Scope */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: true, label: "Open to All Colleges", desc: "1,350+ campuses across India" },
                  { value: false, label: "My Campus Only", desc: "Restricted to your college domain" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={String(opt.value)}
                    onClick={() => {
                      setIsAllColleges(opt.value);
                      haptics.light();
                    }}
                    className={cn(
                      "flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-97",
                      isAllColleges === opt.value
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                        : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {isAllColleges === opt.value && <Check className="size-3 text-primary" />}
                      <span className="text-xs font-black text-foreground">{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {/* Visibility Modes */}
              <div>
                <label className="text-xs font-bold text-foreground">Discovery &amp; Privacy</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    {
                      id: "PUBLIC" as const,
                      title: "Public",
                      icon: Globe,
                      desc: "Feeds, directory & search",
                    },
                    {
                      id: "UNLISTED" as const,
                      title: "Unlisted",
                      icon: Link2,
                      desc: "Direct link or QR code only",
                    },
                    {
                      id: "PRIVATE" as const,
                      title: "Campus Only",
                      icon: Lock,
                      desc: "Verified batchmates only",
                    },
                  ].map((v) => {
                    const Icon = v.icon;
                    const isSelected = visibility === v.id;
                    return (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => {
                          setVisibility(v.id);
                          haptics.light();
                        }}
                        className={cn(
                          "flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-97",
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
                        )}
                      >
                        <Icon className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-foreground">{v.title}</p>
                          <p className="text-[10px] text-muted-foreground">{v.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 6. Prizes, Perks & Incentives ────────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    6
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">Prizes &amp; Perks</h2>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Incentives for attendees
                </span>
              </div>

              {/* Prize Pool */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Trophy className="size-3.5 text-amber-500" />
                  Prize Pool Description
                </label>
                <Input
                  placeholder="e.g. ₹1,50,000 Cash Pool + Cloud Credits + Founder Mentorship"
                  value={prizesDescription}
                  onChange={(e) => setPrizesDescription(e.target.value)}
                  className="mt-1.5 h-10 rounded-2xl text-xs font-semibold bg-background"
                />
              </div>

              {/* Perks Badges & Quick Chips */}
              <div>
                <label className="text-xs font-bold text-foreground">Attendee Perks</label>

                {/* Selected Perks */}
                {perks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {perks.map((perk) => (
                      <span
                        key={perk}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-black text-primary shadow-xs"
                      >
                        <Sparkles className="size-3" />
                        {perk}
                        <button
                          type="button"
                          onClick={() => togglePerk(perk)}
                          className="size-4 inline-flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors cursor-pointer ml-0.5"
                          aria-label={`Remove ${perk}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Perks */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {SUGGESTED_PERKS.filter((s) => !perks.includes(s.label)).map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        type="button"
                        key={s.label}
                        onClick={() => {
                          togglePerk(s.label);
                          haptics.light();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Icon className="size-3 text-muted-foreground" />+ {s.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Perk Input */}
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Add custom perk (e.g. Free Domain for 1 Year, Food Stalls)"
                    value={perkInput}
                    onChange={(e) => setPerkInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPerk();
                      }
                    }}
                    className="h-9 rounded-xl text-xs bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPerk()}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                  >
                    <Plus className="size-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* ── 7. Detailed Description & Rules ──────────────────────────── */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                    7
                  </span>
                  <h2 className="text-sm font-black tracking-tight text-foreground">
                    Description &amp; Guidelines <span className="text-destructive">*</span>
                  </h2>
                </div>
                {!description.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setDescription(DESCRIPTION_TEMPLATE);
                      haptics.light();
                      toast.success("Event template inserted");
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Zap className="size-3 fill-primary" />
                    Use Template
                  </button>
                )}
              </div>

              <MarkdownEditor
                value={description}
                onChange={setDescription}
                required
                rows={14}
                stickyTopClass="top-16"
                placeholder="Detail the tracks, problem statements, schedule, eligibility rules and judging criteria. Markdown, tables and lists supported."
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => submit("DRAFT")}
                className="h-12 flex-1 cursor-pointer gap-2 rounded-2xl text-sm font-bold border-border/60"
              >
                <Save className="size-4" />
                Save Draft
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 flex-[2] cursor-pointer gap-2 rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/25 hover:opacity-90 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Publishing Event...</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-4 fill-primary-foreground" />
                    <span>Publish Campus Event</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Right Column: Sticky Live Preview & Host Readiness (5 cols) */}
          <aside
            className={cn(
              "space-y-6 lg:col-span-5 lg:sticky lg:top-20",
              mobileTab === "edit" ? "hidden lg:block" : "block"
            )}
          >
            {/* Live Card Preview */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Live Feed Card Preview
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Student View
                </span>
              </div>

              {/* Event Card Mockup */}
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all">
                {/* Banner */}
                <div className="relative aspect-16/9 w-full bg-muted/40 overflow-hidden">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted/30 to-background text-muted-foreground/50">
                      <selectedCategory.icon className="size-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges on Banner */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-black text-white backdrop-blur-md">
                      <selectedCategory.icon className="size-2.5 text-primary" />
                      {selectedCategory.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {mode === "OFFLINE" ? "In-Person" : mode === "ONLINE" ? "Virtual" : "Hybrid"}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md",
                        isPaid ? "bg-amber-500/80 text-white" : "bg-emerald-500/80 text-white"
                      )}
                    >
                      {isPaid ? entryFee.trim() || "Paid" : "Free"}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-[11px] font-bold text-white/80">
                      {clubName.trim() || "Your College Club"}
                    </p>
                    <h4 className="text-sm font-black text-white line-clamp-1">
                      {title.trim() || "Untitled Campus Event"}
                    </h4>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  {tagline.trim() && <p className="text-xs text-muted-foreground line-clamp-2">{tagline}</p>}

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1 font-medium text-foreground">
                        {startDate
                          ? new Date(startDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date to be announced"}
                      </span>
                    </div>

                    {needsVenue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="line-clamp-1 font-medium">{venue.trim() || "Campus Venue TBD"}</span>
                      </div>
                    )}

                    {prizesDescription.trim() && (
                      <div className="flex items-center gap-2">
                        <Trophy className="size-3.5 text-amber-500 shrink-0" />
                        <span className="line-clamp-1 font-bold text-amber-600 dark:text-amber-400">
                          {prizesDescription}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Perks preview */}
                  {perks.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {perks.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                        >
                          {p}
                        </span>
                      ))}
                      {perks.length > 3 && (
                        <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                          +{perks.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mock CTA Button */}
                  <div className="pt-2 border-t border-border/40">
                    <div className="h-9 w-full rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      Register on CampusLoop
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Readiness Meter */}
            <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-xs sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Host Readiness
                  </h3>
                </div>
                <span className="text-xs font-black text-primary">{readinessPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-1">
                {readinessChecklist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        item.done ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                    {item.done ? (
                      <Check className="size-3.5 text-primary" />
                    ) : (
                      <span className="size-2 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Host Tips Card */}
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background p-5 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h4 className="text-xs font-black text-foreground">CampusLoop Host Perks</h4>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-primary shrink-0 mt-0.5" />
                  <span>Instant SEO indexing &amp; shareable social preview tags.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-primary shrink-0 mt-0.5" />
                  <span>Earn 50 Loop Points upon verified event publishing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="size-3 text-primary shrink-0 mt-0.5" />
                  <span>Zero spam: registrants are verified college students only.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Unsplash Cover Picker Modal */}
      <UnsplashImagePicker
        isOpen={showUnsplashPicker}
        onClose={() => setShowUnsplashPicker(false)}
        onSelect={(photo) => {
          setBannerUrl(photo.url);
          toast.success(`Selected banner by ${photo.photographerName}`);
        }}
        defaultQuery={eventType ? eventType.toLowerCase() : "hackathon"}
        title="Choose Event Banner from Unsplash"
      />
    </div>
  );
}
