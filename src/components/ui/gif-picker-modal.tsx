"use client";

import { Image as ImageIcon, Loader2, Search, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GifItem } from "@/app/api/gifs/search/route";
import { GIF_POPULAR_TAGS } from "@/constants";
import { cn } from "@/lib/utils";

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

export function GifPickerModal({ isOpen, onClose, onSelectGif }: GifPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("trending");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load initial trending GIFs
    fetchGifs("");
  }, [
    isOpen, // Load initial trending GIFs
    fetchGifs,
  ]);

  async function fetchGifs(query: string) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gifs/search?q=${encodeURIComponent(query)}&limit=30`);
      if (res.ok) {
        const data = (await res.json()) as { gifs: GifItem[] };
        setGifs(data.gifs || []);
      }
    } catch (err) {
      console.error("[GIF Picker] Failed to fetch GIFs:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedTag("");

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchGifs(val);
    }, 350);
  }

  function handleTagClick(tagId: string, tagQuery: string) {
    setSelectedTag(tagId);
    setSearchQuery("");
    fetchGifs(tagQuery);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[600px] max-h-[88dvh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Zap className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-foreground">Choose a GIF</h2>
              <p className="text-[10px] text-muted-foreground font-semibold">Powered by GIPHY</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border/40 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search all the GIFs on GIPHY..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-muted/40 rounded-xl border border-border/60 focus:border-primary focus:bg-background outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchGifs("");
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Tag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {GIF_POPULAR_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagClick(tag.id, tag.query)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer",
                  selectedTag === tag.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* GIFs Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-semibold">Loading reaction GIFs...</span>
            </div>
          ) : gifs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative aspect-video w-full rounded-xl overflow-hidden bg-muted/40 border border-border/40 hover:border-primary/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <img
                    src={gif.previewUrl || gif.url}
                    alt={gif.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    Select
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground space-y-1">
              <ImageIcon className="size-8 text-muted-foreground/40" />
              <p className="text-xs font-bold text-foreground">No GIFs found</p>
              <p className="text-[11px]">
                Try searching for something else like "reaction", "exam", or "crush"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
