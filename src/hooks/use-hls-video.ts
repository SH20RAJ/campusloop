"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useRef, useState } from "react";

// Global registry of all playing/active reel video and audio elements
const activeMediaElements = new Set<HTMLMediaElement>();

/**
 * Safely pauses all currently registered reel audio/video elements
 * and any playing media across the document.
 */
export function pauseAllReelMedia() {
  activeMediaElements.forEach((el) => {
    try {
      el.pause();
    } catch {}
  });
  activeMediaElements.clear();

  if (typeof document !== "undefined") {
    const allMedia = document.querySelectorAll<HTMLMediaElement>("video, audio");
    allMedia.forEach((el) => {
      try {
        if (!el.paused) {
          el.pause();
        }
      } catch {}
    });
  }
}

function applyMediaVolume(media: HTMLMediaElement | null, muted: boolean) {
  if (!media) return;
  media.muted = muted;
  media.volume = muted ? 0 : 1;
}

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

  // Synchronous ref to prevent race conditions during async promise resolutions
  const isActiveRef = useRef(isActive);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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

        // Strictly verify active state before triggering playback
        if (isActiveRef.current) {
          video.muted = isMutedRef.current;
          const p = video.play();
          if (p !== undefined) {
            p.then(() => {
              if (isSubscribed && isActiveRef.current) {
                setIsPlaying(true);
              } else {
                video.pause();
              }
            }).catch(() => {
              if (!isActiveRef.current) return;
              // Browser policy restricted unmuted playback; fallback to muted
              video.muted = true;
              video.play().then(() => {
                if (isSubscribed && isActiveRef.current) {
                  setIsPlaying(true);
                } else {
                  video.pause();
                }
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
                  if (isActiveRef.current) {
                    video.play().then(() => {
                      if (isSubscribed && isActiveRef.current) setIsPlaying(true);
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
                if (isActiveRef.current) {
                  video.play().then(() => {
                    if (isSubscribed && isActiveRef.current) setIsPlaying(true);
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
      if (isActiveRef.current) {
        video.muted = isMutedRef.current;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (isSubscribed && isActiveRef.current) {
              setIsPlaying(true);
            } else {
              video.pause();
            }
          }).catch(() => {
            if (!isActiveRef.current) return;
            video.muted = true;
            video.play().then(() => {
              if (isSubscribed && isActiveRef.current) setIsPlaying(true);
            }).catch(() => {});
          });
        }
      }
    } else if (videoUrl) {
      // Standard video file or fallback
      video.src = videoUrl;
      setUsingHls(false);
      setIsLoading(false);
      if (isActiveRef.current) {
        video.muted = isMutedRef.current;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => {
            if (isSubscribed && isActiveRef.current) {
              setIsPlaying(true);
            } else {
              video.pause();
            }
          }).catch(() => {
            if (!isActiveRef.current) return;
            video.muted = true;
            video.play().then(() => {
              if (isSubscribed && isActiveRef.current) setIsPlaying(true);
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
  }, [hlsUrl, videoUrl, videoRef]);

  // Handle active / pause state changes and lifecycle teardown
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video) return;

    isActiveRef.current = isActive;
    isMutedRef.current = isMuted;

    if (isActive) {
      // Before playing, pause all other reel media registered across the app
      activeMediaElements.forEach((el) => {
        if (el !== video && el !== audio) {
          try {
            el.pause();
          } catch {}
        }
      });

      activeMediaElements.add(video);
      if (audio) activeMediaElements.add(audio);

      video.currentTime = 0;
      video.muted = isMuted;
      video.volume = isMuted ? 0 : 1;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Guard: if user scrolled away while play was resolving, immediately pause
            if (!isActiveRef.current) {
              video.pause();
              if (audio) {
                audio.pause();
              }
              return;
            }

            setIsPlaying(true);
            if (!usingHls && audio && audioUrl) {
              audio.currentTime = 0;
              audio.muted = isMuted;
              audio.volume = isMuted ? 0 : 1;
              audio.play().catch(() => {});
            }
          })
          .catch(() => {
            // If the user scrolled away and caused an AbortError, DO NOT retry play!
            if (!isActiveRef.current) return;

            video.muted = true;
            video.play()
              .then(() => {
                if (isActiveRef.current) setIsPlaying(true);
                else video.pause();
              })
              .catch(() => {});
          });
      }
    } else {
      // Deactivate and immediately pause both tracks
      activeMediaElements.delete(video);
      try {
        video.pause();
      } catch {}

      if (audio) {
        activeMediaElements.delete(audio);
        try {
          audio.pause();
        } catch {}
      }
      setIsPlaying(false);
    }

    return () => {
      // Unmount / effect cleanup: safely pause detached media
      if (video) {
        activeMediaElements.delete(video);
        try {
          video.pause();
        } catch {}
      }
      if (audio) {
        activeMediaElements.delete(audio);
        try {
          audio.pause();
        } catch {}
      }
      setIsPlaying(false);
    };
  }, [isActive, isMuted, usingHls, audioUrl, videoRef, audioRef]);

  // Synchronize muted / volume status
  useEffect(() => {
    applyMediaVolume(videoRef.current, isMuted);
    applyMediaVolume(audioRef?.current ?? null, isMuted);
  }, [isMuted, videoRef, audioRef]);

  // Dual-track synchronization when using fallback MP4 + companion audio
  useEffect(() => {
    if (usingHls) return;
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video || !audio || !audioUrl) return;

    const handlePlay = () => {
      if (!isActiveRef.current) {
        video.pause();
        audio.pause();
        return;
      }
      setIsPlaying(true);
      audio.currentTime = video.currentTime;
      audio.muted = isMutedRef.current;
      audio.volume = isMutedRef.current ? 0 : 1;
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
      if (!isActiveRef.current) return;
      // Keep audio tightly in sync (within 150ms)
      if (Math.abs(audio.currentTime - video.currentTime) > 0.15) {
        audio.currentTime = video.currentTime;
      }
    };

    const handleEnded = () => {
      if (!isActiveRef.current) return;
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

  // Pause playback automatically when switching tabs or minimizing browser
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      const audio = audioRef?.current;

      if (document.hidden) {
        if (video) video.pause();
        if (audio) audio.pause();
        setIsPlaying(false);
      } else if (isActiveRef.current) {
        if (video && video.paused) {
          video.play()
            .then(() => {
              if (isActiveRef.current) {
                setIsPlaying(true);
                if (!usingHls && audio && audioUrl) {
                  audio.currentTime = video.currentTime;
                  audio.play().catch(() => {});
                }
              }
            })
            .catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [usingHls, audioUrl, videoRef, audioRef]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef?.current;
    if (!video || !isActiveRef.current) return;

    if (video.paused) {
      video.play().then(() => {
        if (!isActiveRef.current) {
          video.pause();
          return;
        }
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
