"use client";

import { ArrowLeft, Check, FolderPlus, Layers, Loader2, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  { label: "Cosmic Indigo", value: "from-indigo-600 via-purple-600 to-pink-600" },
  { label: "Emerald Matrix", value: "from-emerald-600 via-teal-600 to-cyan-600" },
  { label: "Sunset Fire", value: "from-amber-600 via-orange-600 to-rose-600" },
  { label: "Deep Navy", value: "from-blue-600 via-indigo-700 to-slate-900" },
  { label: "Amethyst Rose", value: "from-fuchsia-600 via-pink-600 to-rose-500" },
];

const CATEGORIES = [
  { value: "SEMESTER_PACK", label: "Semester Survival Pack" },
  { value: "EXAM_PREP", label: "Midsem / Endsem Cram Stack" },
  { value: "SUBJECT_BUNDLE", label: "Single Subject Master Bundle" },
  { value: "GATE", label: "GATE & Competitive Coding" },
  { value: "CUSTOM", label: "Custom Student Collection" },
];

const BRANCHES = [
  "All",
  "Computer Science",
  "Information Technology",
  "ECE",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Biotechnology",
];

interface ResourceSearchResult {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
}

export function NewPlaylistClient() {
  const router = useRouter();
  const { profile, isLoading: profileLoading } = useProfile();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SEMESTER_PACK");
  const [branch, setBranch] = useState("Computer Science");
  const [semester, setSemester] = useState("4");
  const [coverGradient, setCoverGradient] = useState(GRADIENTS[0].value);
  const [visibility] = useState("PUBLIC");

  // Material picker state
  const [selectedResources, setSelectedResources] = useState<ResourceSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ResourceSearchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search resources as query changes
  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/academics?q=${encodeURIComponent(query.trim())}&limit=8&scope=global&sort=latest`
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        setSearchResults(data.resources || []);
      }
    } catch (err) {
      console.error("Failed to search resources:", err);
    } finally {
      setIsSearching(false);
    }
  }

  function addResource(res: ResourceSearchResult) {
    if (selectedResources.some((r) => r.id === res.id)) {
      toast.info("Already added to this playlist");
      return;
    }
    sounds.tap();
    haptics.light();
    setSelectedResources((prev) => [...prev, res]);
  }

  function removeResource(id: string) {
    sounds.tap();
    haptics.light();
    setSelectedResources((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a playlist title");
      return;
    }

    if (selectedResources.length === 0) {
      toast.error("Please add at least 1 study material to your stack");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/academics/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          branch,
          semester: semester === "all" ? null : parseInt(semester, 10),
          coverGradient,
          visibility,
          initialResourceIds: selectedResources.map((r) => r.id),
        }),
      });

      if (!res.ok) {
        const errData = ((await res.json().catch(() => ({}))) || {}) as any;
        throw new Error(errData.error || "Failed to create playlist");
      }

      const data = (await res.json()) as any;
      sounds.pop();
      haptics.success();
      toast.success("Study Playlist published successfully!");
      router.push(`/app/academics/playlists/${data.playlist.slug || data.playlist.id}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to publish playlist";
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen pb-24 max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/academics"
            className="p-2 rounded-full border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <span>Create Study Playlist</span>
              <Sparkles className="size-4 text-indigo-400" />
            </h1>
            <p className="text-xs text-muted-foreground">
              Bundle handwritten notes, 5-year PYQs, and cheat sheets for your batch
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <FolderPlus className="size-3.5" />
              <span>Publish Stack</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Live Preview Banner ─── */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Theme &amp; Cover Preview
          </label>
          <div
            className={cn(
              "h-28 sm:h-32 w-full rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden bg-linear-to-r shadow-md transition-all duration-300",
              coverGradient
            )}
          >
            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/10">
                <Layers className="size-3" />
                <span>
                  {CATEGORIES.find((c) => c.value === category)?.label.split(" ")[0] || "Pack"}
                </span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/40 text-white backdrop-blur-md">
                {selectedResources.length} Materials
              </span>
            </div>

            <div className="z-10 text-white">
              <h3 className="font-black text-base sm:text-lg line-clamp-1 drop-shadow-xs">
                {title.trim() || "Untitled Study Playlist"}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {branch} • {semester === "all" ? "All Semesters" : `Semester ${semester}`}
              </p>
            </div>
          </div>

          {/* Gradient selector pills */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setCoverGradient(g.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0",
                  coverGradient === g.value
                    ? "border-indigo-500 bg-indigo-500/15 text-foreground ring-1 ring-indigo-500"
                    : "border-border/60 hover:bg-muted text-muted-foreground"
                )}
              >
                <div className={cn("size-3 rounded-full bg-linear-to-r", g.value)} />
                <span className="text-[11px]">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Stack Details ─── */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Playlist Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sem 4 CSAI Endsem Survival Stack (OS + DBMS + CN)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl text-sm bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Curator Notes / Exam Tips (Optional)
            </label>
            <textarea
              placeholder="Advice for juniors or batchmates: which units to focus on, question predictions, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-2xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── Material Assembler ─── */}
        <div className="rounded-3xl border border-border/60 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-foreground">Assemble Materials</h2>
              <p className="text-xs text-muted-foreground">
                Search our 9,200+ academic paper archive to add notes, PYQs, and cheat sheets
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selectedResources.length} Selected
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by subject name or code (e.g. Operating Systems, CS304, DLD, Math)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs bg-background border border-border focus:outline-hidden focus:border-indigo-500 font-medium"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {/* Search Results Dropdown / Picker */}
          {searchResults.length > 0 && (
            <div className="border border-border/70 rounded-2xl bg-background/95 divide-y divide-border/40 max-h-56 overflow-y-auto p-1 shadow-md">
              {searchResults.map((res) => {
                const isSelected = selectedResources.some((r) => r.id === res.id);
                return (
                  <div
                    key={res.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-muted/50 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-mono text-[9px] font-bold">
                          {res.subjectCode}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {res.resourceType} • Sem {res.semester}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground truncate mt-0.5">
                        {res.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => (isSelected ? removeResource(res.id) : addResource(res))}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1",
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="size-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Materials Queue */}
          {selectedResources.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <p className="text-xs font-bold text-muted-foreground">
                Stack Queue ({selectedResources.length} items)
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {selectedResources.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="size-5 rounded-full bg-card border border-border font-mono text-[10px] font-bold text-muted-foreground flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.subjectCode} • {item.resourceType}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeResource(item.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove from stack"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-1 border border-dashed border-border/60 rounded-2xl">
              <FolderPlus className="size-6 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs font-bold text-foreground">No materials added yet</p>
              <p className="text-[11px] text-muted-foreground">
                Use the search box above to add notes and PYQs to your stack
              </p>
            </div>
          )}
        </div>

        {/* ─── Submit Bar ─── */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/app/academics"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95"
          >
            {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <FolderPlus className="size-3.5" />}
            <span>Publish Study Playlist</span>
          </button>
        </div>
      </form>
    </div>
  );
}
