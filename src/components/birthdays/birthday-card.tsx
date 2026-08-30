"use client";

import confetti from "canvas-confetti";
import { Cake, Heart, MessageCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BirthdayCardProps {
  student: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    course?: string | null;
    branch?: string | null;
    gender?: string | null;
    dob?: string | null;
    daysUntil?: number;
    birthMonth?: number;
    birthDay?: number;
    institution?: { id: string; name: string } | null;
  };
  isToday?: boolean;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function BirthdayCard({ student, isToday = false }: BirthdayCardProps) {
  const [wished, setWished] = useState(false);

  function handleConfetti(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x, y },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981"],
    });

    if (!wished) {
      setWished(true);
      toast.success(`🎉 Wished @${student.username} a Happy Birthday!`);
    }
  }

  const birthDateFormatted =
    student.birthMonth && student.birthDay
      ? `${MONTH_NAMES[student.birthMonth - 1]} ${student.birthDay}`
      : student.dob
        ? `${MONTH_NAMES[parseInt(student.dob.split("-")[1], 10) - 1]} ${parseInt(student.dob.split("-")[2], 10)}`
        : "";

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 rounded-3xl transition-all duration-300 ${
        isToday
          ? "bg-linear-to-r from-pink-500/10 via-purple-500/10 to-amber-500/5 border border-pink-500/30 shadow-xs hover:border-pink-500/50"
          : "bg-card hover:bg-muted/40 shadow-2xs"
      }`}
    >
      <Link href={`/@${student.username}`} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="size-11 rounded-full border-2 border-background shadow-xs group-hover:scale-105 transition-transform">
            <AvatarImage src={student.avatarUrl || ""} className="rounded-full object-cover" />
            <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary rounded-full">
              {(student.displayName?.[0] || "S").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isToday && (
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-pink-500 text-white shadow-xs text-[10px] animate-bounce">
              🎂
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {student.displayName}
            </h4>
            <span className="text-blue-500 text-[10px] font-black" title="Verified Student">
              ✓
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground truncate">
            @{student.username}
            {student.course && ` · ${student.course}`}
          </p>

          {student.institution && (
            <p className="text-[10px] text-muted-foreground/80 truncate">
              🏛️ {student.institution.name.split(",")[0]}
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {isToday ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleConfetti}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                wished
                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  : "bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/20"
              }`}
              title="Pop confetti"
            >
              {wished ? <Heart className="size-3.5 fill-emerald-500" /> : <Zap className="size-3.5" />}
              <span>{wished ? "Wished!" : "🎉 Wish"}</span>
            </button>

            <Link
              href={`/app/chat?userId=${student.id}`}
              className="flex size-8 items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-foreground hover:text-primary transition-colors cursor-pointer"
              title="Send DM birthday wish"
            >
              <MessageCircle className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              <Cake className="size-3 text-pink-500" /> {birthDateFormatted}
            </span>
            {student.daysUntil !== undefined && (
              <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                {student.daysUntil === 0
                  ? "Today! 🎉"
                  : student.daysUntil === 1
                    ? "Tomorrow"
                    : `In ${student.daysUntil} days`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
