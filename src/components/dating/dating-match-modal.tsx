"use client";

import { Sparkles, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MatchResult {
  matched: boolean;
  conversationId?: string;
  matchedUser?: {
    displayName: string;
    avatarUrl: string | null;
  };
}

interface DatingMatchModalProps {
  matchResult: MatchResult | null;
  onClose: () => void;
}

export function DatingMatchModal({ matchResult, onClose }: DatingMatchModalProps) {
  if (!matchResult?.matched || !matchResult.matchedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-primary/30 bg-card p-6 shadow-2xl text-center space-y-5 relative overflow-hidden">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-foreground">It's a Vibe Match! 🎉</h2>
          <p className="text-xs text-muted-foreground">
            You and <strong className="text-foreground">{matchResult.matchedUser.displayName}</strong> liked each other!
          </p>
        </div>

        <div className="flex justify-center my-2">
          <Avatar className="h-20 w-20 border-4 border-primary shadow-xl">
            <AvatarImage src={matchResult.matchedUser.avatarUrl || ""} />
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {matchResult.matchedUser.displayName[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-2 pt-2">
          {matchResult.conversationId && (
            <Link href={`/app/chat/${matchResult.conversationId}`}>
              <Button className="w-full bg-primary text-primary-foreground font-bold h-10 rounded-xl gap-2 cursor-pointer shadow-md">
                <MessageCircle className="h-4 w-4" /> Start Direct Chat
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full text-xs font-semibold h-9 rounded-xl border border-border/60 cursor-pointer"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
