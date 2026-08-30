"use client";

import { Check, Compass, MapPin, Plus, School, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { type College, useColleges } from "@/hooks/use-colleges";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DreamCampusesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DreamCampusesApiResponse {
  dreamCampuses: College[];
}

export function DreamCampusesModal({ isOpen, onClose, onSuccess }: DreamCampusesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: initialData, mutate } = useSWR<DreamCampusesApiResponse>(
    isOpen ? "/api/profile/dream-campuses" : null,
    fetcher,
    {
      onSuccess: (data: DreamCampusesApiResponse) => {
        if (!isInitialized && data?.dreamCampuses) {
          setSelectedIds(data.dreamCampuses.map((c: College) => c.id));
          setIsInitialized(true);
        }
      },
    }
  );

  const { colleges, isLoading } = useColleges(80);

  const filteredColleges = useMemo(() => {
    if (!colleges) return [];
    if (!searchQuery.trim()) return colleges.slice(0, 12);
    const q = searchQuery.toLowerCase();
    return colleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q)
    );
  }, [colleges, searchQuery]);

  function handleToggleCollege(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        toast.info("You can pick up to 5 dream campuses");
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile/dream-campuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ institutionIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Failed to save dream campuses");

      toast.success("Dream campuses updated! Your preview feed is personalized 🎓");
      mutate();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Compass className="size-5.5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                Pick Your Dream Campuses
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {selectedIds.length}/5 Picked
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Personalize your Campus Preview feed with target colleges
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search BIT Mesra, IIT Bombay, NIT Trichy..."
            className="w-full h-10 rounded-full border border-border/50 bg-muted/40 pl-9 pr-4 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-foreground transition-all"
          />
        </div>

        {/* Selected Chips */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedIds.map((id) => {
              const college = colleges?.find((c) => c.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-xs animate-in fade-in"
                >
                  <span className="truncate max-w-[150px]">{college?.name || "College"}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleCollege(id)}
                    className="hover:opacity-70 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* College Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[300px]">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Loading 1,350+ campuses...</div>
          ) : filteredColleges.length > 0 ? (
            filteredColleges.map((college) => {
              const isSelected = selectedIds.includes(college.id);
              return (
                <div
                  key={college.id}
                  onClick={() => handleToggleCollege(college.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/60 hover:bg-muted/30 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="size-9 rounded-xl bg-card border border-border/80 p-1 flex items-center justify-center shrink-0">
                      {college.logoUrl ? (
                        <img src={college.logoUrl} alt={college.name} className="size-full object-contain" />
                      ) : (
                        <School className="size-4.5 text-primary" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{college.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="size-2.5 shrink-0" />
                        {college.district ? `${college.district}, ` : ""}
                        {college.state || "India"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "size-7 rounded-full flex items-center justify-center transition-all shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {isSelected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No college hubs found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <span className="text-xs text-muted-foreground">
            {selectedIds.length === 0 ? "Select at least 1 college" : `${selectedIds.length} chosen`}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} className="h-9 px-4 text-xs font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || selectedIds.length === 0}
              className="h-9 px-5 text-xs font-black rounded-xl bg-foreground text-background"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
