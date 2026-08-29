"use client";

import { CapsuleCountdown } from "@/components/capsule/capsule-countdown";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn,formatTimeAgo,getAvatarUrl } from "@/lib/utils";
import {
Eye,
Hourglass,
KeyRound,
Lock,
Plus,
Unlock
} from "lucide-react";
import { useState } from "react";

interface CapsuleCardProps {
  capsule: any;
  currentUserId?: string;
  onOpenBuryModal: (capsuleId: string, capsuleTitle: string) => void;
}

export function CapsuleCard({
  capsule,
  onOpenBuryModal,
}: CapsuleCardProps) {
  const [showEntries, setShowEntries] = useState(capsule.isUnlocked);
  const isUnlocked = capsule.isUnlocked;

  function handleBuryClick() {
    sounds.tap();
    haptics.light();
    onOpenBuryModal(capsule.id, capsule.title);
  }

  function handleToggleEntries() {
    sounds.tap();
    haptics.light();
    setShowEntries(!showEntries);
  }

  return (
    <div className="rounded-3xl border border-border/40 bg-card overflow-hidden shadow-xs hover:border-border/80 transition-all select-none">
      {/* Cover Image Banner */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-muted">
        {capsule.coverImage && (
          <img
            src={capsule.coverImage}
            alt={capsule.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5 backdrop-blur-md",
              isUnlocked
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
            )}
          >
            {isUnlocked ? (
              <>
                <Unlock className="size-3" />
                <span>Vault Unlocked</span>
              </>
            ) : (
              <>
                <Lock className="size-3" />
                <span>Sealed Vault</span>
              </>
            )}
          </span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-background/80 text-foreground border border-border/40 backdrop-blur-md">
            {capsule.category.replace("_", " ")}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-3.5 inset-x-4 z-10 space-y-1">
          <h3 className="text-base sm:text-lg font-black text-foreground drop-shadow-xs leading-snug">
            {capsule.title}
          </h3>
          {capsule.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
              {capsule.description}
            </p>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 space-y-4">
        {/* Countdown Ticker or Unlock Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-muted/20 border border-border/30">
          <div className="flex items-center gap-2">
            <Hourglass className="size-4 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-muted-foreground block text-[10px] uppercase tracking-wider">
                {isUnlocked ? "Unlocked Date" : "Unlocks Automatically On"}
              </span>
              <span className="font-black text-foreground">
                {new Date(capsule.targetUnlockDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <CapsuleCountdown targetDate={capsule.targetUnlockDate} />
        </div>

        {/* Buried Count & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <KeyRound className="size-3.5 text-primary" />
            <span>
              <strong className="text-foreground font-black">
                {capsule.totalEntriesBuried ?? capsule.entriesCount}
              </strong>{" "}
              Memories & Predictions Buried
            </span>
          </div>

          {!isUnlocked ? (
            <button
              type="button"
              onClick={handleBuryClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-white text-xs font-black hover:bg-amber-600 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="size-3.5" />
              <span>Bury Memory</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleToggleEntries}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="size-3.5 text-emerald-500" />
              <span>{showEntries ? "Hide Entries" : "View Museum Wall"}</span>
            </button>
          )}
        </div>

        {/* Sealed Vault Private Preview Notice (if locked and user buried a memory) */}
        {!isUnlocked && capsule.entries && capsule.entries.length > 0 && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
            <p className="text-[11px] font-bold text-amber-500 flex items-center gap-1.5">
              <Lock className="size-3" />
              <span>You have buried {capsule.entries.length} memory in this sealed vault:</span>
            </p>
            <div className="space-y-1.5">
              {capsule.entries.map((e: any) => (
                <div
                  key={e.id}
                  className="text-xs p-2 rounded-xl bg-card border border-border/30 text-foreground/90 font-medium"
                >
                  <p className="font-bold text-foreground">"{e.title}"</p>
                  <p className="text-muted-foreground line-clamp-1 mt-0.5 text-[11px]">
                    {e.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Museum Wall Entries */}
        {isUnlocked && showEntries && capsule.entries && (
          <div className="space-y-3 pt-2 border-t border-border/20">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Buried Legacy & Predictions Revealed
            </h4>
            <div className="space-y-2.5">
              {capsule.entries.map((entry: any) => {
                const authorAvatar = entry.author
                  ? getAvatarUrl(entry.author.avatarUrl, entry.author.username)
                  : null;

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-muted/20 border border-border/30 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {entry.author ? (
                          <>
                            <Avatar className="size-6 rounded-full border">
                              <AvatarImage src={authorAvatar!} />
                              <AvatarFallback className="text-[9px]">
                                {entry.author.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold text-foreground">
                              {entry.author.displayName}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-amber-500">
                            @{entry.pseudonym || "anonymous_student"}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          · {formatTimeAgo(entry.createdAt)}
                        </span>
                      </div>

                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {entry.entryType}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-foreground">
                      {entry.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {entry.content}
                    </p>

                    {entry.mediaUrl && (
                      <div className="rounded-xl overflow-hidden max-h-48 border border-border/30 mt-2">
                        <img
                          src={entry.mediaUrl}
                          alt={entry.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
