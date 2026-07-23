"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Sparkles, ArrowLeft, Save, ShieldCheck, Lock, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

const INTEREST_SUGGESTIONS = [
  "Tech & Coding 💻",
  "Late Night Tea ☕",
  "Hostel Life 🏢",
  "Exam Stress 📚",
  "Music & Jamming 🎸",
  "Campus Dating 💕",
  "Gaming 🎮",
  "Sports ⚽",
  "Photography 📸",
  "Startups 🚀",
];

export function EditProfileClient() {
  const router = useRouter();
  const { profile, isLoading: isProfileLoading, mutate } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number>(1);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUsername(profile.username || "");
      setGender((profile.gender as "MALE" | "FEMALE" | "OTHER") || "MALE");
      setCourse(profile.course || "");
      setBranch(profile.branch || "");
      setYear(profile.year || 1);
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
      setInterests(profile.interests || []);
    }
  }, [profile]);

  function handleToggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleGenerateDiceBearAvatar() {
    const seed = username.trim() || "student";
    const generated = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(generated);
    toast.success("Generated new Campus avatar! 🎨");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          gender,
          course,
          branch,
          year,
          bio,
          avatarUrl,
          interests,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile updated successfully! ✨");
      await mutate();
      router.push("/app/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Sparkles className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 pt-2 px-4 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Link
          href="/app/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </Link>
        <h2 className="text-sm font-bold text-foreground">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-5 text-center">
          <Avatar className="h-24 w-24 border-2 border-primary/30 shadow-md">
            <AvatarImage src={avatarUrl || getAvatarUrl(null, username || "user")} />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {displayName ? displayName[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerateDiceBearAvatar}
              className="py-1.5 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
            >
              🎲 Generate Adventurer Avatar
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="py-1.5 px-3 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Default
              </button>
            )}
          </div>
        </div>

        {/* Basic Details (Display Name & Username) */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-primary" /> Identity Details
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Display Name (2-50 chars)</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name or handle"
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Campus Username (@handle)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-muted-foreground">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-all"
              />
            </div>
          </div>

          {/* Gender Selector as requested by user */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-muted-foreground">Gender Identification</label>
            <div className="grid grid-cols-3 gap-2">
              {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    gender === g
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g === "MALE" ? "👨 Male" : g === "FEMALE" ? "👩 Female" : "✨ Other"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-blue-500" /> Academic & Campus Info
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Course</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech, MBA, MBBS..."
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Branch / Dept</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="CSE, ECE, Finance..."
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Academic Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  Year {y} Student
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bio & Campus Interests */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Campus Bio (max 300 chars)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what you study, hostel tea, or what you are looking for on CampusLoop..."
              className="w-full rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-all resize-none"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-muted-foreground">Select Campus Interests</label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_SUGGESTIONS.map((tag) => {
                const isSelected = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleInterest(tag)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-destructive text-center">{error}</p>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          <Save className="size-4" />
          {isSaving ? "Saving changes..." : "Save Profile Changes"}
        </button>
      </form>
    </div>
  );
}
