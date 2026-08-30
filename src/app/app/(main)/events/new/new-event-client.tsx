"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { MarkdownEditor } from "@/components/common/markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { id: "HACKATHON", label: "Hackathon" },
  { id: "WORKSHOP", label: "Workshop" },
  { id: "FEST", label: "College Fest" },
  { id: "COMPETITION", label: "Competition" },
  { id: "SEMINAR", label: "Seminar / Talk" },
  { id: "MEETUP", label: "Meetup" },
  { id: "CULTURAL", label: "Cultural" },
  { id: "SPORTS", label: "Sports" },
];

const MODES = [
  { id: "OFFLINE", label: "In-Person" },
  { id: "ONLINE", label: "Online" },
  { id: "HYBRID", label: "Hybrid" },
];

const PARTICIPATION_TYPES = [
  { id: "SOLO", label: "Solo Only" },
  { id: "TEAM", label: "Teams Only" },
  { id: "BOTH", label: "Solo or Team" },
];

const SUGGESTED_PERKS = [
  "Certificates",
  "Prizes",
  "Loop Points",
  "Free Food",
  "Swag Kit",
  "Cloud Credits",
  "Internship Referrals",
  "Mentorship",
  "Networking",
];

const DESCRIPTION_TEMPLATE = `## About the Event

Tell students what this is about and why it is worth their weekend.

## Tracks & Themes

- Track 1 — description
- Track 2 — description

## Schedule

| Time | Session |
| --- | --- |
| Day 1, 10:00 AM | Opening keynote |

## Rules & Eligibility

1. Open to all students with a valid college ID.
2. Teams of up to 4 members.

## Judging Criteria

- Innovation
- Execution
- Impact
`;

const DRAFT_KEY = "campusloop:event-draft";

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
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [participationType, setParticipationType] = useState("SOLO");
  const [minTeamSize, setMinTeamSize] = useState("1");
  const [maxTeamSize, setMaxTeamSize] = useState("4");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [entryFee, setEntryFee] = useState("Free");
  const [prizesDescription, setPrizesDescription] = useState("");
  const [perks, setPerks] = useState<string[]>(["Certificates", "Prizes", "Loop Points"]);
  const [perkInput, setPerkInput] = useState("");
  const [loopPointsReward, setLoopPointsReward] = useState("30");
  const [isAllColleges, setIsAllColleges] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const hasHydrated = useRef(false);

  // ─── Draft persistence: hosting an event is a long form, don't lose it ───
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
      // A corrupt draft should never block hosting an event.
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
      } catch {
        // Storage can be full or blocked; autosave is best-effort.
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

  async function handleBannerUpload(file: File) {
    if (!file) return;
    setIsUploadingBanner(true);
    haptics.light();
    const toastId = toast.loading("Uploading banner...");
    try {
      const { displayUrl } = await uploadImageToImgBB(file);
      setBannerUrl(displayUrl);
      toast.success("Banner uploaded", { id: toastId });
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

  function handleAddPerk(e: React.FormEvent) {
    e.preventDefault();
    const clean = perkInput.trim();
    if (clean && !perks.includes(clean)) {
      setPerks((prev) => [...prev, clean]);
    }
    setPerkInput("");
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to recover from — the form still submits fine.
    }
  }

  /** Client-side mirror of the API's validation, so mistakes surface instantly. */
  function validate(): string | null {
    if (!title.trim()) return "Give your event a title.";
    if (!clubName.trim()) return "Tell students which club is organising this.";
    if (!description.trim()) return "Add a description so students know what to expect.";
    if (!startDate || !endDate) return "Set both a start and an end date.";

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return "The end time must be after the start time.";

    if (registrationDeadline && new Date(registrationDeadline) > start) {
      return "Registrations must close on or before the event starts.";
    }
    if (needsVenue && !venue.trim() && mode === "OFFLINE") {
      return "Add a venue so students know where to show up.";
    }
    if (isTeamEvent && Number(minTeamSize) > Number(maxTeamSize)) {
      return "Minimum team size cannot exceed the maximum.";
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
        }),
      });

      const data = (await res.json()) as Record<string, any>;
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      clearDraft();
      sounds.ting();
      toast.success(
        status === "DRAFT" ? "Draft saved — publish it when you're ready." : "Campus Event published! 🚀"
      );
      mutate("/api/events");
      router.push(`/app/events/${data.event.slug || data.event.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
      haptics.error();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto border-x border-border/40 bg-background pb-28">
      {/* ─── Sticky Header ─── */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex cursor-pointer items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h1 className="text-sm font-black text-foreground">Host a Campus Event</h1>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => submit("DRAFT")}
            className="h-8 cursor-pointer gap-1.5 rounded-full px-3 text-xs font-black"
          >
            <Save className="size-3.5" />
            <span className="hidden sm:inline">Draft</span>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => submit("PUBLISHED")}
            className="h-8 cursor-pointer gap-1.5 rounded-full bg-primary px-3.5 text-xs font-black text-primary-foreground shadow-md shadow-primary/20 hover:opacity-90 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            <span>Publish</span>
          </Button>
        </div>
      </div>

      {draftRestored && (
        <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-primary/5 px-4 py-2.5">
          <p className="text-[11px] font-bold text-foreground">Restored your unfinished event draft.</p>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setDraftRestored(false);
              toast.info("Draft discarded");
            }}
            className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3" />
            Discard
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit("PUBLISHED");
        }}
        className="space-y-7 p-4 md:p-6"
      >
        {/* ─── 1. Overview ─── */}
        <section className="space-y-4">
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
              className="mt-1 h-10 rounded-2xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Tagline / Subtitle</label>
            <Input
              placeholder="e.g. Build the future of AI & Web3. ₹1.5L Prize Pool."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 h-10 rounded-2xl text-xs"
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
              className="mt-1 h-10 rounded-2xl text-xs font-bold"
            />
          </div>

          {/* Banner with upload */}
          <div className="space-y-2 rounded-2xl border border-border/40 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <ImageIcon className="size-3.5 text-primary" />
                Event Banner
              </label>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl("")}
                  className="cursor-pointer text-[10px] font-bold text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Paste an image link, or upload →"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="h-9 rounded-xl bg-background text-xs"
              />
              <button
                type="button"
                disabled={isUploadingBanner}
                onClick={() => bannerInputRef.current?.click()}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {isUploadingBanner ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                <span className="hidden sm:inline">Upload</span>
              </button>
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

            {bannerUrl && (
              <div className="mt-2 aspect-[21/9] w-full overflow-hidden rounded-xl border border-border/40 bg-muted/40">
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="h-full w-full object-cover"
                  onError={() => toast.error("That image link could not be loaded")}
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── 2. Category & Format ─── */}
        <section className="space-y-4 border-t border-border/40 pt-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            2. Category & Format
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">Category</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EVENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setEventType(t.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl px-3 py-2 text-xs font-black transition-all active:scale-95",
                    eventType === t.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Event Mode</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {MODES.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl px-3 py-2 text-xs font-black transition-all active:scale-95",
                    mode === m.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {needsVenue && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Venue
                </label>
                <Input
                  placeholder="e.g. Cat Hall, BIT Mesra"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="mt-1 h-10 rounded-2xl text-xs"
                />
              </div>
            )}
            {needsLink && (
              <div>
                <label className="text-xs font-bold text-foreground">Online Link (Meet / Discord)</label>
                <Input
                  placeholder="https://meet.google.com/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="mt-1 h-10 rounded-2xl text-xs"
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── 3. Schedule ─── */}
        <section className="space-y-4 border-t border-border/40 pt-5">
          <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <Calendar className="size-3.5" />
            3. Date & Registration Window
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">
                Starts <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 h-10 rounded-2xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">
                Ends <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                required
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 h-10 rounded-2xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Registrations Close (optional)</label>
            <Input
              type="datetime-local"
              max={startDate || undefined}
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="mt-1 h-10 rounded-2xl text-xs"
            />
            <p className="mt-1 px-1 text-[10px] text-muted-foreground">
              Leave blank to keep registrations open until the event starts.
            </p>
          </div>
        </section>

        {/* ─── 4. Participation ─── */}
        <section className="space-y-4 border-t border-border/40 pt-5">
          <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <Users className="size-3.5" />
            4. Participation
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">How can students join?</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {PARTICIPATION_TYPES.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setParticipationType(p.id)}
                  className={cn(
                    "cursor-pointer rounded-2xl px-3 py-2 text-xs font-black transition-all active:scale-95",
                    participationType === p.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {isTeamEvent && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Min Team Size</label>
                <Input
                  type="number"
                  min={1}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(e.target.value)}
                  className="mt-1 h-10 rounded-2xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Max Team Size</label>
                <Input
                  type="number"
                  min={1}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(e.target.value)}
                  className="mt-1 h-10 rounded-2xl text-xs"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">Participant Cap (optional)</label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 200"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="mt-1 h-10 rounded-2xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground">Loop Points Reward</label>
              <Input
                type="number"
                min={0}
                max={200}
                value={loopPointsReward}
                onChange={(e) => setLoopPointsReward(e.target.value)}
                className="mt-1 h-10 rounded-2xl text-xs"
              />
            </div>
          </div>

          {/* Entry fee */}
          <div className="space-y-2.5 rounded-2xl border border-border/40 bg-muted/20 p-3.5">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-xs font-bold text-foreground">Paid entry?</span>
              <button
                type="button"
                onClick={() => setIsPaid((p) => !p)}
                className={cn(
                  "relative h-6 w-11 cursor-pointer rounded-full transition-colors",
                  isPaid ? "bg-primary" : "bg-muted-foreground/30"
                )}
                aria-pressed={isPaid}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform",
                    isPaid ? "translate-x-5.5" : "translate-x-0.5"
                  )}
                />
              </button>
            </label>
            {isPaid && (
              <Input
                placeholder="e.g. ₹150 per team"
                value={entryFee === "Free" ? "" : entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                className="h-9 rounded-xl bg-background text-xs"
              />
            )}
          </div>

          {/* Audience */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: true, label: "Open to all colleges" },
              { value: false, label: "My campus only" },
            ].map((opt) => (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => setIsAllColleges(opt.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-black transition-all active:scale-95",
                  isAllColleges === opt.value
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border border-border/40 bg-muted/30 text-muted-foreground hover:text-foreground"
                )}
              >
                {isAllColleges === opt.value && <Check className="size-3.5" />}
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* ─── 5. Prizes & Perks ─── */}
        <section className="space-y-4 border-t border-border/40 pt-5">
          <h2 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
            <Trophy className="size-3.5" />
            5. Prizes & Perks
          </h2>

          <div>
            <label className="text-xs font-bold text-foreground">Prize Pool</label>
            <Input
              placeholder="e.g. ₹1,50,000 Cash Pool + Cloud Credits + Swag Kits"
              value={prizesDescription}
              onChange={(e) => setPrizesDescription(e.target.value)}
              className="mt-1 h-10 rounded-2xl text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground">Perks</label>

            {perks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {perks.map((perk) => (
                  <span
                    key={perk}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary"
                  >
                    {perk}
                    <button
                      type="button"
                      onClick={() => togglePerk(perk)}
                      className="cursor-pointer opacity-60 hover:opacity-100"
                      aria-label={`Remove ${perk}`}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_PERKS.filter((p) => !perks.includes(p)).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => togglePerk(p)}
                  className="cursor-pointer rounded-full border border-border/40 bg-muted/40 px-2.5 py-1 text-[11px] font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  + {p}
                </button>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Add a custom perk"
                value={perkInput}
                onChange={(e) => setPerkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPerk(e);
                }}
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>
        </section>

        {/* ─── 6. Description ─── */}
        <section className="space-y-3 border-t border-border/40 pt-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              6. Full Description & Rules <span className="text-red-500">*</span>
            </h2>
            {!description.trim() && (
              <button
                type="button"
                onClick={() => setDescription(DESCRIPTION_TEMPLATE)}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary hover:bg-primary/20"
              >
                <Sparkles className="size-3" />
                Use template
              </button>
            )}
          </div>

          <MarkdownEditor
            value={description}
            onChange={setDescription}
            required
            rows={16}
            stickyTopClass="top-14"
            placeholder="Describe the tracks, schedule, rules and judging criteria. Markdown works — headings, lists, code and images."
          />
        </section>

        {/* ─── Submit ─── */}
        <div className="flex gap-2 border-t border-border/40 pt-5">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => submit("DRAFT")}
            className="h-11 flex-1 cursor-pointer gap-1.5 rounded-full text-sm font-black"
          >
            <Save className="size-4" />
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 flex-[2] cursor-pointer rounded-full bg-primary text-sm font-black text-primary-foreground shadow-md hover:opacity-90"
          >
            {isSubmitting ? "Publishing..." : "Publish Campus Event 🚀"}
          </Button>
        </div>
      </form>
    </div>
  );
}
