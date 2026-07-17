"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";
import { Edit2 } from "lucide-react";

interface EditProfileDialogProps {
  initialDisplayName: string;
  initialBio: string | null;
  initialUsername: string;
  initialAvatarUrl: string | null;
}

export function EditProfileDialog({
  initialDisplayName,
  initialBio,
  initialUsername,
  initialAvatarUrl
}: EditProfileDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio || "");
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateProfile(displayName, bio, username, avatarUrl);
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
        className="flex items-center gap-2 rounded-xl border border-input h-9 px-4 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer"
      >
        <Edit2 className="h-3.5 w-3.5" /> Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Edit Profile</h3>
              <p className="text-[10px] text-muted-foreground font-semibold">Update your display name, username, bio, and profile picture.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Profile Picture URL</label>
                <input
                  type="text"
                  placeholder="https://api.dicebear.com/7.x/adventurer/svg?seed=username"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs focus:ring-1 focus:ring-ring outline-none font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share something about yourself..."
                  className="w-full rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-ring outline-none resize-none font-semibold"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/15 p-3 text-xs text-destructive border border-destructive/20 font-bold">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-border h-9 px-4 text-xs font-bold hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-primary h-9 px-4 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer disabled:opacity-50"
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
