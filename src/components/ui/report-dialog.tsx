"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";

interface ReportDialogProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

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
      setTimeout(() => {
        setSuccess(false);
        setDetails("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <XIcon className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-semibold tracking-tight mb-4">Report Post</h2>

        {success ? (
          <div className="py-6 text-center text-sm font-medium text-green-500">
            Thank you. The report has been submitted for review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-ring"
              >
                <option value="HARASSMENT">Harassment or Bullying</option>
                <option value="DOXXING">Doxxing or Personal Info</option>
                <option value="HATE_SPEECH">Hate Speech</option>
                <option value="SPAM">Spam or Misleading</option>
                <option value="OTHER">Other Violation</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="details" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details (Optional)</label>
              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide additional details..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-input h-9 px-4 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-destructive h-9 px-4 text-sm font-medium text-white shadow-sm hover:bg-destructive/90 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
