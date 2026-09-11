"use client";

import { Globe, School, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { AnimateCalendar, AnimateCheck, AnimateUsers } from "@/components/ui/animated-icon";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { AddToCalendarDropdown } from "./add-to-calendar-dropdown";

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  bannerUrl: string | null;
  clubName: string;
  organizer?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  institution?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  eligibleInstitutionIds: string[];
  eventType: string;
  mode: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  participationType: string;
  entryFee: string;
  prizesDescription: string | null;
  perks: string[];
  loopPointsReward: number;
  attendeeCount: number;
  isRegistered: boolean;
  reminderSet: boolean;
}

interface EventCardProps {
  event: EventItem;
  variant?: "row" | "grid";
}

export function EventCard({ event, variant = "row" }: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(event.isRegistered);
  const [attendeeCount, setAttendeeCount] = useState(event.attendeeCount);
  const [isMutating, setIsMutating] = useState(false);

  const startDate = new Date(event.startDate);
  const dateStr = startDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isRestricted =
    Array.isArray(event.eligibleInstitutionIds) && !event.eligibleInstitutionIds.includes("ALL");

  // Calculate registration deadline status
  const deadlineDate = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const now = new Date();
  let deadlineText = "";
  let isUrgentDeadline = false;
  if (deadlineDate) {
    const diffMs = deadlineDate.getTime() - now.getTime();
    if (diffMs <= 0) {
      deadlineText = "Registration closed";
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays >= 1) {
        deadlineText = `${diffDays}d ${diffHours % 24}h left`;
      } else {
        deadlineText = `${diffHours}h left`;
        isUrgentDeadline = true;
      }
    }
  }

  async function handleQuickRegister(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isMutating || isRegistered) return;

    setIsMutating(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationType: "SOLO" }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }

      sounds.pop();
      haptics.medium();
      setIsRegistered(true);
      setAttendeeCount((prev) => prev + 1);
      toast.success("Registered for event! +25 Loop Points");
      mutate("/api/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsMutating(false);
    }
  }

  if (variant === "grid") {
    return (
      <Link
        href={`/app/events/${event.slug || event.id}`}
        className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/40 bg-card/75 hover:bg-muted/30 p-3 sm:p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
      >
        <div className="space-y-2.5 sm:space-y-3">
          {/* Banner with Mode & Deadline */}
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-muted/40">
            {event.bannerUrl ? (
              <img
                src={event.bannerUrl}
                alt={event.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/60">
                <AnimateCalendar size={32} className="text-muted-foreground/60" />
              </div>
            )}

            {/* Mode Tag */}
            <div className="absolute top-2 left-2 rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
              {event.mode}
            </div>

            {/* Event Type */}
            <div className="absolute top-2 right-2 rounded-md bg-primary/90 text-primary-foreground backdrop-blur-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
              {event.eventType}
            </div>

            {deadlineText && (
              <div
                className={cn(
                  "absolute bottom-2 left-2 right-2 rounded-lg px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-center backdrop-blur-md truncate shadow-xs",
                  isUrgentDeadline
                    ? "bg-red-500/90 text-white animate-pulse"
                    : "bg-black/80 text-amber-300 border border-amber-500/30"
                )}
              >
                {deadlineText}
              </div>
            )}
          </div>

          {/* Club & Eligibility */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-bold text-foreground truncate text-[11px] sm:text-xs">
              {event.clubName}
            </span>
            {isRestricted ? (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                <School className="size-3" />
                Campus
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-muted-foreground shrink-0">
                <Globe className="size-3" />
                All India
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
              {event.title}
            </h3>
            {event.tagline && (
              <p className="line-clamp-1 sm:line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {event.tagline}
              </p>
            )}
          </div>

          {/* Badges / Perks */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {event.prizesDescription && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] font-black">
                <Trophy className="size-3 shrink-0" />
                <span className="truncate max-w-[150px]">{event.prizesDescription}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-[10px] sm:text-[11px] font-medium">
              <AnimateCalendar size={12} />
              <span>{dateStr}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-[10px] sm:text-[11px] font-medium">
              <AnimateUsers size={12} />
              <span>
                {event.participationType === "TEAM"
                  ? "Team"
                  : event.participationType === "BOTH"
                    ? "Solo/Team"
                    : "Individual"}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] sm:text-[11px] font-black">
              <span>+{event.loopPointsReward || 25} LP</span>
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between border-t border-border/20 pt-3 mt-auto">
          <div className="text-xs">
            <span className="font-black text-foreground">{event.entryFee || "Free"}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground ml-1.5">
              • {attendeeCount} going
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <AddToCalendarDropdown
              event={{
                id: event.id,
                title: event.title,
                description: event.description,
                venue: event.venue,
                mode: event.mode,
                startDate: event.startDate,
                endDate: event.endDate,
                slug: event.slug,
                clubName: event.clubName,
              }}
              variant="button"
            />

            <button
              type="button"
              onClick={event.participationType === "TEAM" ? undefined : handleQuickRegister}
              disabled={isMutating || isRegistered}
              className={cn(
                "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 sm:px-3.5 text-xs font-black transition-all active:scale-95",
                isRegistered
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-2xs"
              )}
            >
              {isRegistered ? (
                <>
                  <AnimateCheck size={14} />
                  Registered
                </>
              ) : event.participationType === "TEAM" ? (
                "Form Team"
              ) : (
                "Register"
              )}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/app/events/${event.slug || event.id}`}
      className="group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-border/40 bg-card/60 hover:bg-muted/30 transition-all hover:border-border/80 hover:shadow-xs"
    >
      {/* Compact Thumbnail with Mode Badge */}
      <div className="relative size-22 sm:size-30 shrink-0 overflow-hidden rounded-xl bg-muted/40 aspect-square">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <AnimateCalendar size={28} className="text-muted-foreground/60" />
          </div>
        )}

        {/* Mode Tag */}
        <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 backdrop-blur-md px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider">
          {event.mode}
        </div>

        {deadlineText && (
          <div
            className={cn(
              "absolute bottom-1.5 left-1.5 right-1.5 rounded-md px-1.5 py-0.2 text-[9px] font-black text-center backdrop-blur-md truncate",
              isUrgentDeadline ? "bg-red-500/90 text-white animate-pulse" : "bg-black/75 text-amber-300"
            )}
          >
            {deadlineText}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 sm:gap-2 self-stretch">
        <div>
          {/* Club & Eligibility */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
              {event.clubName}
            </span>
            <span aria-hidden className="opacity-40">
              ·
            </span>
            <span className="capitalize font-semibold text-primary">{event.eventType.toLowerCase()}</span>
            <span aria-hidden className="opacity-40">
              ·
            </span>
            {isRestricted ? (
              <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-medium">
                <School className="size-2.5" />
                Campus
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 font-medium">
                <Globe className="size-2.5" />
                All India
              </span>
            )}
          </div>

          <h3 className="mt-0.5 text-sm sm:text-base font-black leading-snug text-foreground transition-colors group-hover:text-primary line-clamp-2">
            {event.title}
          </h3>

          {event.tagline && (
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
              {event.tagline}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {event.prizesDescription && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] sm:text-[11px] font-black">
              <Trophy className="size-3 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{event.prizesDescription}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-[10px] sm:text-[11px] font-medium">
            <AnimateCalendar size={12} />
            <span>{dateStr}</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-xs font-medium">
            <AnimateUsers size={12} />
            <span>
              {event.participationType === "TEAM"
                ? "Team Event"
                : event.participationType === "BOTH"
                  ? "Solo / Team"
                  : "Individual"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] sm:text-xs font-black">
            <span>+{event.loopPointsReward || 25} LP</span>
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/20 pt-2 mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{event.entryFee || "Free"}</span>
            <span aria-hidden>·</span>
            <span className="text-[10px] sm:text-[11px]">{attendeeCount} enrolled</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <AddToCalendarDropdown
              event={{
                id: event.id,
                title: event.title,
                description: event.description,
                venue: event.venue,
                mode: event.mode,
                startDate: event.startDate,
                endDate: event.endDate,
                slug: event.slug,
                clubName: event.clubName,
              }}
              variant="button"
            />

            <button
              type="button"
              onClick={event.participationType === "TEAM" ? undefined : handleQuickRegister}
              disabled={isMutating || isRegistered}
              className={cn(
                "flex h-7.5 sm:h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 sm:px-4 text-xs font-black transition-all active:scale-95",
                isRegistered
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-2xs"
              )}
            >
              {isRegistered ? (
                <>
                  <AnimateCheck size={14} />
                  Registered
                </>
              ) : event.participationType === "TEAM" ? (
                "Form Team"
              ) : (
                "Register"
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
