"use client";

import confetti from "canvas-confetti";
import { Cake, MessageCircle, PartyPopper, School } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { sounds } from "@/lib/sounds";

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
    sounds.tap();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 60,
      spread: 75,
      origin: { x, y },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#f59e0b", "#10b981"],
    });

    if (!wished) {
      setWished(true);
      toast.success(`Wished @${student.username} a Happy Birthday!`);
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
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-3xl transition-all duration-300 border-0 ${
        isToday
          ? "bg-gradient-to-r from-pink-500/10 via-primary/5 to-amber-500/5 shadow-xs"
          : "bg-card/70 hover:bg-muted/30 shadow-2xs"
      }`}
    >
      <Link href={`/@${student.username}`} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <Avatar className="size-11 sm:size-12 rounded-full border-0 shadow-2xs group-hover:scale-105 transition-transform">
            <AvatarImage src={student.avatarUrl || ""} className="rounded-full object-cover" />
            <AvatarFallback className="font-black text-xs bg-primary/10 text-primary rounded-full">
              {(student.displayName?.[0] || "S").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isToday && (
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-pink-500 text-white shadow-xs text-[10px] animate-bounce">
              <Cake className="size-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {student.displayName}
            </h4>
            <span className="text-primary text-[10px] font-black" title="Verified Student">
              ✓
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground truncate">
            @{student.username}
            {student.course && ` · ${student.course}`}
          </p>

          {student.institution && (
            <p className="text-[10px] text-muted-foreground/80 truncate flex items-center gap-1">
              <School className="size-2.5 shrink-0 opacity-70" />
              <span>{student.institution.name.split(",")[0]}</span>
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {isToday ? (
          <button
            type="button"
            onClick={handleConfetti}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs select-none active:scale-95 border-0 ${
              wished
                ? "bg-pink-500/20 text-pink-500"
                : "bg-pink-500 text-white hover:bg-pink-600 hover:scale-105"
            }`}
          >
            <PartyPopper className="size-3.5" />
            <span>{wished ? "Wished!" : "Wish"}</span>
          </button>
        ) : (
          <div className="text-right space-y-0.5">
            {birthDateFormatted && (
              <span className="text-xs font-bold text-foreground block">{birthDateFormatted}</span>
            )}
            {student.daysUntil !== undefined && (
              <span className="text-[10px] text-muted-foreground block font-medium">
                {student.daysUntil === 1 ? "Tomorrow" : `In ${student.daysUntil} days`}
              </span>
            )}
          </div>
        )}

        <Link
          href={`/app/chat?recipientId=${student.id}`}
          className="size-8 rounded-full bg-muted/40 border-0 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Send Direct Message"
        >
          <MessageCircle className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
