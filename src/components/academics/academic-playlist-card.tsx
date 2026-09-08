"use client";

import { Eye, FolderPlus, Layers, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

export interface AcademicPlaylistData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  branch: string;
  semester?: number | null;
  coverGradient?: string;
  starsCount: number;
  viewsCount: number;
  itemsCount: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  tags?: string[] | unknown;
  createdAt: string | Date;
  creator: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
    role?: string;
    isVerified?: boolean;
  };
  institution?: {
    id: string;
    name: string;
    shortName?: string | null;
  } | null;
}

interface AcademicPlaylistCardProps {
  playlist: AcademicPlaylistData;
  onStarToggle?: (playlistId: string, newState: boolean) => void;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  SEMESTER_PACK: "Semester Pack",
  EXAM_PREP: "Exam Cram Stack",
  SUBJECT_BUNDLE: "Subject Bundle",
  GATE: "GATE & Placements",
  CUSTOM: "Curated Stack",
};

export function AcademicPlaylistCard({
  playlist,
  onStarToggle,
  className,
}: AcademicPlaylistCardProps) {
  const router = useRouter();
  const [stars, setStars] = useState(playlist.starsCount);
  const [isStarred, setIsStarred] = useState(false);
  const [isStarring, setIsStarring] = useState(false);

  async function handleStar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (isStarring) return;
    sounds.tap();
    haptics.light();
    setIsStarring(true);

    const prevStarred = isStarred;
    const prevCount = stars;
    setIsStarred(!prevStarred);
    setStars((s) => (prevStarred ? Math.max(0, s - 1) : s + 1));

    try {
      const res = await fetch(`/api/academics/playlists/${playlist.id}/star`, {
        method: "POST",
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to save study playlists");
        } else {
          toast.error("Failed to update star");
        }
        setIsStarred(prevStarred);
        setStars(prevCount);
        return;
      }
      const data = (await res.json()) as any;
      setIsStarred(data.isStarred);
      setStars(data.starsCount);
      if (data.isStarred) {
        toast.success("Saved to your study stacks! ⭐️");
      }
      if (onStarToggle) onStarToggle(playlist.id, data.isStarred);
    } catch {
      setIsStarred(prevStarred);
      setStars(prevCount);
    } finally {
      setIsStarring(false);
    }
  }

  const categoryLabel = CATEGORY_LABELS[playlist.category] || "Study Playlist";
  const gradient =
    playlist.coverGradient || "from-indigo-600 via-purple-600 to-pink-600";

  return (
    <Link
      href={`/app/academics/playlists/${playlist.slug || playlist.id}`}
      className={cn(
        "group relative flex flex-col rounded-3xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5",
        className
      )}
    >
      {/* ─── Top Banner Gradient ─── */}
      <div className={cn("h-24 w-full bg-linear-to-r p-3 flex flex-col justify-between relative overflow-hidden", gradient)}>
        <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/10 shadow-xs">
            <Layers className="size-3" />
            <span>{categoryLabel}</span>
          </span>

          <button
            type="button"
            onClick={handleStar}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all backdrop-blur-md shadow-xs cursor-pointer active:scale-90",
              isStarred
                ? "bg-amber-400 text-amber-950 font-black shadow-amber-400/20"
                : "bg-black/40 text-white hover:bg-black/60 border border-white/15"
            )}
            title="Save playlist"
          >
            <Star className={cn("size-3.5", isStarred && "fill-amber-950")} />
            <span className="text-[11px] tabular-nums">{stars}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-[10px] font-bold">
            {playlist.branch}
          </span>
          {playlist.semester && (
            <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-[10px] font-bold">
              Sem {playlist.semester}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-bold">
            <FolderPlus className="size-3" />
            <span>{playlist.itemsCount} materials</span>
          </span>
        </div>
      </div>

      {/* ─── Card Body ─── */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-black text-sm text-foreground line-clamp-2 group-hover:text-indigo-400 transition-colors leading-snug">
            {playlist.title}
          </h3>
          {playlist.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        {/* ─── Curator & Campus Footer ─── */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              sounds.tap();
              router.push(`/@${playlist.creator.username}?tab=academics`);
            }}
            className="flex items-center gap-2 min-w-0 text-left hover:underline cursor-pointer group/creator"
            title={`View @${playlist.creator.username}'s shared notes`}
          >
            {playlist.creator.avatarUrl ? (
              <img
                src={playlist.creator.avatarUrl}
                alt={playlist.creator.displayName}
                className="size-5 rounded-full object-cover shrink-0 border border-border/50"
              />
            ) : (
              <div className="size-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                {playlist.creator.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[11px] font-bold text-foreground group-hover/creator:text-primary truncate max-w-[120px]">
              @{playlist.creator.username}
            </span>
          </button>

          <div className="flex items-center gap-2 text-[10px] shrink-0 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="size-3 text-muted-foreground" />
              <span>{playlist.viewsCount}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
