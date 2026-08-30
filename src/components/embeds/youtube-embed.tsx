"use client";

import { Play, Youtube } from "lucide-react";
import { useState } from "react";

interface YouTubeEmbedProps {
  videoId: string;
  rawUrl: string;
}

export function YouTubeEmbed({ videoId, rawUrl }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/40 bg-black/5 dark:bg-black/40 shadow-xs"
      onClick={(e) => e.stopPropagation()}
    >
      {isPlaying ? (
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0 rounded-2xl"
          />
        </div>
      ) : (
        <div
          onClick={() => setIsPlaying(true)}
          className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-muted/40"
        >
          <img
            src={thumbnailUrl}
            alt="YouTube Video Thumbnail"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xl backdrop-blur-xs transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
              <Play className="ml-1 size-6 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              <Youtube className="size-3.5 text-red-500" />
              YouTube Video
            </span>
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white/90 hover:text-white backdrop-blur-md hover:underline"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
