"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FolderPlus,
  Layers,
  Lightbulb,
  ListOrdered,
  Loader2,
  Plus,
  Share2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AcademicPdfViewer } from "@/components/academics/academic-pdf-viewer";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface PlaylistItemData {
  id: string;
  sectionName: string;
  sortOrder: number;
  curatorNote?: string | null;
  resource: {
    id: string;
    title: string;
    description?: string | null;
    subjectCode: string;
    subjectName: string;
    branch: string;
    semester: number;
    resourceType: string;
    fileUrl?: string | null;
    driveUrl?: string | null;
    upvotesCount: number;
    downloadsCount: number;
    viewsCount: number;
    isVerified: boolean;
  };
}

interface PlaylistDetailData {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  branch: string;
  semester?: number | null;
  coverGradient: string;
  starsCount: number;
  viewsCount: number;
  itemsCount: number;
  isStarred: boolean;
  isOwner: boolean;
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

export function PlaylistDetailClient({ slugOrId }: { slugOrId: string }) {
  const [playlist, setPlaylist] = useState<PlaylistDetailData | null>(null);
  const [items, setItems] = useState<PlaylistItemData[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarring, setIsStarring] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(true);

  // Load playlist data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/academics/playlists/${encodeURIComponent(slugOrId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Playlist not found");
        return res.json();
      })
      .then((data: any) => {
        if (!isMounted) return;
        setPlaylist(data.playlist);
        setItems(data.items || []);
        setActiveIndex(0);
      })
      .catch((err) => {
        console.error("Error loading playlist:", err);
        toast.error("Study playlist could not be loaded");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  // Keyboard navigation for previous/next document
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "j") {
        nextItem();
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        prevItem();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function nextItem() {
    if (activeIndex < items.length - 1) {
      sounds.tap();
      haptics.light();
      setActiveIndex((i) => i + 1);
    }
  }

  function prevItem() {
    if (activeIndex > 0) {
      sounds.tap();
      haptics.light();
      setActiveIndex((i) => i - 1);
    }
  }

  async function handleStar() {
    if (!playlist || isStarring) return;
    sounds.tap();
    haptics.medium();
    setIsStarring(true);

    const prevStarred = playlist.isStarred;
    const prevCount = playlist.starsCount;

    setPlaylist((p) =>
      p
        ? {
            ...p,
            isStarred: !prevStarred,
            starsCount: prevStarred ? Math.max(0, prevCount - 1) : prevCount + 1,
          }
        : null
    );

    try {
      const res = await fetch(`/api/academics/playlists/${playlist.id}/star`, {
        method: "POST",
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to save study playlists");
        } else {
          toast.error("Failed to update save status");
        }
        setPlaylist((p) => (p ? { ...p, isStarred: prevStarred, starsCount: prevCount } : null));
        return;
      }
      const data = (await res.json()) as any;
      setPlaylist((p) => (p ? { ...p, isStarred: data.isStarred, starsCount: data.starsCount } : null));
      if (data.isStarred) {
        sounds.pop();
        haptics.success();
        toast.success("Saved to your study stacks! ⭐️");
      }
    } catch {
      setPlaylist((p) => (p ? { ...p, isStarred: prevStarred, starsCount: prevCount } : null));
    } finally {
      setIsStarring(false);
    }
  }

  function handleShareWhatsApp() {
    if (!playlist) return;
    sounds.tap();
    haptics.light();

    const url = window.location.href;
    const text = `Hey, check out this "${playlist.title}" study playlist on CampusLoop! Contains ${items.length} curated papers, notes & cheat sheets: ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  function handleCopyLink() {
    sounds.tap();
    haptics.light();
    navigator.clipboard.writeText(window.location.href);
    toast.success("Playlist link copied to clipboard!");
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="size-8 animate-spin text-indigo-400" />
        <p className="text-xs font-bold text-muted-foreground">Loading study playlist session...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <Layers className="size-12 text-muted-foreground opacity-40" />
        <h2 className="text-lg font-black text-foreground">Study Playlist Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          This stack might have been deleted or set to private.
        </p>
        <Link
          href="/app/academics"
          className="px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 shadow-md cursor-pointer transition-all"
        >
          Back to Academics
        </Link>
      </div>
    );
  }

  const currentItem = items[activeIndex];

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* ─── Top Navigation & Meta Banner ─── */}
      <div
        className={cn(
          "w-full rounded-3xl p-4 sm:p-6 bg-linear-to-r relative overflow-hidden shadow-lg space-y-4 text-white",
          playlist.coverGradient || "from-neutral-900 via-neutral-800 to-neutral-900 border border-border/40"
        )}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link
            href="/app/academics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Academics</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStar}
              disabled={isStarring}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all backdrop-blur-md shadow-xs cursor-pointer active:scale-95",
                playlist.isStarred
                  ? "bg-amber-400 text-amber-950 font-black shadow-amber-400/20"
                  : "bg-black/40 text-white hover:bg-black/60 border border-white/20"
              )}
            >
              <Star className={cn("size-3.5", playlist.isStarred && "fill-amber-950")} />
              <span>{playlist.isStarred ? "Saved Stack" : "Save Stack"}</span>
              <span className="text-[11px] opacity-90 tabular-nums">({playlist.starsCount})</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
              title="Share to Class WhatsApp Group"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 transition-colors cursor-pointer"
              title="Copy link"
            >
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Stack Title & Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/10">
              {playlist.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-[10px] font-bold">
              {playlist.branch}
            </span>
            {playlist.semester && (
              <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-[10px] font-bold">
                Semester {playlist.semester}
              </span>
            )}
            {playlist.institution?.name && (
              <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-[10px] font-bold">
                {playlist.institution.shortName || playlist.institution.name}
              </span>
            )}
          </div>

          <h1 className="text-lg sm:text-2xl font-black tracking-tight">{playlist.title}</h1>

          {playlist.description && (
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl pt-0.5">
              {playlist.description}
            </p>
          )}
        </div>

        {/* Curator Pill */}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium opacity-80">Curated by</span>
            <Link
              href={`/@${playlist.creator.username}?tab=academics`}
              className="flex items-center gap-1.5 font-bold hover:underline"
            >
              {playlist.creator.avatarUrl ? (
                <img
                  src={playlist.creator.avatarUrl}
                  alt={playlist.creator.displayName}
                  className="size-4 rounded-full object-cover"
                />
              ) : (
                <span className="size-4 rounded-full bg-white/20 text-[9px] flex items-center justify-center font-bold">
                  {playlist.creator.displayName.charAt(0)}
                </span>
              )}
              <span>@{playlist.creator.username}</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1">
              <FolderPlus className="size-3" />
              <span>{items.length} materials</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              <span>{playlist.viewsCount} views</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Study Session Workspace ─── */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Playlist Queue (4 cols on lg) */}
          <div
            className={cn(
              "lg:col-span-4 rounded-3xl border border-border/60 bg-card p-3 sm:p-4 space-y-3 transition-all",
              !isQueueOpen && "lg:col-span-1"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ListOrdered className="size-4 text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Playlist Queue
                </h2>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 text-[10px] font-bold">
                  {items.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className="hidden lg:flex p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] font-bold cursor-pointer"
                title={isQueueOpen ? "Collapse queue" : "Expand queue"}
              >
                {isQueueOpen ? "Hide" : "Show"}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[500px] sm:max-h-[580px] overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setActiveIndex(idx);
                    }}
                    className={cn(
                      "w-full flex items-start gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border border-border/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-5 rounded-full font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5",
                        isActive ? "bg-white text-indigo-600" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase",
                            isActive ? "bg-white/20 text-white" : "bg-indigo-500/15 text-indigo-400"
                          )}
                        >
                          {item.resource.subjectCode}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-semibold",
                            isActive ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {item.resource.resourceType}
                        </span>
                      </div>

                      <p
                        className={cn(
                          "text-xs font-bold truncate mt-1",
                          isActive ? "text-white" : "text-foreground"
                        )}
                      >
                        {item.resource.title}
                      </p>

                      {item.curatorNote && (
                        <p
                          className={cn(
                            "text-[10px] line-clamp-1 mt-0.5 italic flex items-center gap-1",
                            isActive ? "text-white/80" : "text-indigo-400"
                          )}
                        >
                          <Lightbulb className="size-2.5 shrink-0" />
                          <span>{item.curatorNote}</span>
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Document Stage (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-3">
            {currentItem && (
              <div className="space-y-3">
                {/* Active Document Header Card */}
                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl border border-border/60 bg-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-mono text-xs font-black">
                        {currentItem.resource.subjectCode}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">
                        {currentItem.resource.subjectName}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-foreground truncate mt-1">
                      {currentItem.resource.title}
                    </h2>
                  </div>

                  <Link
                    href={`/app/academics/${currentItem.resource.id}`}
                    target="_blank"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors shrink-0"
                    title="Open standalone document page"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                {/* PDF Viewer Canvas */}
                <AcademicPdfViewer
                  fileUrl={currentItem.resource.fileUrl}
                  driveUrl={currentItem.resource.driveUrl}
                  title={currentItem.resource.title}
                  subjectCode={currentItem.resource.subjectCode}
                  resourceType={currentItem.resource.resourceType}
                  pageUrl={`https://campusloop.space/app/academics/${(currentItem.resource as any).slug || currentItem.resource.id}`}
                />

                {/* Bottom Navigation Player Controls */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-card">
                  <button
                    type="button"
                    onClick={prevItem}
                    disabled={activeIndex <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-border/60 hover:bg-muted disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">Previous Material</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                    <span className="tabular-nums">Material {activeIndex + 1}</span>
                    <span className="text-muted-foreground font-normal">of {items.length}</span>
                  </div>

                  <button
                    type="button"
                    onClick={nextItem}
                    disabled={activeIndex >= items.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next Material</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 p-12 text-center space-y-3 bg-card/50">
          <FolderPlus className="size-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-black text-foreground">This Playlist is Currently Empty</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Add notes, PYQs, and cheat sheets from the academics vault to populate this stack.
          </p>
          <Link
            href="/app/academics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 shadow-md cursor-pointer transition-all"
          >
            <Plus className="size-4" />
            <span>Browse Academics to Add</span>
          </Link>
        </div>
      )}
    </div>
  );
}
