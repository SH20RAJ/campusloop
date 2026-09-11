"use client";

import { AlertCircle, ExternalLink, Loader2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExternalPostInfo, ExternalPostMedia } from "@/hooks/use-feed";

interface RedditVideoProps {
  media: ExternalPostMedia;
  externalPost: ExternalPostInfo;
  className?: string;
  autoPlayInView?: boolean;
}

export function RedditVideo({
  media,
  externalPost,
  className = "",
  autoPlayInView = true,
}: RedditVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const aspectRatio = media.width && media.height ? `${media.width} / ${media.height}` : "16 / 9";
  const isVertical = Boolean(media.height && media.width && media.height > media.width);

  // Pause playback when scrolled out of view
  useEffect(() => {
    if (!autoPlayInView || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlayInView]);

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30 p-4 flex flex-col items-center justify-center text-center gap-3 select-none no-card-nav ${className}`}
        style={{ aspectRatio: isVertical ? "9 / 16" : "16 / 9", maxHeight: "540px" }}
        data-no-nav="true"
        onClick={(e) => e.stopPropagation()}
      >
        {media.thumbnailUrl && (
          <img
            src={media.thumbnailUrl}
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
          <div className="size-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <AlertCircle className="size-5" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Video format requires Reddit viewer</p>
          <a
            href={externalPost.canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
          >
            <Play className="size-3.5 fill-white" />
            <span>Watch on Reddit</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-black/90 shadow-sm max-w-xl no-card-nav group ${className}`}
      style={{
        aspectRatio,
        maxHeight: isVertical ? "580px" : "480px",
      }}
      data-no-nav="true"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none">
          <Loader2 className="size-8 text-white/80 animate-spin" />
        </div>
      )}

      <video
        ref={videoRef}
        src={media.mediaUrl}
        poster={media.thumbnailUrl || media.previewUrl || undefined}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full object-contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadedData={() => setIsLoading(false)}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
