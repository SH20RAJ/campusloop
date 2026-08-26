"use client";

import { cn,getAvatarUrl } from "@/lib/utils";
import { AnimatePresence,motion,useMotionValue,useTransform } from "framer-motion";
import {
GraduationCap,
Heart,
School,
ShieldCheck,
Sparkles,
UserRound,
X,
} from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";

export type Candidate = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  photos: string[];
  bio: string | null;
  gender?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  points?: number;
  interests?: string[];
  compatibilityScore: number;
  sharedInterests: string[];
  likedYou?: boolean;
  institution?: { name: string; slug?: string | null; state?: string | null } | null;
};

const SWIPE_THRESHOLD = 100;

/** Top card: draggable with LIKE / NOPE stamps. */
function TopCard({
  candidate,
  onSwipe,
}: {
  candidate: Candidate;
  onSwipe: (direction: "like" | "pass") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-16, 16]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0]);

  const [photoIdx, setPhotoIdx] = useState(0);
  const [exitX, setExitX] = useState(0);

  const photos = candidate.photos.length > 0 ? candidate.photos : [getAvatarUrl(candidate.avatarUrl, candidate.username)];

  useEffect(() => {
    setPhotoIdx(0);
    setExitX(0);
  }, [candidate.id]);

  function fireSwipe(direction: "like" | "pass") {
    setExitX(direction === "like" ? 400 : -400);
    if (typeof window !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(15);
    }
    // Give the exit animation a beat before advancing the deck
    setTimeout(() => onSwipe(direction), 180);
  }

  function tapPhoto(e: React.MouseEvent, side: "prev" | "next") {
    e.stopPropagation();
    setPhotoIdx((i) =>
      side === "prev" ? Math.max(0, i - 1) : Math.min(photos.length - 1, i + 1)
    );
  }

  return (
    <motion.div
      key={candidate.id}
      style={{ x, rotate }}
      animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
      transition={exitX !== 0 ? { duration: 0.25, ease: "easeOut" } : undefined}
      drag={exitX === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) fireSwipe("like");
        else if (info.offset.x < -SWIPE_THRESHOLD) fireSwipe("pass");
      }}
      className="absolute inset-0 cursor-grab touch-pan-y select-none overflow-hidden rounded-[1.75rem] bg-neutral-900 shadow-2xl ring-1 ring-white/10 active:cursor-grabbing"
    >
      {/* Photo */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={photoIdx}
          src={photos[photoIdx]}
          alt={candidate.displayName}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-black/45" />

      {/* Photo tap zones */}
      {photos.length > 1 && (
        <>
          <div className="absolute bottom-40 left-0 top-16 z-20 w-1/3" onClick={(e) => tapPhoto(e, "prev")} />
          <div className="absolute bottom-40 right-0 top-16 z-20 w-1/3" onClick={(e) => tapPhoto(e, "next")} />
        </>
      )}

      {/* Story-style progress bars */}
      {photos.length > 1 && (
        <div className="absolute inset-x-3 top-3 z-30 flex gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i === photoIdx ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      )}

      {/* LIKE / NOPE stamps (Tinder signature) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-10 z-30 -rotate-12 rounded-lg border-4 border-emerald-400 px-3 py-1"
      >
        <span className="text-3xl font-black tracking-widest text-emerald-400">LIKE</span>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-5 top-10 z-30 rotate-12 rounded-lg border-4 border-rose-500 px-3 py-1"
      >
        <span className="text-3xl font-black tracking-widest text-rose-500">NOPE</span>
      </motion.div>

      {/* Top badges */}
      <div className="absolute inset-x-3 top-7 z-20 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-black text-white backdrop-blur-md">
          <Sparkles className="size-3 text-rose-400" /> {candidate.compatibilityScore}% match
        </span>
        <div className="flex items-center gap-1.5">
          {candidate.likedYou && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/80 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-md">
              <Heart className="size-2.5 fill-white" /> Likes you
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-1 text-[10px] font-extrabold text-emerald-300 backdrop-blur-md">
            <ShieldCheck className="size-3" /> Verified
          </span>
        </div>
      </div>

      {/* Info overlay */}
      <div className="absolute inset-x-0 bottom-0 z-20 space-y-2.5 p-5 pb-6">
        <div>
          <div className="flex items-end gap-2.5">
            <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
              {candidate.displayName}
            </h2>
            {candidate.year && (
              <span className="mb-1 text-xl font-bold text-white/85">Yr {candidate.year}</span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-white/80">
            {candidate.institution?.name && (
              <span className="inline-flex items-center gap-1">
                <School className="size-3.5" /> {candidate.institution.name.split(",")[0]}
              </span>
            )}
            {(candidate.course || candidate.branch) && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="size-3.5" />
                {[candidate.course, candidate.branch].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Shared interests — the Hinge move */}
        {candidate.sharedInterests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.sharedInterests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 rounded-full border border-rose-400/50 bg-rose-500/25 px-2.5 py-1 text-[10px] font-bold text-rose-100 backdrop-blur-md"
              >
                <Heart className="size-2.5 fill-rose-300 text-rose-300" /> You both like {interest}
              </span>
            ))}
          </div>
        )}

        {candidate.bio && (
          <p className="line-clamp-2 text-[13px] font-medium leading-relaxed text-white/90">
            {candidate.bio}
          </p>
        )}

        <Link
          href={`/@${candidate.username}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-white/70 transition-colors hover:text-white"
        >
          <UserRound className="size-3" /> View full profile
        </Link>
      </div>
    </motion.div>
  );
}

/** Static card rendered behind the top card for the stack illusion. */
function BackCard({ candidate, depth }: { candidate: Candidate; depth: 1 | 2 }) {
  const photo =
    candidate.photos[0] ?? getAvatarUrl(candidate.avatarUrl, candidate.username);
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem] bg-neutral-900 shadow-xl ring-1 ring-white/10"
      style={{
        transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
        zIndex: -depth,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}

export function SwipeDeck({
  candidates,
  onSwipe,
}: {
  candidates: Candidate[];
  onSwipe: (direction: "like" | "pass") => void;
}) {
  const [top, second, third] = candidates;
  if (!top) return null;

  return (
    <div className="relative mx-auto h-full w-full max-w-sm">
      {third && <BackCard candidate={third} depth={2} />}
      {second && <BackCard candidate={second} depth={1} />}
      <TopCard candidate={top} onSwipe={onSwipe} />
    </div>
  );
}

/** Icon buttons under the deck: X and heart with hover pop. */
export function SwipeActions({
  onPass,
  onLike,
  onUndo,
  canUndo,
}: {
  onPass: () => void;
  onLike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-5">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last swipe"
        className="flex size-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-amber-400 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/10 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onPass}
        aria-label="Pass"
        className="flex size-16 items-center justify-center rounded-full border-2 border-rose-500/50 bg-white/5 text-rose-500 backdrop-blur-md transition-all hover:scale-110 hover:bg-rose-500/15 active:scale-90 cursor-pointer"
      >
        <X className="size-8" strokeWidth={3} />
      </button>

      <button
        type="button"
        onClick={onLike}
        aria-label="Like"
        className="flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/40 transition-all hover:scale-110 active:scale-90 cursor-pointer"
      >
        <Heart className="size-8 fill-white" />
      </button>
    </div>
  );
}
