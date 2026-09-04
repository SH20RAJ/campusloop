"use client";

import {
  CheckCircle2,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketplaceItem } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn, formatTimeAgo, getAvatarUrl } from "@/lib/utils";

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
  onDeleted?: (itemId: string) => void;
}

const CONDITION_COLORS: Record<string, { label: string; class: string }> = {
  BRAND_NEW: { label: "Brand New", class: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  LIKE_NEW: { label: "Like New", class: "bg-sky-500/15 text-sky-500 border-sky-500/30" },
  GOOD: { label: "Good Condition", class: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
  FAIR: { label: "Fair / Used", class: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

export function MarketplaceCard({ item, currentUserId, onDeleted }: MarketplaceCardProps) {
  const router = useRouter();
  const [sold, setSold] = useState(item.isSold);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isUpdatingSold, setIsUpdatingSold] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const isOwner = currentUserId === item.sellerId;
  const avatar = getAvatarUrl(item.seller.avatarUrl, item.seller.username);

  let images: string[] = [];
  try {
    if (item.images) {
      const parsed = JSON.parse(item.images);
      images = Array.isArray(parsed) ? parsed : [item.images];
    }
  } catch {
    if (item.images) images = [item.images];
  }

  const conditionInfo = CONDITION_COLORS[item.condition] || {
    label: item.condition.replace("_", " "),
    class: "bg-muted text-muted-foreground border-border/50",
  };

  const discountPercent =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
      : null;

  async function handleChatSeller() {
    if (isOwner) {
      toast.info("This is your own listing!");
      return;
    }

    sounds.tap();
    haptics.light();
    setIsStartingChat(true);

    try {
      toast.loading(`Opening chat with @${item.seller.username}...`, { id: "chat-seller" });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: item.seller.id,
          content: `Hi @${item.seller.username}, is "${item.title}" (₹${item.price.toLocaleString("en-IN")}) still available?`,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to start chat session");
      }

      const data = (await res.json()) as { id: string };
      toast.success("Direct chat opened! 💬", { id: "chat-seller" });
      router.push(`/app/chat/${data.id}`);
    } catch {
      toast.error("Could not open chat with seller. Please try again.", { id: "chat-seller" });
    } finally {
      setIsStartingChat(false);
    }
  }

  async function handleToggleSold() {
    if (!isOwner || isUpdatingSold) return;

    sounds.ting();
    haptics.light();
    setIsUpdatingSold(true);
    const nextSold = !sold;

    try {
      const res = await fetch(`/api/buy-and-sell/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSold: nextSold }),
      });

      if (!res.ok) throw new Error();
      setSold(nextSold);
      toast.success(nextSold ? "Listing marked as SOLD! 🎉" : "Listing marked as Available");
    } catch {
      toast.error("Could not update listing status");
    } finally {
      setIsUpdatingSold(false);
    }
  }

  async function handleDeleteListing() {
    if (!isOwner || isDeleting) return;
    if (!confirm("Are you sure you want to delete this listing?")) return;

    sounds.tap();
    haptics.light();
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/buy-and-sell/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Listing deleted");
      if (onDeleted) onDeleted(item.id);
      else router.refresh();
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleShare() {
    sounds.tap();
    haptics.light();
    const url = `${window.location.origin}/app/buy-and-sell?id=${item.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${item.title} — ₹${item.price.toLocaleString("en-IN")}`,
          text: `Check out this student listing on CampusLoop: ${item.title}`,
          url,
        })
        .catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url);
    toast.success("Listing link copied to clipboard! 🚀");
  }

  return (
    <>
      <div className="p-4 border-b border-border/20 hover:bg-muted/4 transition-colors select-none">
        {/* Seller Info Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href={`/@${item.seller.username}`} className="shrink-0">
              <Avatar className="size-9 rounded-full border border-border/50">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xs font-bold bg-muted text-foreground">
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
                  <ShieldCheck className="size-3.5 text-brand shrink-0" />
                )}
                <span className="text-[11px] text-muted-foreground truncate">@{item.seller.username}</span>
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

          {/* Condition & Status Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            {sold ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border/50 shadow-2xs">
                Sold Out
              </span>
            ) : (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs",
                  conditionInfo.class
                )}
              >
                {conditionInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col sm:flex-row gap-3.5">
          {/* Photo Thumbnail */}
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveImageModal(images[0])}
              className="size-24 sm:size-28 rounded-2xl overflow-hidden border border-border/40 shrink-0 bg-muted/20 relative group cursor-pointer focus:outline-none"
            >
              <img
                src={images[0]}
                alt={item.title}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {images.length > 1 && (
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white backdrop-blur-xs">
                  +{images.length - 1}
                </span>
              )}
            </button>
          )}

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Price Row */}
            <div className="flex items-baseline flex-wrap gap-2">
              <span className="text-lg font-black text-foreground">
                ₹{item.price.toLocaleString("en-IN")}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs text-muted-foreground/60 line-through">
                  ₹{item.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent && (
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {discountPercent}% OFF
                </span>
              )}
              {item.isNegotiable ? (
                <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  Negotiable
                </span>
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground/80 bg-muted/30 px-2 py-0.5 rounded-md">
                  Fixed Price
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-foreground leading-snug">{item.title}</h3>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
            )}

            {/* Meta Tags: Location & Category */}
            <div className="flex items-center flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
              {item.hostelLocation && (
                <span className="inline-flex items-center gap-1 font-medium bg-muted/40 px-2 py-0.5 rounded-md border border-border/30">
                  <MapPin className="size-3 text-rose-500 shrink-0" />
                  <span className="truncate max-w-[180px]">{item.hostelLocation}</span>
                </span>
              )}
              {item.category && (
                <span className="inline-flex items-center gap-1 font-medium bg-muted/40 px-2 py-0.5 rounded-md border border-border/30">
                  <Tag className="size-3 text-primary shrink-0" />
                  <span>{item.category}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/20">
          {!isOwner ? (
            <button
              type="button"
              onClick={handleChatSeller}
              disabled={isStartingChat || sold}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95",
                sold
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black"
              )}
            >
              {isStartingChat ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <MessageCircle className="size-3.5" />
              )}
              <span>{sold ? "Item Sold" : "Chat with Seller"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSold}
                disabled={isUpdatingSold}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer active:scale-95",
                  sold
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-muted hover:bg-muted/80 text-foreground border-border/60"
                )}
              >
                <CheckCircle2 className="size-3.5" />
                <span>{sold ? "Mark as Available" : "Mark as Sold"}</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete listing"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md transition-colors cursor-pointer"
          >
            <Share2 className="size-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Image Lightbox Preview Modal */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-xl max-h-[85vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10"
          >
            <button
              type="button"
              onClick={() => setActiveImageModal(null)}
              className="absolute top-3 right-3 z-10 size-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
            <img
              src={activeImageModal}
              alt={item.title}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
