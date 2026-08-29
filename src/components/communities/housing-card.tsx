"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { HousingListing } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
  Check,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface HousingCardProps {
  item: HousingListing & {
    author: {
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

export function HousingCard({ item }: HousingCardProps) {
  const avatar = getAvatarUrl(item.author.avatarUrl, item.author.username);
  const amenities: string[] = item.amenities ? JSON.parse(item.amenities) : [];
  const images: string[] = item.images ? JSON.parse(item.images) : [];

  function handleContact() {
    sounds.tap();
    haptics.light();
    if (item.contactInfo) {
      navigator.clipboard.writeText(item.contactInfo);
      toast.success(`Owner contact copied: ${item.contactInfo} 📋`);
    } else {
      toast.info(`Message @${item.author.username} on CampusLoop`);
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    sounds.tap();
    haptics.light();

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://campusloop.space";
    const shareUrl = `${baseUrl}/app/housing?id=${item.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: item.title,
          text: `Check out this PG / Flat near campus: ${item.title} (₹${item.rentPerMonth}/mo)`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Housing listing link copied! 📋");
    }
  }

  return (
    <div className="p-4 border-b border-border/20 hover:bg-muted/[0.08] transition-colors select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/@${item.author.username}`} className="shrink-0">
            <Avatar className="size-9 rounded-full border border-border/50">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs font-bold">
                {item.author.displayName[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <Link
                href={`/@${item.author.username}`}
                className="text-xs font-bold text-foreground hover:underline truncate"
              >
                {item.author.displayName}
              </Link>
              {(item.author.points || 0) >= 150 && (
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">
                @{item.author.username}
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

        {/* Rent Pill & Share Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-2xs">
            ₹{item.rentPerMonth.toLocaleString("en-IN")} / mo
          </span>

          <button
            type="button"
            onClick={handleShare}
            className="size-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Share or Copy Link"
          >
            <Share2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5">
        {images.length > 0 && (
          <div className="size-24 sm:size-28 rounded-2xl overflow-hidden border border-border/40 shrink-0 bg-muted/20">
            <img
              src={images[0]}
              alt={item.title}
              className="size-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-sm font-bold text-foreground leading-snug">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Location & Distance */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="size-3 text-rose-500 shrink-0" />
              <span>{item.location}</span>
            </div>
            {item.distanceFromCampus && (
              <div className="flex items-center gap-1 font-semibold text-foreground/80">
                <span>•</span>
                <span>{item.distanceFromCampus}</span>
              </div>
            )}
          </div>

          {/* Preference & Occupancy */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/50 text-foreground/80">
              {item.occupancyType.replace("_", " ")}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/50 text-foreground/80">
              {item.genderPreference.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Amenities Chips */}
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-3">
          {amenities.map((am) => (
            <span
              key={am}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-muted/30 text-muted-foreground border border-border/30"
            >
              <Check className="size-2.5 text-emerald-500" />
              <span>{am}</span>
            </span>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/15 mt-3">
        <button
          type="button"
          onClick={handleContact}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer active:scale-95"
        >
          <MessageCircle className="size-3.5" />
          <span>Contact Flatmate / Landlord</span>
        </button>
      </div>
    </div>
  );
}
