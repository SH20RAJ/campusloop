"use client";

import { motion } from "framer-motion";
import { Loader2, Mic, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  title?: string;
  duration?: number; // seconds
  compact?: boolean;
  isMe?: boolean;
  className?: string;
}

export function AudioPlayer({
  src,
  title = "Voice Memo",
  compact = false,
  isMe = false,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Generate deterministic wave heights for aesthetic waveform
  const waveBars = [
    35, 60, 90, 45, 75, 100, 80, 50, 65, 95, 70, 40, 85, 100, 60, 75, 90, 45, 80, 60, 40, 90, 70, 50,
  ];

  function formatTime(seconds: number) {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number.parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  }

  function cycleRate(e: React.MouseEvent) {
    e.stopPropagation();
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setTotalDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
    };
  }, []);

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "rounded-2xl border transition-all select-none no-card-nav",
        compact
          ? isMe
            ? "bg-transparent border-transparent py-1 px-1 min-w-[210px] max-w-xs"
            : "bg-transparent border-transparent py-1 px-1 min-w-[210px] max-w-xs"
          : "bg-muted/30 border-border/50 p-3.5 max-w-md shadow-xs",
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" muted={isMuted} />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={togglePlay}
          className={cn(
            "size-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors",
            compact && isMe
              ? "bg-white text-sky-600 hover:bg-white/90"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isLoading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-4.5 fill-current" />
          ) : (
            <Play className="size-4.5 fill-current ml-0.5" />
          )}
        </motion.button>

        {/* Waveform & Scrubber Area */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {!compact && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground truncate flex items-center gap-1.5">
                <Mic className="size-3.5 text-primary shrink-0" />
                <span>{title}</span>
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
          )}

          {/* Interactive Waveform Bars & Range Track */}
          <div className="relative flex items-center h-6 cursor-pointer group">
            {/* Waveform visualizer bars */}
            <div className="absolute inset-0 flex items-center justify-between gap-[2px] pointer-events-none px-0.5">
              {waveBars.map((height, idx) => {
                const barPosition = (idx / (waveBars.length - 1)) * 100;
                const isPassed = barPosition <= progressPercent;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "w-[3px] rounded-full transition-all duration-150",
                      compact && isMe
                        ? isPassed
                          ? "bg-white"
                          : "bg-white/40"
                        : isPassed
                          ? "bg-primary"
                          : "bg-muted-foreground/30",
                      isPlaying && isPassed && "animate-pulse"
                    )}
                    style={{ height: `${Math.max(15, (height / 100) * 22)}px` }}
                  />
                );
              })}
            </div>

            {/* Invisible Range Slider for Scrubbing */}
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              aria-label="Seek audio position"
            />
          </div>

          {compact && (
            <div className="flex items-center justify-between text-[10px] font-mono opacity-80 leading-none">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          )}
        </div>

        {/* Speed / Rate Toggle Button */}
        <button
          type="button"
          onClick={cycleRate}
          className={cn(
            "text-[10px] font-black px-2 py-1 rounded-full border transition-all cursor-pointer shrink-0",
            compact && isMe
              ? "bg-white/20 border-white/40 text-white hover:bg-white/30"
              : "bg-muted/80 border-border/60 text-foreground hover:bg-muted"
          )}
          title="Playback speed"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
