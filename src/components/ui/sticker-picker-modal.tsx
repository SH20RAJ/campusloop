"use client";

import { CAMPUS_STICKERS,CampusSticker,STICKER_CATEGORIES } from "@/constants/stickers";
import { cn } from "@/lib/utils";
import { Search,Smile,Sparkles,X } from "lucide-react";
import { useMemo,useState } from "react";

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: CampusSticker) => void;
}

export function StickerPickerModal({
  isOpen,
  onClose,
  onSelectSticker,
}: StickerPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredStickers = useMemo(() => {
    return CAMPUS_STICKERS.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.emoji && s.emoji.includes(searchQuery));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-4 shadow-2xl space-y-3.5 border border-border/30 animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Smile className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Campus Stickers</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">
                React with hostel tea, exam panic &amp; college vibes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stickers (maggi, tea, exam, 75%, pass)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/40 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:bg-background transition-all"
            autoFocus
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          {STICKER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1",
                selectedCategory === cat.id
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2.5 p-1 scrollbar-none">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => {
                onSelectSticker(sticker);
                onClose();
              }}
              className="group flex flex-col items-center justify-between p-2 rounded-2xl bg-muted/30 hover:bg-muted/70 transition-all cursor-pointer active:scale-95 text-center shadow-2xs"
            >
              <div className="relative size-16 flex items-center justify-center overflow-hidden">
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-bold text-foreground/80 group-hover:text-foreground truncate w-full mt-1.5">
                {sticker.name}
              </span>
            </button>
          ))}

          {filteredStickers.length === 0 && (
            <div className="col-span-3 py-12 text-center text-xs text-muted-foreground space-y-1">
              <Sparkles className="size-5 mx-auto text-muted-foreground/50" />
              <p className="font-bold text-foreground">No stickers match &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-[10px]">Try searching &ldquo;chai&rdquo;, &ldquo;dead&rdquo;, &ldquo;exam&rdquo;, or &ldquo;fest&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
