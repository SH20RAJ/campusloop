"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { Edit2 } from "lucide-react";

interface EditProfileDialogProps {
  initialDisplayName: string;
  initialBio: string | null;
}

export function EditProfileDialog({ initialDisplayName, initialBio }: EditProfileDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(displayName, bio);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-input h-9 px-4 text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
      >
        <Edit2 className="h-4 w-4" /> Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>
              <p className="text-xs text-muted-foreground">Update your display name and campus bio.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share something about yourself..."
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:ring-ring outline-none resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-input h-9 px-4 text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-primary h-9 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
