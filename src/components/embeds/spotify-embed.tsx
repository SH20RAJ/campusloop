"use client";

import { ExternalLink, Disc } from "lucide-react";

interface SpotifyEmbedProps {
  embedUrl: string;
  rawUrl?: string;
}

export function SpotifyEmbed({ embedUrl, rawUrl }: SpotifyEmbedProps) {
  const isMultiItem =
    embedUrl.includes("/playlist/") ||
    embedUrl.includes("/album/") ||
    embedUrl.includes("/artist/") ||
    embedUrl.includes("/show/");

  const height = isMultiItem ? 352 : 152;

  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs transition-all hover:border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border/30 bg-[#1DB954]/10 px-3.5 py-1.5 dark:bg-[#1DB954]/15">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#1DB954]">
          <Disc className="size-3.5 animate-spin-slow" />
          <span>Spotify</span>
        </div>
        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Open in Spotify</span>
            <ExternalLink className="size-3 opacity-70" />
          </a>
        )}
      </div>

      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full"
      />
    </div>
  );
}
