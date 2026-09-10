"use client";

import {
  BookOpen,
  Camera,
  Check,
  Code2,
  ExternalLink,
  Flame,
  Laptop,
  Mic,
  Music,
  School,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { pingUnsplashDownload, useUnsplashSearch } from "@/hooks/use-unsplash";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import type { UnsplashPhoto } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

export interface SelectedUnsplashPhoto {
  url: string;
  thumbUrl: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
}

interface UnsplashImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: SelectedUnsplashPhoto) => void;
  defaultQuery?: string;
  orientation?: "landscape" | "portrait" | "squarish" | "all";
  title?: string;
}

const POPULAR_TOPICS = [
  { id: "hackathon", label: "Hackathon", icon: Code2 },
  { id: "college fest", label: "Campus Fest", icon: Sparkles },
  { id: "coding developer", label: "Coding", icon: Laptop },
  { id: "tech workshop", label: "Workshop", icon: BookOpen },
  { id: "university campus", label: "Campus", icon: School },
  { id: "college party concert", label: "Party & Music", icon: Music },
  { id: "esports gaming", label: "Esports", icon: Flame },
  { id: "conference seminar", label: "Seminar", icon: Mic },
];

export function UnsplashImagePicker({
  isOpen,
  onClose,
  onSelect,
  defaultQuery = "hackathon",
  orientation = "landscape",
  title = "Choose High-Res Cover from Unsplash",
}: UnsplashImagePickerProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [activeTopic, setActiveTopic] = useState<string>(defaultQuery);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const { photos, isLoading } = useUnsplashSearch({
    query: query || "campus",
    orientation,
    perPage: 16,
    enabled: isOpen,
  });

  function handleTopicClick(topic: string) {
    sounds.tap();
    haptics.light();
    setActiveTopic(topic);
    setQuery(topic);
  }

  function handlePhotoSelect(photo: UnsplashPhoto) {
    sounds.pop();
    haptics.medium();
    setSelectedPhotoId(photo.id);

    // Track download ping per Unsplash API terms
    if (photo.downloadLocation) {
      void pingUnsplashDownload(photo.downloadLocation);
    }

    onSelect({
      url: photo.url,
      thumbUrl: photo.thumbUrl,
      alt: photo.alt,
      photographerName: photo.photographerName,
      photographerUrl: photo.photographerUrl,
    });

    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl p-4 sm:p-6 border-border/40 bg-background/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Camera className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-black tracking-tight text-foreground">
                  {title}
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Search millions of free, high-resolution campus photos
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search hackathons, festivals, workshops, college libraries..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveTopic("");
              }}
              className="h-10 pl-9.5 pr-8 rounded-2xl text-xs bg-muted/30 border-border/40 focus:bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveTopic("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                title="Clear"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Preset Topic Pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
            {POPULAR_TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = activeTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleTopicClick(topic.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 border",
                    isSelected
                      ? "bg-foreground text-background border-foreground font-black shadow-xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground border-border/40"
                  )}
                >
                  <Icon className="size-3" />
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>

          {/* Photos Grid */}
          <div className="min-h-[280px]">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl bg-muted/40 animate-pulse border border-border/30",
                      orientation === "portrait" ? "aspect-9/16" : "aspect-16/9"
                    )}
                  />
                ))}
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {photos.map((photo) => {
                  const isSelected = selectedPhotoId === photo.id;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handlePhotoSelect(photo)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border text-left transition-all cursor-pointer",
                        orientation === "portrait" ? "aspect-9/16" : "aspect-16/9",
                        isSelected
                          ? "border-primary ring-2 ring-primary/40 shadow-md scale-[0.98]"
                          : "border-border/40 hover:border-primary/60 hover:shadow-xs"
                      )}
                    >
                      <img
                        src={photo.thumbUrl}
                        alt={photo.alt}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Gradient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                      {/* Photographer attribution */}
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white/90">
                        <span className="truncate font-semibold drop-shadow-xs">
                          {photo.photographerName}
                        </span>
                        {isSelected && (
                          <span className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Check className="size-2.5 stroke-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                <Camera className="size-8 opacity-40" />
                <p className="text-xs font-bold">No photos found for &quot;{query}&quot;</p>
                <button
                  type="button"
                  onClick={() => handleTopicClick("hackathon")}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Reset to Hackathon photos
                </button>
              </div>
            )}
          </div>

          {/* Unsplash Attribution Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30 text-[11px] text-muted-foreground">
            <span className="font-medium">1-tap to select cover photo</span>
            <a
              href="https://unsplash.com/?utm_source=campusloop&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors"
            >
              <span>Photos by Unsplash</span>
              <ExternalLink className="size-2.5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
