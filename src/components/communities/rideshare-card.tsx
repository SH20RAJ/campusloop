"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { RidesharePool } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
ArrowRight,
Car,
Clock,
MessageCircle,
ShieldCheck,
Users
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface RideshareCardProps {
  item: RidesharePool & {
    creator: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
      points?: number | null;
    };
    institution?: { id: string; name: string; slug: string } | null;
  };
  currentUserId?: string;
}

export function RideshareCard({ item }: RideshareCardProps) {
  const [reserved, setReserved] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(item.availableSeats);

  const avatar = getAvatarUrl(item.creator.avatarUrl, item.creator.username);
  const isFull = availableSeats <= 0;

  function handleReserveSeat() {
    if (reserved) {
      sounds.tap();
      haptics.light();
      setReserved(false);
      setAvailableSeats((prev) => prev + 1);
      toast.info("Seat reservation cancelled");
    } else {
      if (isFull) {
        toast.error("No seats available for this ride!");
        return;
      }
      sounds.match();
      haptics.match();
      setReserved(true);
      setAvailableSeats((prev) => Math.max(0, prev - 1));
      toast.success("Seat reserved! Coordinate pickup with the ride creator 🚗");
    }
  }

  function handleCopyContact() {
    sounds.tap();
    haptics.light();
    if (item.contactInfo) {
      navigator.clipboard.writeText(item.contactInfo);
      toast.success(`Contact copied: ${item.contactInfo} 📋`);
    } else {
      toast.info(`Reach out to @${item.creator.username} on CampusLoop`);
    }
  }

  return (
    <div className="p-4 border-b border-border/20 hover:bg-muted/[0.08] transition-colors select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/@${item.creator.username}`} className="shrink-0">
            <Avatar className="size-9 rounded-full border border-border/50">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs font-bold">
                {item.creator.displayName[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <Link
                href={`/@${item.creator.username}`}
                className="text-xs font-bold text-foreground hover:underline truncate"
              >
                {item.creator.displayName}
              </Link>
              {(item.creator.points || 0) >= 150 && (
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">
                @{item.creator.username}
              </span>
              <span className="text-[10px] text-muted-foreground/60">·</span>
              <span className="text-[11px] text-muted-foreground/80 shrink-0">
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>
            {item.institution && (
              <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                {item.institution.name.split(",")[0]}
              </p>
            )}
          </div>
        </div>

        {/* Fare Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/15 text-sky-500 border border-sky-500/30 shadow-2xs">
            ₹{item.pricePerSeat} / seat
          </span>
        </div>
      </div>

      {/* Route Path (Origin -> Destination) */}
      <div className="rounded-2xl border border-border/40 bg-muted/20 p-3 my-2 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="truncate">{item.origin}</span>
          <ArrowRight className="size-3.5 text-sky-500 shrink-0" />
          <span className="truncate">{item.destination}</span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3 text-amber-500" />
            <span className="font-semibold">{item.departureTime}</span>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <Car className="size-3 text-sky-500" />
            <span className="uppercase">{item.vehicleType.replace("_", " ")}</span>
          </div>
        </div>
      </div>

      {item.notes && (
        <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal">
          {item.notes}
        </p>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/15 mt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Users className="size-3.5 text-muted-foreground" />
          <span className={cn(isFull ? "text-rose-500" : "text-emerald-500")}>
            {availableSeats > 0 ? `${availableSeats} Seats Left` : "Ride Full"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyContact}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy contact info"
          >
            <MessageCircle className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleReserveSeat}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95",
              reserved
                ? "bg-muted text-foreground hover:bg-muted/80"
                : isFull
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/20"
            )}
          >
            {reserved ? "Cancel Seat" : isFull ? "Full" : "Book Seat"}
          </button>
        </div>
      </div>
    </div>
  );
}
