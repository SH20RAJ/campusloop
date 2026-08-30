"use client";

interface SpotifyEmbedProps {
  embedUrl: string;
}

export function SpotifyEmbed({ embedUrl }: SpotifyEmbedProps) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-xs"
      onClick={(e) => e.stopPropagation()}
    >
      <iframe
        src={embedUrl}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-2xl"
      />
    </div>
  );
}
