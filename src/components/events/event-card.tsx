"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
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

      const data = await res.json();
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
      className="group block overflow-hidden rounded-3xl border border-border/50 bg-card hover:border-border transition-all duration-200 hover:shadow-lg shadow-xs"
    >
      {/* Banner */}
      <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted/40">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-tr from-primary/20 via-primary/5 to-muted flex items-center justify-center">
            <Calendar className="size-12 text-primary/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg bg-black/75 px-2.5 py-1 text-[11px] font-black uppercase text-white backdrop-blur-md">
              {event.eventType}
            </span>
            <span className="rounded-lg bg-primary/90 px-2.5 py-1 text-[11px] font-black text-primary-foreground backdrop-blur-md">
              {event.mode}
            </span>
          </div>

          {isRestricted ? (
            <span className="rounded-lg bg-amber-500/90 text-black px-2 py-1 text-[10px] font-black backdrop-blur-md flex items-center gap-1">
              <School className="size-3" />
              Restricted
            </span>
          ) : (
            <span className="rounded-lg bg-black/60 text-white/90 px-2 py-1 text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
              <Globe className="size-3" />
              All Campuses
            </span>
          )}
        </div>

        {/* Bottom Banner Content: Club & Date */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-primary-foreground/90 drop-shadow-xs">
              {event.clubName}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold backdrop-blur-md">
              {dateStr}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-black text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          {event.tagline && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {event.tagline}
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-medium pt-1 border-t border-border/30">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{timeStr}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{event.venue?.split(",")[0] || event.mode}</span>
          </div>
        </div>

        {/* Prizes / Perks badge */}
        {event.prizesDescription && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded-xl">
            <Trophy className="size-3.5 shrink-0" />
            <span className="truncate">{event.prizesDescription}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
            <Users className="size-3.5" />
            <span>{attendeeCount} attending</span>
          </div>

          <Button
            size="sm"
            onClick={handleQuickRegister}
            disabled={isMutating || isRegistered}
            className={`h-8 px-4 text-xs font-black rounded-full transition-all cursor-pointer ${
              isRegistered
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-2xs"
            }`}
          >
            {isRegistered ? (
              <>
                <Check className="size-3.5 mr-1" />
                <span>Registered</span>
              </>
            ) : (
              <span>Register Free</span>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
