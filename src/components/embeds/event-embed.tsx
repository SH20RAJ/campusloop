"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { Calendar, Check, Clock, MapPin, Sparkles, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

interface EventEmbedProps {
  eventId: string;
}

interface EventData {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  bannerUrl: string | null;
  clubName: string;
  eventType: string;
  mode: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  isRegistered?: boolean;
  attendeeCount?: number;
  entryFee?: string;
  prizesDescription?: string | null;
}

export function EventEmbed({ eventId }: EventEmbedProps) {
  const { data, isLoading } = useSWR<{ event: EventData }>(
    eventId ? `/api/events/${eventId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const event = data?.event;
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-3 p-3.5 rounded-2xl border border-border/40 bg-card/40 animate-pulse flex items-center gap-3">
        <div className="size-12 rounded-2xl bg-muted/60" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-muted/60 rounded-md w-40" />
          <div className="h-3 bg-muted/40 rounded-md w-28" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const userRegistered = isRegistered || event.isRegistered;

  async function handleQuickRegister(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isRegistering || userRegistered) return;

    setIsRegistering(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationType: "SOLO" }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to register");
      }

      sounds.pop();
      haptics.medium();
      setIsRegistered(true);
      toast.success("Registered for event! +25 Loop Points 🎟️");
      mutate(`/api/events/${eventId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsRegistering(false);
    }
  }

  const dateStr = new Date(event.startDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/app/events/${event.slug || event.id}`}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 block overflow-hidden rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-all shadow-xs group"
    >
      {event.bannerUrl && (
        <div className="relative aspect-[2.4/1] w-full overflow-hidden bg-muted/30">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-black uppercase text-white backdrop-blur-md">
              {event.eventType}
            </span>
            <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-black text-primary-foreground backdrop-blur-md">
              {event.mode}
            </span>
          </div>
        </div>
      )}

      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-black text-primary uppercase tracking-wide">
            {event.clubName}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>{dateStr}</span>
          </div>
        </div>

        <div>
          <h4 className="font-black text-sm text-foreground group-hover:underline line-clamp-1">
            {event.title}
          </h4>
          {event.tagline && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
              {event.tagline}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/30">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            {event.venue && (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{event.venue.split(",")[0]}</span>
              </span>
            )}
            <span>·</span>
            <span>{event.attendeeCount || 0} attending</span>
          </div>

          <Button
            size="sm"
            onClick={handleQuickRegister}
            disabled={isRegistering || userRegistered}
            className={`h-8 px-3.5 text-xs font-black rounded-full shrink-0 transition-all cursor-pointer ${
              userRegistered
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-2xs"
            }`}
          >
            {userRegistered ? (
              <>
                <Check className="size-3 mr-1" />
                <span>Registered</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
