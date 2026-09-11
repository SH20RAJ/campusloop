"use client";

import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import type { ExternalPostInfo, ExternalPostMedia } from "@/hooks/use-feed";

interface RedditGalleryProps {
  mediaList: ExternalPostMedia[];
  externalPost: ExternalPostInfo;
  className?: string;
  onImageClick?: (url: string) => void;
}

export function RedditGallery({ mediaList, externalPost, className = "", onImageClick }: RedditGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  if (!mediaList || mediaList.length === 0) return null;

  const currentItem = mediaList[currentIndex];
  const total = mediaList.length;

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
  }

  function handleImageError(idx: number) {
    setFailedIndices((prev) => new Set(prev).add(idx));
  }

  const isFailed = failedIndices.has(currentIndex);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/70 bg-black/5 dark:bg-black/40 max-w-xl no-card-nav select-none group ${className}`}
      data-no-nav="true"
      onClick={(e) => {
        if (!isFailed && onImageClick && currentItem) {
          onImageClick(currentItem.mediaUrl);
        }
      }}
    >
      {/* Current Gallery Image */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full flex items-center justify-center overflow-hidden bg-muted/20">
        {isFailed ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
            <ImageIcon className="size-8 opacity-40" />
            <span className="text-xs">Image preview not available</span>
            <a
              href={externalPost.canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-orange-500 font-bold hover:underline"
            >
              View on Reddit
            </a>
          </div>
        ) : (
          <img
            src={currentItem.mediaUrl}
            alt={`Slide ${currentIndex + 1} of ${total}`}
            className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
            onError={() => handleImageError(currentIndex)}
            loading="lazy"
          />
        )}

        {/* Counter Badge */}
        {total > 1 && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 pointer-events-none">
            {currentIndex + 1} / {total}
          </div>
        )}

        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots pagination */}
      {total > 1 && total <= 10 && (
        <div className="flex items-center justify-center gap-1.5 py-2 bg-background/60 backdrop-blur-xs border-t border-border/30">
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`size-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? "w-4 bg-orange-500"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
