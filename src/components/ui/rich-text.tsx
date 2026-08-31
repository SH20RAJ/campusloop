"use client";

import { ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PostEmbedRenderer } from "@/components/embeds/post-embed-renderer";

interface RichTextProps {
  content: string;
  className?: string;
  disableEmbeds?: boolean;
  onImageClick?: (url: string) => void;
}

export function RichText({ content, className = "", disableEmbeds = false, onImageClick }: RichTextProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  if (!content) return null;

  // Regular expression to match markdown images: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;

  // Extract all markdown images
  const images: { alt: string; url: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({ alt: match[1] || "Attached image", url: match[2] });
  }

  // Text with markdown images removed
  const textWithoutMdImages = content.replace(imageRegex, "").trim();

  function handleOpenImage(e: React.MouseEvent, url: string) {
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent && (e.nativeEvent as MouseEvent).stopImmediatePropagation) {
      (e.nativeEvent as MouseEvent).stopImmediatePropagation();
    }
    if (onImageClick) {
      onImageClick(url);
    } else {
      setSelectedImage(url);
    }
  }

  // Helper to parse links, hashtags, and mentions in remaining text
  function parseText(text: string) {
    // Regex for:
    // 1. Markdown link: [text](url)
    // 2. Bare URL: https?://...
    // 3. Hashtag: #tag
    // 4. Mention: @username
    const tokenRegex =
      /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_\-.]+)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let tokenMatch: RegExpExecArray | null;

    while ((tokenMatch = tokenRegex.exec(text)) !== null) {
      // Add preceding plain text
      if (tokenMatch.index > lastIndex) {
        parts.push(text.substring(lastIndex, tokenMatch.index));
      }

      const raw = tokenMatch[0];

      if (raw.startsWith("[") && tokenMatch[2] && tokenMatch[3]) {
        // Markdown Link
        parts.push(
          <a
            key={`link-${tokenMatch.index}`}
            href={tokenMatch[3]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            {tokenMatch[2]}
            <ExternalLink className="size-3 inline opacity-70" />
          </a>
        );
      } else if (raw.startsWith("http://") || raw.startsWith("https://")) {
        // Bare URL: Check if it's a standalone image URL
        const isImageUrl = /\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i.test(raw);
        if (isImageUrl) {
          parts.push(
            <div
              key={`img-bare-${tokenMatch.index}`}
              className="my-2 block no-card-nav"
              data-no-nav="true"
              onClick={(e) => handleOpenImage(e, raw)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <img
                src={raw}
                alt="Shared media"
                data-no-nav="true"
                className="max-h-72 max-w-full rounded-2xl object-cover border border-border shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                loading="lazy"
              />
            </div>
          );
        } else {
          parts.push(
            <a
              key={`url-${tokenMatch.index}`}
              href={raw}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-primary font-semibold hover:underline break-all"
            >
              {raw.length > 40 ? `${raw.slice(0, 37)}...` : raw}
            </a>
          );
        }
      } else if (raw.startsWith("#")) {
        // Hashtag
        const tag = raw.slice(1);
        parts.push(
          <Link
            key={`tag-${tokenMatch.index}`}
            href={`/app/hashtag/${tag}`}
            onClick={(e) => e.stopPropagation()}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            {raw}
          </Link>
        );
      } else if (raw.startsWith("@")) {
        // Mention
        const username = raw.slice(1);
        parts.push(
          <Link
            key={`mention-${tokenMatch.index}`}
            href={`/@${username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            {raw}
          </Link>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  }

  return (
    <div className={`space-y-2 leading-relaxed ${className}`}>
      {/* Render Text */}
      {textWithoutMdImages && (
        <div className="whitespace-pre-wrap break-words">{parseText(textWithoutMdImages)}</div>
      )}

      {/* Render Markdown Images / Instagram-Style Multi-Image Carousel */}
      {images.length > 0 && (
        <ImageCarousel
          images={images}
          onOpenImage={handleOpenImage}
        />
      )}

      {/* Rich Embeds (YouTube, Spotify, User Profiles, Communities, Events, Web Previews) */}
      {!disableEmbeds && <PostEmbedRenderer content={content} />}

      {/* Portal-Mounted Fullscreen Lightbox Modal */}
      {mounted &&
        selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-in fade-in duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedImage(null);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div
              className="w-full max-w-4xl flex items-center justify-between px-2 pt-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs font-semibold text-white/60">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  title="Open full resolution"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                  className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Close image preview"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Centered Image */}
            <div
              className="flex-1 flex items-center justify-center w-full max-w-5xl overflow-hidden py-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <img
                src={selectedImage}
                alt="Expanded view"
                className="max-h-[85vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl transition-transform"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Bottom Dismiss Hint */}
            <div className="pb-2 text-center text-xs text-white/50" onClick={(e) => e.stopPropagation()}>
              Tap anywhere outside image to close · Press Esc
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

interface ImageCarouselProps {
  images: { alt: string; url: string }[];
  onOpenImage: (e: React.MouseEvent, url: string) => void;
}

function ImageCarousel({ images, onOpenImage }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (images.length === 1) {
    const single = images[0];
    return (
      <div
        className="relative group rounded-2xl overflow-hidden border border-border/80 bg-muted/20 shadow-xs max-w-lg cursor-pointer no-card-nav"
        data-no-nav="true"
        onClick={(e) => onOpenImage(e, single.url)}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <img
          src={single.url}
          alt={single.alt}
          data-no-nav="true"
          className="w-full max-h-96 object-cover group-hover:scale-[1.01] transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
            <ZoomIn className="size-4" />
          </span>
        </div>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    } else if (diff < -40) {
      setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-border/80 bg-black/5 dark:bg-muted/10 shadow-xs max-w-lg select-none no-card-nav group"
      data-no-nav="true"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Slide */}
      <div
        className="relative w-full aspect-4/3 sm:aspect-16/10 cursor-pointer overflow-hidden flex items-center justify-center bg-black/20"
        onClick={(e) => onOpenImage(e, images[currentIndex].url)}
      >
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          data-no-nav="true"
          className="w-full h-full object-contain transition-all duration-300"
          loading="lazy"
        />

        {/* Zoom Hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
            <ZoomIn className="size-4" />
          </span>
        </div>
      </div>

      {/* Instagram-Style Counter Badge */}
      <div className="absolute top-3 right-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-black text-white backdrop-blur-md shadow-xs pointer-events-none">
        {currentIndex + 1}/{images.length}
      </div>

      {/* Previous Button */}
      <button
        type="button"
        aria-label="Previous image"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 text-white p-1.5 backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Next Button */}
      <button
        type="button"
        aria-label="Next image"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/75 text-white p-1.5 backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Instagram-Style Dot Indicators */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-xs pointer-events-none">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`transition-all rounded-full ${
              idx === currentIndex
                ? "size-1.5 bg-white scale-125"
                : "size-1 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
