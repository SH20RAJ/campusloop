"use client";

import { motion } from "framer-motion";
import { Mic, RotateCcw, Send, StopCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadMediaFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioRecorded: (url: string, duration: number) => void;
}

export function VoiceRecorderModal({ isOpen, onClose, onAudioRecorded }: VoiceRecorderModalProps) {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    audioLevel,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  async function handleStart() {
    try {
      sounds.tap();
      haptics.medium();
      await startRecording();
    } catch (err) {
      toast.error("Microphone access is required to record voice notes");
    }
  }

  async function handleStop() {
    sounds.tap();
    haptics.success();
    await stopRecording();
  }

  function handleDiscard() {
    sounds.tap();
    haptics.light();
    cancelRecording();
  }

  async function handleConfirmAttach() {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      sounds.tap();
      haptics.medium();
      toast.loading("Uploading voice note to Cloudflare R2...", { id: "voice-upload" });

      const res = await uploadMediaFile(audioBlob, "audio", `voice_memo_${Date.now()}.webm`);
      toast.success("Voice note attached! 🎙️", { id: "voice-upload" });
      onAudioRecorded(res.url, recordingTime || 1);
      clearRecording();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload voice note", {
        id: "voice-upload",
      });
    } finally {
      setIsUploading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl bg-card border border-border/60 p-6 space-y-6 shadow-2xl text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-foreground">Record Voice Memo</h3>
          <button
            type="button"
            onClick={() => {
              cancelRecording();
              onClose();
            }}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Dynamic Center Visualizer */}
        <div className="py-4 space-y-4">
          <div className="relative size-28 mx-auto flex items-center justify-center">
            {/* Pulsing Ripple Rings during recording */}
            {isRecording && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute inset-0 rounded-full bg-rose-500/20"
                />
                <motion.div
                  animate={{
                    scale: 1 + (audioLevel / 100) * 0.4,
                    opacity: 0.3 + (audioLevel / 100) * 0.5,
                  }}
                  className="absolute inset-2 rounded-full bg-rose-500/30"
                />
              </>
            )}

            <div
              className={cn(
                "size-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                isRecording
                  ? "bg-rose-500 text-white shadow-rose-500/30 scale-105"
                  : audioUrl
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-primary/10 text-primary"
              )}
            >
              <Mic className={cn("size-8", isRecording && "animate-pulse")} />
            </div>
          </div>

          {/* Timer Display */}
          <div className="space-y-1">
            <div className="text-2xl font-mono font-black text-foreground tracking-tight">
              {formatTime(recordingTime)}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {isRecording
                ? "Recording voice note..."
                : audioUrl
                  ? "Recording complete · Preview below"
                  : "Tap Record to start voice note"}
            </p>
          </div>

          {/* Audio Preview Element if Recorded */}
          {audioUrl && !isRecording && (
            <div className="pt-2">
              {/* biome-ignore lint/a11y/useMediaCaption: Dynamic voice note recording preview */}
              <audio src={audioUrl} controls className="w-full h-10 rounded-xl" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Mic className="size-4" />
              <span>Start Recording</span>
            </button>
          )}

          {isRecording && (
            <>
              <button
                type="button"
                onClick={handleDiscard}
                className="size-12 rounded-2xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-all cursor-pointer"
                title="Discard"
              >
                <Trash2 className="size-5" />
              </button>

              <button
                type="button"
                onClick={handleStop}
                className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-sm shadow-md shadow-rose-500/25 hover:bg-rose-600 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <StopCircle className="size-5" />
                <span>Done Recording</span>
              </button>
            </>
          )}

          {!isRecording && audioUrl && (
            <>
              <button
                type="button"
                onClick={clearRecording}
                className="size-12 rounded-2xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
                title="Record Again"
              >
                <RotateCcw className="size-5" />
              </button>

              <button
                type="button"
                disabled={isUploading}
                onClick={handleConfirmAttach}
                className="flex-1 py-3 rounded-2xl bg-foreground text-background font-black text-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="size-4" />
                <span>Attach Note</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
