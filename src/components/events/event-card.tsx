"use client";

import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { sounds } from "@/lib/sounds";
import { Calendar, Check, Clock, Globe, MapPin, School, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

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
    Array.isArray(event.eligibleInstitutionIds) &&
    !event.eligibleInstitutionIds.includes("ALL");

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
      className="group flex gap-3.5 px-4 py-4 transition-colors hover:bg-muted/25"
    >
      {/* Thumbnail */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted/40 sm:size-28">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <Calendar className="size-7 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Club, type and audience */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
          <span className="truncate font-bold text-foreground">{event.clubName}</span>
          <span aria-hidden>·</span>
          <span className="capitalize">{event.eventType.toLowerCase()}</span>
          {isRestricted ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <School className="size-3" />
              Campus only
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3" />
              All campuses
            </span>
          )}
        </div>

        <div>
          <h3 className="text-[15px] font-black leading-tight text-foreground transition-colors group-hover:text-primary">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {event.tagline}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {dateStr}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {timeStr}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{event.venue?.split(",")[0] || event.mode}</span>
          </span>
        </div>

        {event.prizesDescription && (
          <p className="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-600 dark:text-amber-400">
            <Trophy className="size-3.5 shrink-0" />
            <span className="truncate">{event.prizesDescription}</span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Users className="size-3.5" />
            {attendeeCount} going
          </span>

          <button
            type="button"
            onClick={handleQuickRegister}
            disabled={isMutating || isRegistered}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1 rounded-full px-4 text-xs font-black transition-all active:scale-95 disabled:cursor-default",
              isRegistered
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-foreground text-background hover:opacity-90"
            )}
          >
            {isRegistered ? (
              <>
                <Check className="size-3.5" />
                Going
              </>
            ) : (
              "Register"
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
