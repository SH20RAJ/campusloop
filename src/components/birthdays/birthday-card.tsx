"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, Sparkles, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

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

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function BirthdayCard({ student, isToday = false }: BirthdayCardProps) {
  function handleConfetti(e: React.MouseEvent) {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x, y },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#f59e0b"],
    });
  }

  const birthDateFormatted = student.birthMonth && student.birthDay
    ? `${MONTH_NAMES[student.birthMonth - 1]} ${student.birthDay}`
    : student.dob
      ? `${MONTH_NAMES[parseInt(student.dob.split("-")[1], 10) - 1]} ${parseInt(student.dob.split("-")[2], 10)}`
      : "";

  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
        isToday
          ? "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border-pink-500/30 shadow-xs hover:border-pink-500/50"
          : "bg-card border-border/60 hover:border-border hover:bg-muted/30"
      }`}
    >
      <Link href={`/@${student.username}`} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="size-11 border-2 border-background shadow-xs group-hover:scale-105 transition-transform">
            <AvatarImage src={student.avatarUrl || ""} />
            <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
              {(student.displayName?.[0] || "S").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isToday && (
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-pink-500 text-white shadow-xs text-[10px]">
              🎂
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {student.displayName}
            </h4>
            <ShieldCheck className="size-3 text-blue-500 shrink-0" />
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            @{student.username}
            {student.course && ` · ${student.course}`}
          </p>
          {student.institution && (
            <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">
              🏛️ {student.institution.name}
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-500 text-xs font-bold hover:bg-pink-500/25 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Pop confetti"
            >
              <Sparkles className="size-3.5" />
              <span>🎉 Wish</span>
            </button>
            <Link
              href={`/app/chat?userId=${student.id}`}
              className="flex size-8 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-pointer"
              title="Send DM birthday wish"
            >
              <MessageCircle className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border/60">
              <Cake className="size-3 text-pink-500" /> {birthDateFormatted}
            </span>
            {student.daysUntil !== undefined && (
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                {student.daysUntil === 1 ? "Tomorrow" : `In ${student.daysUntil} days`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
