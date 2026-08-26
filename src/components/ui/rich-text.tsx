"use client";

import { ExternalLink,X,ZoomIn } from "lucide-react";
import Link from "next/link";
import React,{ useState } from "react";

interface RichTextProps {
  content: string;
  className?: string;
  onImageClick?: (url: string) => void;
}

export function RichText({ content, className = "" }: RichTextProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!content) return null;

  // Regular expression to match markdown images: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g;

  // Extract all markdown images
  const images: { alt: string; url: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = imageRegex.exec(content)) !== null) {
    images.push({ alt: match[1] || "Attached image", url: match[2] });
  }

  // Text with markdown images removed
  const textWithoutMdImages = content.replace(imageRegex, "").trim();

  // Helper to parse links, hashtags, and mentions in remaining text
  function parseText(text: string) {
    // Regex for:
    // 1. Markdown link: [text](url)
    // 2. Bare URL: https?://...
    // 3. Hashtag: #tag
    // 4. Mention: @username
    const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|https?:\/\/[^\s]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_\-\.]+)/g;

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
            <div key={`img-bare-${tokenMatch.index}`} className="my-2 block">
              <img
                src={raw}
                alt="Shared media"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(raw);
                }}
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
        <div className="whitespace-pre-wrap break-words">
          {parseText(textWithoutMdImages)}
        </div>
      )}

      {/* Render Markdown Images */}
      {images.length > 0 && (
        <div className={`grid gap-2 pt-1 ${images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group rounded-2xl overflow-hidden border border-border/80 bg-muted/20 shadow-xs max-w-lg cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(img.url);
              }}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full max-h-80 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
                  <ZoomIn className="size-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
          <img
            src={selectedImage}
            alt="Expanded view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
