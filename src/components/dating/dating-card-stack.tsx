"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, MessageCircle, School, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/utils";

export type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  photos?: string[];
  bio: string | null;
  gender?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  points?: number;
  compatibilityScore?: number;
  institution?: { name: string; slug?: string; state?: string | null } | null;
};

interface DatingCardStackProps {
  candidate: Candidate;
  onSwipe: (direction: "like" | "pass") => void;
}

export function DatingCardStack({ candidate, onSwipe }: DatingCardStackProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-14, 14]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Collect all photos
  const candidatePhotos = (candidate.photos && candidate.photos.length > 0)
    ? candidate.photos
    : candidate.avatarUrl
      ? [candidate.avatarUrl]
      : [];

  const hasPhotos = candidatePhotos.length > 0;
  const avatarFallback = candidate.displayName[0]?.toUpperCase() || "S";
  const matchScore = candidate.compatibilityScore || 85;

  // Reset photo index when candidate changes
  useEffect(() => {
    setActivePhotoIdx(0);
  }, [candidate.id]);

  function handlePrevPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    if (activePhotoIdx > 0) {
      setActivePhotoIdx((prev) => prev - 1);
    }
  }

  function handleNextPhoto(e: React.MouseEvent) {
    e.stopPropagation();
    if (activePhotoIdx < candidatePhotos.length - 1) {
      setActivePhotoIdx((prev) => prev + 1);
    }
  }

  return (
    <div className="relative w-full max-w-sm aspect-[3/4.4] sm:aspect-[3/4.2] mx-auto select-none">
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) onSwipe("like");
          else if (info.offset.x < -90) onSwipe("pass");
        }}
        className="w-full h-full rounded-3xl border border-border/80 bg-card shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden backdrop-blur-xl group"
      >
        {/* Background Photo Display / Carousel */}
        {hasPhotos ? (
          <div className="absolute inset-0 z-0 bg-muted/40">
            <AnimatePresence mode="wait">
              <motion.img
                key={activePhotoIdx}
                src={candidatePhotos[activePhotoIdx]}
                alt={candidate.displayName}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.4 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60" />

            {/* Photo Navigation Touch Areas (Left & Right halves) */}
            {candidatePhotos.length > 1 && (
              <>
                <div
                  onClick={handlePrevPhoto}
                  className="absolute left-0 top-14 bottom-28 w-1/3 z-20 cursor-pointer"
                  title="Previous Photo"
                />
                <div
                  onClick={handleNextPhoto}
                  className="absolute right-0 top-14 bottom-28 w-1/3 z-20 cursor-pointer"
                  title="Next Photo"
                />

                {/* Left/Right Arrow Overlays on Hover */}
                {activePhotoIdx > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 size-8 rounded-full bg-black/50 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                {activePhotoIdx < candidatePhotos.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 size-8 rounded-full bg-black/50 text-white/90 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          /* Fallback Gradient if no photos */
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/15 via-card to-background" />
        )}

        {/* ─── Top Progress Bars (Story-style) & Badges ─── */}
        <div className="relative z-10 p-4 space-y-2.5">
          {/* Top Multi-photo Dash Indicators */}
          {candidatePhotos.length > 1 && (
            <div className="flex items-center gap-1.5 w-full">
              {candidatePhotos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                    i === activePhotoIdx ? "bg-white shadow-xs" : "bg-white/35"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges Row */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/20 backdrop-blur-md px-3 py-1 text-[11px] font-black text-rose-300 shadow-sm">
              <Sparkles className="size-3" /> {matchScore}% Vibe Match
            </span>

            <div className="flex items-center gap-1.5">
              {candidatePhotos.length > 1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white/90 border border-white/20">
                  <ImageIcon className="size-2.5" /> {activePhotoIdx + 1}/{candidatePhotos.length}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                <ShieldCheck className="size-3" /> Verified
              </span>
            </div>
          </div>
        </div>

        {/* ─── Candidate Details & Bio ─── */}
        <div className="relative z-10 p-5 space-y-2.5 mt-auto">
          {/* Avatar (if no uploaded photos) */}
          {!hasPhotos && (
            <div className="flex justify-center pb-2">
              <Avatar className="size-24 border-4 border-background shadow-2xl">
                <AvatarImage src={getAvatarUrl(candidate.avatarUrl, candidate.username)} />
                <AvatarFallback className="text-2xl font-black bg-primary/20 text-primary">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Name & Year */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md">
                {candidate.displayName}
              </h3>
              {candidate.year && (
                <span className="text-xs font-bold text-white/80 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                  Yr {candidate.year}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-white/75">
              <span>@{candidate.username}</span>
              {candidate.course && <span>· {candidate.course}</span>}
              {candidate.points && candidate.points >= 150 && (
                <span className="text-amber-400 font-bold">· 🔥 {candidate.points} LP</span>
              )}
            </div>
          </div>

          {/* Campus Tag */}
          {candidate.institution?.name && (
            <div className="inline-flex items-center gap-1 text-[11px] text-primary-foreground font-bold bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/40 shadow-xs max-w-full truncate">
              <School className="size-3 shrink-0" />
              <span className="truncate">{candidate.institution.name.split(",")[0]}</span>
            </div>
          )}

          {/* Bio Callout */}
          {candidate.bio && (
            <p className="rounded-2xl border border-white/15 bg-black/45 backdrop-blur-md p-3 text-xs font-medium text-white/90 leading-relaxed italic line-clamp-3">
              &ldquo;{candidate.bio}&rdquo;
            </p>
          )}

          {/* ─── Bottom Actions (Pass / Profile / Like) ─── */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSwipe("pass");
              }}
              className="size-13 sm:size-14 rounded-full bg-black/70 border-2 border-white/20 hover:border-destructive text-white hover:text-destructive flex items-center justify-center shadow-xl backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Pass"
            >
              <X className="size-6" />
            </button>

            <Link
              href={`/@${candidate.username}`}
              onClick={(e) => e.stopPropagation()}
              className="size-10 sm:size-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/35 transition-all cursor-pointer hover:scale-105"
              title="View Student Profile"
            >
              <MessageCircle className="size-4.5" />
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSwipe("like");
              }}
              className="size-13 sm:size-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/30 transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Like candidate"
            >
              <Heart className="size-6 fill-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
