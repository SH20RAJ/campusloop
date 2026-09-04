"use client";

import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ReportDialogProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "HARASSMENT", label: "Harassment or Bullying" },
  { value: "DOXXING", label: "Doxxing or Personal Info" },
  { value: "HATE_SPEECH", label: "Hate Speech" },
  { value: "SPAM", label: "Spam or Misleading" },
  { value: "OTHER", label: "Other Campus Guideline Violation" },
];

export function ReportDialog({ postId, isOpen, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState("HARASSMENT");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccess(true);
      toast.success("Thank you. The report has been submitted to campus moderators.");
      setTimeout(() => {
        setSuccess(false);
        setDetails("");
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="size-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground">Report Post</h2>
            <p className="text-xs text-muted-foreground">Keep your campus safe and constructive</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="size-10 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-foreground">Report Submitted</p>
            <p className="text-xs text-muted-foreground">Our campus safety team will review this shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="report-reason"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Reason
              </label>
              <div className="relative">
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-xs text-foreground font-semibold shadow-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer pr-9"
                >
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-card text-foreground">
                      {r.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="report-details"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Details (Optional)
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Explain the context for moderators..."
                className="w-full rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5 text-xs text-foreground shadow-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20 font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/80 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-destructive px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-destructive/90 transition-all cursor-pointer select-none disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
