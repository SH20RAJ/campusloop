"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseHlsVideoOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  hlsUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  isActive: boolean;
  isMuted: boolean;
  loop?: boolean;
}

export function useHlsVideo({
  videoRef,
  audioRef,
  hlsUrl,
  videoUrl,
  audioUrl,
  isActive,
  isMuted,
  loop = true,
}: UseHlsVideoOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [usingHls, setUsingHls] = useState(false);
  const hlsRef = useRef<Hls | null>(null);

  // Initialize and attach video / HLS source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isSubscribed = true;
    setHasError(false);
    setIsLoading(true);

    // Teardown previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (hlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        capLevelToPlayerSize: false,
      });
      hls.autoLevelCapping = -1;

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isSubscribed) return;
        // Automatically pick the highest available resolution level (720p HD)
        if (hls.levels && hls.levels.length > 0) {
          hls.currentLevel = hls.levels.length - 1;
        }
        setIsLoading(false);
        if (isActive) {
          video.muted = isMuted;
          const p = video.play();
          if (p !== undefined) {
            p.then(() => {
              if (isSubscribed) setIsPlaying(true);
            }).catch(() => {
              // Browser policy restricted unmuted playback; fallback to muted
              video.muted = true;
              video.play().then(() => {
                if (isSubscribed) setIsPlaying(true);
              }).catch(() => {});
            });
          }
        }
      });

      let networkRetryCount = 0;
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!isSubscribed) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkRetryCount < 1) {
                networkRetryCount++;
                hls.startLoad();
              } else {
                hls.destroy();
                hlsRef.current = null;
                setUsingHls(false);
                if (videoUrl) {
                  video.src = videoUrl;
                  if (isActive) {
                    video.play().then(() => {
                      if (isSubscribed) setIsPlaying(true);
                    }).catch(() => {});
                  }
                } else {
                  setHasError(true);
                  setIsLoading(false);
                }
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              hlsRef.current = null;
              setUsingHls(false);
              if (videoUrl) {
                video.src = videoUrl;
                if (isActive) {
                  video.play().then(() => {
                    if (isSubscribed) setIsPlaying(true);
                  }).catch(() => {});
                }
              } else {
                setHasError(true);
                setIsLoading(false);
              }
              break;
          }
        }
      });

      setUsingHls(true);
    } else if (hlsUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Apple Safari HLS engine
      video.src = hlsUrl;
      setUsingHls(true);
      setIsLoading(false);
      if (isActive) {
        video.muted = isMuted;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (isSubscribed) setIsPlaying(true);
          }).catch(() => {
            video.muted = true;
            video.play().then(() => {
              if (isSubscribed) setIsPlaying(true);
            }).catch(() => {});
          });
        }
      }
    } else if (videoUrl) {
      // Standard video file or fallback
      video.src = videoUrl;
      setUsingHls(false);
      setIsLoading(false);
      if (isActive) {
        video.muted = isMuted;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (isSubscribed) setIsPlaying(true);
          }).catch(() => {
            video.muted = true;
            video.play().then(() => {
              if (isSubscribed) setIsPlaying(true);
            }).catch(() => {});
          });
        }
      }
    }

    return () => {
      isSubscribed = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, videoUrl, isActive, isMuted, videoRef]);

  // Handle active / pause state changes
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.muted = isMuted;
      video.volume = isMuted ? 0 : 1;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (!usingHls && audio && audioUrl) {
              audio.currentTime = 0;
              audio.muted = isMuted;
              audio.volume = isMuted ? 0 : 1;
              audio.play().catch(() => {});
            }
          })
          .catch(() => {
            video.muted = true;
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      if (audio) {
        audio.pause();
      }
    }
  }, [isActive, isMuted, usingHls, audioUrl, videoRef, audioRef]);

  // Synchronize muted / volume status
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (video) {
      video.muted = isMuted;
      video.volume = isMuted ? 0 : 1;
    }
    if (audio) {
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : 1;
    }
  }, [isMuted, videoRef, audioRef]);

  // Dual-track synchronization when using fallback MP4 + companion audio
  useEffect(() => {
    if (usingHls) return;
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video || !audio || !audioUrl) return;

    const handlePlay = () => {
      setIsPlaying(true);
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
    };

    const handlePause = () => {
      setIsPlaying(false);
      audio.pause();
    };

    const handleSeeking = () => {
      audio.currentTime = video.currentTime;
    };

    const handleTimeUpdate = () => {
      // Keep audio tightly in sync (within 150ms)
      if (Math.abs(audio.currentTime - video.currentTime) > 0.15) {
        audio.currentTime = video.currentTime;
      }
    };

    const handleEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [usingHls, audioUrl, loop, videoRef, audioRef]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        if (!usingHls && audio && audioUrl) {
          audio.currentTime = video.currentTime;
          audio.play().catch(() => {});
        }
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      if (!usingHls && audio) {
        audio.pause();
      }
    }
  }, [usingHls, audioUrl, videoRef, audioRef]);

  return {
    isPlaying,
    isLoading,
    hasError,
    usingHls,
    togglePlay,
  };
}
