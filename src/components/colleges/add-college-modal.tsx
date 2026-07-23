"use client";

import { School, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCollegeName: string;
  setNewCollegeName: (val: string) => void;
  newCollegeState: string;
  setNewCollegeState: (val: string) => void;
  newCollegeDistrict: string;
  setNewCollegeDistrict: (val: string) => void;
  newCollegeWebsite: string;
  setNewCollegeWebsite: (val: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddCollegeModal({
  isOpen,
  onClose,
  newCollegeName,
  setNewCollegeName,
  newCollegeState,
  setNewCollegeState,
  newCollegeDistrict,
  setNewCollegeDistrict,
  newCollegeWebsite,
  setNewCollegeWebsite,
  submitting,
  onSubmit,
}: AddCollegeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 tracking-tight">
            <School className="h-4 w-4 text-primary" /> Request New College Hub
          </h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">College / University Name *</label>
            <Input
              type="text"
              placeholder="e.g. St. Xavier's College, Mumbai"
              value={newCollegeName}
              onChange={(e) => setNewCollegeName(e.target.value)}
              required
              className="h-9 text-xs rounded-xl border border-border/60 bg-muted/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">State</label>
              <Input
                type="text"
                placeholder="e.g. Maharashtra"
                value={newCollegeState}
                onChange={(e) => setNewCollegeState(e.target.value)}
                className="h-9 text-xs rounded-xl border border-border/60 bg-muted/20 focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">District / City</label>
              <Input
                type="text"
                placeholder="e.g. Mumbai"
                value={newCollegeDistrict}
                onChange={(e) => setNewCollegeDistrict(e.target.value)}
                className="h-9 text-xs rounded-xl border border-border/60 bg-muted/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Website (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. xaviers.edu"
              value={newCollegeWebsite}
              onChange={(e) => setNewCollegeWebsite(e.target.value)}
              className="h-9 text-xs rounded-xl border border-border/60 bg-muted/20 focus:border-primary"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs font-semibold h-9 rounded-xl border border-border/60 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 text-xs font-semibold h-9 rounded-xl bg-primary text-primary-foreground cursor-pointer shadow-xs"
            >
              {submitting ? "Adding..." : "Create Campus Hub"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
