"use client";

import { Camera, CameraOff, Mic, MicOff, PhoneOff, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CallEngine, type CallState } from "@/lib/calls/call-engine";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface ActiveCallOverlayProps {
  callId: string;
  isCaller: boolean;
  type: "audio" | "video";
  partner: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    username?: string;
  };
  remotePeerId?: string;
  onCallEnded: () => void;
}

export function ActiveCallOverlay({
  callId,
  isCaller,
  type,
  partner,
  remotePeerId,
  onCallEnded,
}: ActiveCallOverlayProps) {
  const [callState, setCallState] = useState<CallState>("CONNECTING");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(type === "audio");
  const [callDuration, setCallDuration] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const engineRef = useRef<CallEngine | null>(null);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (callState === "CONNECTED") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  function formatSeconds(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Initialize CallEngine & PeerJS
  useEffect(() => {
    const engine = new CallEngine({
      onStateChange: (state, err) => {
        setCallState(state);
        if (err) toast.error(err);
      },
      onLocalStream: (stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      },
      onRemoteStream: (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      },
      onClose: () => {
        sounds.pop();
        toast.info("Call ended");
        onCallEnded();
      },
    });

    engineRef.current = engine;

    async function start() {
      try {
        const myPeerId = await engine.initPeer();

        if (isCaller) {
          // Poll for acceptance if remotePeerId isn't immediately known
          const targetPeerId = remotePeerId;
          if (!targetPeerId) {
            const checkInterval = setInterval(async () => {
              const res = await fetch(`/api/calls/${callId}`);
              const data = (await res.json()) as any;
              if (data?.call?.status === "ACCEPTED" && data?.call?.receiverPeerId) {
                clearInterval(checkInterval);
                engine.callPeer(data.call.receiverPeerId, {
                  video: type === "video",
                  audio: true,
                });
              } else if (data?.call?.status === "DECLINED" || data?.call?.status === "ENDED") {
                clearInterval(checkInterval);
                toast.info("Call declined or ended.");
                onCallEnded();
              }
            }, 1800);
          } else {
            engine.callPeer(targetPeerId, {
              video: type === "video",
              audio: true,
            });
          }
        } else {
          // Receiver answers call
          await fetch(`/api/calls/${callId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "ACCEPT", receiverPeerId: myPeerId }),
          });

          await engine.answerIncomingCall({
            video: type === "video",
            audio: true,
          });
        }
      } catch (err: any) {
        console.error("Failed to start call:", err);
        toast.error(`Could not connect media: ${err?.message || "Check permissions"}`);
      }
    }

    start();

    return () => {
      engine.destroy();
    };
  }, [callId, isCaller, type, remotePeerId, onCallEnded]);

  function handleToggleMic() {
    if (!engineRef.current) return;
    const enabled = engineRef.current.toggleMicrophone();
    setIsMicMuted(!enabled);
    sounds.tap();
    haptics.light();
  }

  function handleToggleCamera() {
    if (!engineRef.current) return;
    const enabled = engineRef.current.toggleCamera();
    setIsCameraOff(!enabled);
    sounds.tap();
    haptics.light();
  }

  async function handleSwitchCamera() {
    if (!engineRef.current) return;
    sounds.tap();
    haptics.medium();
    const success = await engineRef.current.switchCamera();
    if (success) {
      toast.info("Camera flipped 🔄");
    }
  }

  async function handleEndCall() {
    sounds.pop();
    haptics.medium();
    try {
      await fetch(`/api/calls/${callId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "END" }),
      });
    } catch {}

    if (engineRef.current) {
      engineRef.current.destroy();
    }
    onCallEnded();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden h-[100dvh] w-full">
      {/* Remote Video Stream (Full Background) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#0d1117]">
        {type === "video" ? (
          // biome-ignore lint/a11y/useMediaCaption: WebRTC live video stream
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <Avatar className="size-24 sm:size-32 border-4 border-primary/30 shadow-2xl animate-pulse">
              <AvatarImage src={partner.avatarUrl || ""} />
              <AvatarFallback className="text-3xl font-black bg-primary/20 text-primary">
                {partner.displayName?.slice(0, 2).toUpperCase() || "CL"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">{partner.displayName}</h2>
              <p className="text-xs text-muted-foreground">Audio Call · Encrypted P2P</p>
              <p className="text-sm font-black text-emerald-400 font-mono pt-1">
                {callState === "CONNECTED" ? formatSeconds(callDuration) : callState}
              </p>
            </div>
          </div>
        )}

        {/* Local Video Stream Floating Picture-in-Picture (Top Right) */}
        {type === "video" && (
          <div className="absolute top-16 right-4 sm:top-6 sm:right-6 z-20 w-28 sm:w-36 aspect-3/4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            {isCameraOff && (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-white/60">
                <CameraOff className="size-6" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Header Information Overlay */}
      <header className="relative z-20 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border border-white/20">
            <AvatarImage src={partner.avatarUrl || ""} />
            <AvatarFallback className="text-xs font-black bg-primary/20 text-primary">
              {partner.displayName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white leading-tight">{partner.displayName}</h3>
              <ShieldCheck className="size-3.5 text-blue-400" />
            </div>
            <p className="text-[11px] text-white/70 font-mono">
              {callState === "CONNECTED" ? formatSeconds(callDuration) : `${callState.toLowerCase()}...`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="size-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors cursor-pointer"
          title="Safety options"
        >
          <ShieldAlert className="size-4.5" />
        </button>
      </header>

      {/* Bottom Floating Pill Controls Bar */}
      <div className="relative z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-4 flex justify-center">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 px-5 py-3 rounded-full flex items-center gap-3 sm:gap-5 shadow-2xl">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={cn(
              "size-12 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer",
              isMicMuted ? "bg-rose-500 text-white" : "bg-white/15 hover:bg-white/25 text-white"
            )}
            title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
            aria-label="Mute microphone"
          >
            {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          {/* Toggle Camera (for video calls) */}
          {type === "video" && (
            <>
              <button
                type="button"
                onClick={handleToggleCamera}
                className={cn(
                  "size-12 rounded-full flex items-center justify-center transition-transform active:scale-95 cursor-pointer",
                  isCameraOff ? "bg-rose-500 text-white" : "bg-white/15 hover:bg-white/25 text-white"
                )}
                title={isCameraOff ? "Turn camera on" : "Turn camera off"}
                aria-label="Toggle camera"
              >
                {isCameraOff ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
              </button>

              {/* Flip Camera */}
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="size-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                title="Switch camera"
                aria-label="Switch camera"
              >
                <RefreshCw className="size-5" />
              </button>
            </>
          )}

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="size-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
            title="End call"
            aria-label="End call"
          >
            <PhoneOff className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
