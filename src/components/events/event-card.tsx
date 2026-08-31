"use client";

import { Calendar, Check, Clock, Globe, MapPin, School, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

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
}

export function EventCard({ event }: EventCardProps) {
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
      toast.success("Registered for event! +25 Loop Points 🎟️");
      mutate("/api/events");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <Link
      href={`/app/events/${event.slug || event.id}`}
      className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border/40 bg-card/60 hover:bg-muted/30 transition-all hover:border-border/80 hover:shadow-sm"
    >
      {/* Thumbnail with Mode & Prize Badge */}
      <div className="relative aspect-16/9 sm:aspect-square sm:size-32 w-full sm:w-auto shrink-0 overflow-hidden rounded-xl bg-muted/40">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <Calendar className="size-8 text-muted-foreground/60" />
          </div>
        )}

        {/* Mode Tag */}
        <div className="absolute top-2 left-2 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
          {event.mode}
        </div>

        {deadlineText && (
          <div
            className={cn(
              "absolute bottom-2 left-2 right-2 rounded-lg px-2 py-0.5 text-[10px] font-black text-center backdrop-blur-md truncate",
              isUrgentDeadline
                ? "bg-red-500/90 text-white animate-pulse"
                : "bg-black/75 text-amber-300"
            )}
          >
            {deadlineText}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          {/* Club & Eligibility */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{event.clubName}</span>
            <span aria-hidden className="opacity-40">·</span>
            <span className="capitalize font-semibold text-primary">{event.eventType.toLowerCase()}</span>
            <span aria-hidden className="opacity-40">·</span>
            {isRestricted ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <School className="size-3" />
                Campus exclusive
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium">
                <Globe className="size-3" />
                All India
              </span>
            )}
          </div>

          <h3 className="mt-1 text-base font-black leading-tight text-foreground transition-colors group-hover:text-primary">
            {event.title}
          </h3>

          {event.tagline && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {event.tagline}
            </p>
          )}
        </div>

        {/* Highlight Stats / Badges (Unstop Style) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {event.prizesDescription && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
              <Trophy className="size-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">{event.prizesDescription}</span>
            </div>
          )}

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-xs font-medium">
            <Calendar className="size-3" />
            <span>{dateStr}, {timeStr}</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 text-muted-foreground text-xs font-medium">
            <Users className="size-3" />
            <span>
              {event.participationType === "TEAM"
                ? "Team Event"
                : event.participationType === "BOTH"
                ? "Solo / Team"
                : "Individual"}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-black">
            <span>+{event.loopPointsReward || 25} LP</span>
          </div>
        </div>

        {/* Footer info & Register CTA */}
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/30 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{attendeeCount}</span>
            <span>registered</span>
            <span aria-hidden>·</span>
            <span className="font-bold text-foreground">{event.entryFee || "Free"}</span>
          </div>

          <button
            type="button"
            onClick={event.participationType === "TEAM" ? undefined : handleQuickRegister}
            disabled={isMutating || isRegistered}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-black transition-all active:scale-95",
              isRegistered
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-2xs"
            )}
          >
            {isRegistered ? (
              <>
                <Check className="size-3.5" />
                Registered
              </>
            ) : event.participationType === "TEAM" ? (
              "View & Form Team"
            ) : (
              "Register Now"
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
