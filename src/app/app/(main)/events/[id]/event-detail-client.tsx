"use client";

import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Download,
  ExternalLink,
  Gift,
  MapPin,
  QrCode,
  School,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { BrandedQrModal } from "@/components/common/branded-qr-modal";
import { MarkdownContent } from "@/components/common/markdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { getAvatarUrl } from "@/lib/utils";

interface EventDetailClientProps {
  eventId: string;
}

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const { data, isLoading } = useSWR<{ event: any }>(`/api/events/${eventId}`, fetcher);

  const event = data?.event;

  const [showRegModal, setShowRegModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [regType, setRegType] = useState<"SOLO" | "TEAM">("SOLO");
  const [teamName, setTeamName] = useState("");
  const [teammates, setTeammates] = useState<Array<{ name: string; emailOrRoll: string; role: string }>>([
    { name: "", emailOrRoll: "", role: "Developer / Member" },
  ]);
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingReminder, setIsTogglingReminder] = useState(false);

  // Fetch related events
  const { data: relatedData } = useSWR<{ related: any[] }>(
    event ? `/api/events/${eventId}/related` : null,
    fetcher
  );
  const relatedEvents = relatedData?.related || [];

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 border-x border-border/40 space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-muted/40 rounded-full" />
        <div className="h-64 bg-muted/30 rounded-3xl" />
        <div className="h-10 w-3/4 bg-muted/40 rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen p-8 text-center border-x border-border/40 flex flex-col items-center justify-center space-y-3">
        <Calendar className="size-12 text-muted-foreground" />
        <h2 className="text-lg font-bold">Event Not Found</h2>
        <Button onClick={() => router.push("/app/events")} variant="outline" className="rounded-full">
          Back to Events Hub
        </Button>
      </div>
    );
  }

  const isRestricted =
    Array.isArray(event.eligibleInstitutionIds) && !event.eligibleInstitutionIds.includes("ALL");

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const startFormatted = startDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatted = `${startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${endDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

  // Google Calendar URL Generator
  function getGoogleCalendarUrl() {
    const startIso = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const details = encodeURIComponent(
      `${event.description}\n\nOrganized by: ${event.clubName}\nRegister & Details: ${window.location.href}`
    );
    const location = encodeURIComponent(event.venue || event.mode);
    const title = encodeURIComponent(event.title);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  // Download .ics file
  function downloadIcs() {
    haptics.light();
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CampusLoop//Campus Events//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.slice(0, 300)}`,
      `LOCATION:${event.venue || event.mode}`,
      `DTSTART:${startDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
      `DTEND:${endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
      `URL:${window.location.href}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.slug || "event"}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar invite (.ics) downloaded 📅");
  }

  async function handleToggleReminder() {
    if (isTogglingReminder) return;
    setIsTogglingReminder(true);
    haptics.light();

    try {
      const res = await fetch(`/api/events/${event.id}/reminder`, {
        method: "POST",
      });
      const resData = (await res.json()) as Record<string, any>;
      if (!res.ok) throw new Error(resData.error);

      if (resData.reminderSet) {
        toast.success("Timing reminder set! You'll be notified before the event ⏰");
      } else {
        toast.info("Timing reminder removed");
      }
      mutate(`/api/events/${eventId}`);
    } catch {
      toast.error("Failed to toggle reminder");
    } finally {
      setIsTogglingReminder(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (regType === "TEAM") {
      if (!teamName.trim()) {
        toast.error("Please enter your team name");
        return;
      }
      const validTeammates = teammates.filter((t) => t.name.trim());
      const totalSize = 1 + validTeammates.length; // leader + teammates
      const min = event.minTeamSize || 1;
      const max = event.maxTeamSize || 4;

      if (totalSize < min) {
        toast.error(`Team must have at least ${min} members (including you as leader).`);
        return;
      }
      if (totalSize > max) {
        toast.error(`Team cannot exceed ${max} members.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const validTeammates = teammates.filter((t) => t.name.trim());
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationType: regType,
          teamName: regType === "TEAM" ? teamName.trim() : null,
          teamMembers: regType === "TEAM" ? validTeammates : [],
          contactPhone,
        }),
      });

      const resData = (await res.json()) as Record<string, any>;
      if (!res.ok) {
        throw new Error(resData.error || "Failed to register");
      }

      sounds.pop();
      haptics.medium();
      setShowRegModal(false);
      toast.success("🎉 Registration Confirmed! +25 Loop Points added to your clout.");
      mutate(`/api/events/${eventId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleShare() {
    haptics.light();
    setShowQrModal(true);
  }

  return (
    <div className="min-h-screen pb-28 border-x border-border/40 bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQrModal(true)}
            className="h-8 px-3 rounded-full text-xs font-bold gap-1.5 cursor-pointer bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
            title="Cute QR Code Share Card"
          >
            <QrCode className="size-3.5" />
            <span>QR Code</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="h-8 px-3 rounded-full text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Share2 className="size-3.5" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Event Banner */}
      <div className="relative aspect-21/9 md:aspect-3/1 w-full overflow-hidden bg-muted/40">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-tr from-primary/20 via-primary/5 to-muted flex items-center justify-center">
            <Calendar className="size-16 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-black/75 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                {event.eventType}
              </span>
              <span className="rounded-lg bg-primary/90 px-2.5 py-0.5 text-xs font-black uppercase text-primary-foreground backdrop-blur-md">
                {event.mode}
              </span>
            </div>
            <p className="text-xs font-bold text-primary-foreground/90 uppercase tracking-wide">
              {event.clubName}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="rounded-xl bg-black/70 px-3 py-1.5 text-xs font-black backdrop-blur-md text-white">
              {event.entryFee || "Free"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
            {event.title}
          </h1>
          {event.tagline && (
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{event.tagline}</p>
          )}
        </div>

        {/* Action Panel: Register, Reminder, Add to Calendar */}
        <div className="p-4 rounded-3xl border border-border/60 bg-muted/20 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-foreground">
                  {event.isRegistered ? "You're Registered! 🎉" : "Ready to participate?"}
                </span>
                <span className="text-xs font-bold text-primary">
                  +{event.loopPointsReward || 25} LP Reward
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.attendeeCount || 0} students attending from Indian universities
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {event.isRegistered ? (
                <Button
                  disabled
                  className="h-10 px-5 rounded-full font-black text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5"
                >
                  <Check className="size-4" />
                  <span>Registered</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    haptics.medium();
                    setShowRegModal(true);
                  }}
                  className="h-10 px-6 rounded-full font-black text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-md cursor-pointer"
                >
                  Register Now
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleReminder}
                disabled={isTogglingReminder}
                className={`h-10 px-3.5 rounded-full text-xs font-bold gap-1.5 cursor-pointer ${
                  event.reminderSet
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Toggle Event Reminder"
              >
                {event.reminderSet ? (
                  <>
                    <Bell className="size-4 fill-primary text-primary" />
                    <span className="hidden sm:inline">Reminder Set</span>
                  </>
                ) : (
                  <>
                    <Bell className="size-4" />
                    <span className="hidden sm:inline">Remind Me</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Calendar Quick Add Links */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30 text-xs">
            <span className="text-muted-foreground font-semibold">Calendar:</span>
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Add to Google Calendar</span>
              <ExternalLink className="size-3" />
            </a>
            <span>·</span>
            <button
              onClick={downloadIcs}
              className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="size-3" />
              <span>Download .ics</span>
            </button>
          </div>
        </div>

        {/* Date, Time, Venue, Eligibility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl border border-border/40 bg-card flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground uppercase tracking-wide">Date & Timing</h4>
              <p className="text-xs font-bold text-foreground mt-0.5">{startFormatted}</p>
              <p className="text-xs text-muted-foreground font-medium">{timeFormatted}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/40 bg-card flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wide">Venue / Location</h4>
              <p className="text-xs font-bold text-foreground mt-0.5 truncate">{event.venue || event.mode}</p>
              {event.meetingUrl && (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>Join Online Link</span>
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/40 bg-card flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <School className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground uppercase tracking-wide">
                Campus Eligibility
              </h4>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {isRestricted ? "Restricted Campuses" : "Open to All Indian Universities"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {isRestricted
                  ? "Limited to selected student hubs"
                  : "Verified students from any college can register"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-border/40 bg-card flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground uppercase tracking-wide">
                Participation Type
              </h4>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {event.participationType === "BOTH"
                  ? "Solo or Teams"
                  : event.participationType === "TEAM"
                    ? `Teams of ${event.minTeamSize}-${event.maxTeamSize}`
                    : "Individual (Solo)"}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {event.maxParticipants
                  ? `Max capacity: ${event.maxParticipants} participants`
                  : "Unlimited spots"}
              </p>
            </div>
          </div>
        </div>

        {/* Prizes & Perks */}
        {(event.prizesDescription || (event.perks && event.perks.length > 0)) && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              Prizes & Participant Perks
            </h3>

            {event.prizesDescription && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 space-y-1">
                <span className="text-xs font-black uppercase tracking-wider">Prize Pool</span>
                <p className="text-sm font-bold">{event.prizesDescription}</p>
              </div>
            )}

            {event.perks && event.perks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.perks.map((perk: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/40 border border-border/60 text-foreground"
                  >
                    <Gift className="size-3 text-primary" />
                    <span>{perk}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Full Description */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">About the Event</h3>
          <div className="rounded-2xl border border-border/40 bg-card p-4 text-sm leading-relaxed text-foreground/90">
            <MarkdownContent content={event.description} />
          </div>
        </div>

        {/* Registered Attendees */}
        {event.registrations && event.registrations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="size-4 text-primary" />
              Recent Attendees ({event.registrations.length})
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {event.registrations.slice(0, 18).map((r: any) => {
                const avatar = getAvatarUrl(r.profile?.avatarUrl, r.profile?.username);
                return (
                  <Link
                    key={r.id}
                    href={`/@${r.profile?.username}`}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-border/40 bg-card hover:bg-muted/30 transition-all text-xs"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-[10px]">
                        {r.profile?.displayName?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-foreground">@{r.profile?.username}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Related Events (Unstop / Devpost Inspired) ─── */}
        {relatedEvents.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-tight text-foreground flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                <span>Similar Campus Events</span>
              </h2>
              <Link
                href="/app/events"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedEvents.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/app/events/${rel.slug || rel.id}`}
                  className="group block p-3 rounded-2xl border border-border/40 bg-card/60 hover:bg-muted/30 hover:border-primary/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground font-semibold">
                    <span className="truncate">{rel.clubName}</span>
                    <span className="text-primary font-black uppercase">{rel.mode}</span>
                  </div>

                  <h3 className="text-xs font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {rel.title}
                  </h3>

                  {rel.prizesDescription && (
                    <p className="text-[11px] font-bold text-amber-500 line-clamp-1">
                      🏆 {rel.prizesDescription}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[11px] text-muted-foreground">
                    <span>{new Date(rel.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    <span className="font-bold text-foreground">{rel.entryFee || "Free"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Dialog open={showRegModal} onOpenChange={setShowRegModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              Register for {event.title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
            {event.participationType === "BOTH" && (
              <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-2xl border border-border/40">
                <button
                  type="button"
                  onClick={() => setRegType("SOLO")}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
                    regType === "SOLO"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Solo (Individual)
                </button>
                <button
                  type="button"
                  onClick={() => setRegType("TEAM")}
                  className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
                    regType === "TEAM"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Team
                </button>
              </div>
            )}

            {regType === "TEAM" && (
              <div className="space-y-3 rounded-2xl border border-border/40 bg-muted/20 p-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Team Name *</label>
                    <span className="text-[10px] text-muted-foreground">
                      Size: {1 + teammates.filter((t) => t.name.trim()).length} / {event.maxTeamSize || 4} members
                    </span>
                  </div>
                  <Input
                    required
                    placeholder="e.g. CodeMonks Mesra"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mt-1 rounded-xl text-xs bg-background"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground flex items-center gap-1">
                      <Users className="size-3.5 text-primary" />
                      Teammates ({teammates.length})
                    </span>
                    {teammates.length + 1 < (event.maxTeamSize || 4) && (
                      <button
                        type="button"
                        onClick={() =>
                          setTeammates((prev) => [
                            ...prev,
                            { name: "", emailOrRoll: "", role: "Member" },
                          ])
                        }
                        className="text-[11px] font-black text-primary hover:underline cursor-pointer"
                      >
                        + Add Member
                      </button>
                    )}
                  </div>

                  {teammates.map((tm, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-border/30 bg-background/80 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Member #{idx + 2}
                        </span>
                        {teammates.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setTeammates((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-red-500 hover:text-red-600 text-[10px] font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Full Name *"
                          value={tm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeammates((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, name: val } : m))
                            );
                          }}
                          className="h-8 rounded-lg text-xs"
                        />
                        <Input
                          placeholder="College Email or Roll No"
                          value={tm.emailOrRoll}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeammates((prev) =>
                              prev.map((m, i) => (i === idx ? { ...m, emailOrRoll: val } : m))
                            );
                          }}
                          className="h-8 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-muted-foreground">
                WhatsApp / Contact Number (For updates)
              </label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-full font-black text-xs bg-primary text-primary-foreground hover:opacity-90 shadow-md cursor-pointer"
              >
                {isSubmitting ? "Confirming..." : "Confirm Registration (+25 LP)"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cute Branded QR Code Modal */}
      <BrandedQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={event.title}
        subtitle={`${event.clubName} • ${event.venue || event.mode}`}
        badgeText="Campus Event"
        shortUrl={`https://campusloop.space/e/${event.slug || event.id}`}
        category="event"
      />
    </div>
  );
}
