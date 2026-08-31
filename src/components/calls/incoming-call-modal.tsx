"use client";

import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sounds } from "@/lib/sounds";

interface IncomingCallModalProps {
  incomingCall: {
    callId: string;
    caller: {
      id: string;
      displayName: string;
      avatarUrl?: string | null;
      username?: string;
    };
    type: "audio" | "video";
  };
  onAccept: () => void;
  onDecline: () => void;
}

export function IncomingCallModal({ incomingCall, onAccept, onDecline }: IncomingCallModalProps) {
  const { caller, type } = incomingCall;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-75" />
            <Avatar className="size-20 border-2 border-primary shadow-xl">
              <AvatarImage src={caller.avatarUrl || ""} />
              <AvatarFallback className="text-xl font-black bg-primary/20 text-primary">
                {caller.displayName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">{caller.displayName}</h3>
            <p className="text-xs text-muted-foreground">
              Incoming {type === "video" ? "Video" : "Audio"} Call...
            </p>
          </div>
        </div>

        {/* Action Buttons: Decline & Accept */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {/* Decline */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.pop();
                onDecline();
              }}
              className="size-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Decline"
            >
              <PhoneOff className="size-6" />
            </button>
            <span className="text-[11px] font-bold text-muted-foreground">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.ting();
                onAccept();
              }}
              className="size-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Accept"
            >
              {type === "video" ? <Video className="size-6" /> : <Phone className="size-6" />}
            </button>
            <span className="text-[11px] font-bold text-emerald-400">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
