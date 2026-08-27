"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { MarketplaceItem } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
CheckCircle2,
Home,
MessageCircle,
ShieldCheck,
Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface MarketplaceCardProps {
  item: MarketplaceItem & {
    seller: {
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

export function MarketplaceCard({ item, currentUserId }: MarketplaceCardProps) {
  const router = useRouter();
  const [sold, setSold] = useState(item.isSold);
  const isOwner = currentUserId === item.sellerId;

  const avatar = getAvatarUrl(item.seller.avatarUrl, item.seller.username);
  const images: string[] = item.images ? JSON.parse(item.images) : [];

  function handleChatSeller() {
    sounds.tap();
    haptics.light();
    router.push(`/app/chat`);
    toast.info(`Opening chat with @${item.seller.username}`);
  }

  function handleToggleSold() {
    sounds.ting();
    haptics.success();
    setSold(!sold);
    toast.success(sold ? "Listing marked as available" : "Marked as SOLD! 🎉");
  }

  return (
    <div className="p-4 border-b border-border/20 hover:bg-muted/[0.08] transition-colors select-none">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href={`/@${item.seller.username}`} className="shrink-0">
            <Avatar className="size-9 rounded-full border border-border/50">
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-xs font-bold">
                {item.seller.displayName[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <Link
                href={`/@${item.seller.username}`}
                className="text-xs font-bold text-foreground hover:underline truncate"
              >
                {item.seller.displayName}
              </Link>
              {(item.seller.points || 0) >= 150 && (
                <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
              )}
              <span className="text-[11px] text-muted-foreground truncate">
                @{item.seller.username}
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

        {/* Condition & Sold Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs",
              sold
                ? "bg-muted text-muted-foreground border-border/50"
                : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
            )}
          >
            {sold ? "Sold Out" : item.condition.replace("_", " ")}
          </span>
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
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-foreground">
              ₹{item.price.toLocaleString("en-IN")}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-muted-foreground/60 line-through">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {item.isNegotiable && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                Negotiable
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-foreground leading-snug">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-muted-foreground/90 leading-relaxed font-normal line-clamp-2">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {item.hostelLocation && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Home className="size-3 text-primary shrink-0" />
                <span>{item.hostelLocation}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Tag className="size-3 text-emerald-500 shrink-0" />
              <span>{item.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/15 mt-3">
        <button
          type="button"
          onClick={handleChatSeller}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer active:scale-95"
        >
          <MessageCircle className="size-3.5" />
          <span>Chat with Seller</span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={handleToggleSold}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{sold ? "Mark as Available" : "Mark as Sold"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
