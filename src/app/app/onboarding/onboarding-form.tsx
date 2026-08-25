"use client";

import { useState, useRef } from "react";
import { completeOnboarding } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, User, ShieldCheck, Check, AlertCircle, Upload, Loader2, GraduationCap, Tag, Cake, Lock } from "lucide-react";
import { validateDisplayName, validateUsername } from "@/lib/validation";
import { uploadImageToImgBB } from "@/lib/upload";
import { DEGREE_CATEGORIES, getBranchesForDegree } from "@/constants";
import { toast } from "sonner";

const POPULAR_INTERESTS = [
  "Tech & Coding",
  "Late Night Tea",
  "Hostel Life",
  "Campus Dating",
  "Gaming & Esports",
  "Startups & AI",
  "Music & Jamming",
  "Exam Prep",
  "Sports & Fitness",
  "Photography",
  "Memes & Banter",
  "Cinema & TV",
];

interface OnboardingFormProps {
  initialDisplayName?: string;
  initialUsername?: string;
  initialAvatarUrl?: string;
}

export function OnboardingForm({
  initialDisplayName = "",
  initialUsername = "",
  initialAvatarUrl = "",
}: OnboardingFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [course, setCourse] = useState("B.Tech");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [year, setYear] = useState(1);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [dob, setDob] = useState("");
  const [isDobPrivate, setIsDobPrivate] = useState(false);
  const [interests, setInterests] = useState<string[]>(["Tech & Coding 💻", "Hostel Life 🏢"]);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nameVal = displayName ? validateDisplayName(displayName) : null;
  const userVal = username ? validateUsername(username) : null;

  const currentDegreeBranches = getBranchesForDegree(course);

  function handleToggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handlePfpUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPfp(true);
    try {
      toast.loading("Uploading photo...", { id: "onb-pfp" });
      const res = await uploadImageToImgBB(file);
      setAvatarUrl(res.displayUrl || res.url);
      toast.success("Profile photo uploaded! 📸", { id: "onb-pfp" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo", { id: "onb-pfp" });
    } finally {
      setIsUploadingPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleGenerateAvatar() {
    const seed = username.trim() || displayName.trim() || String(Date.now());
    const generated = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(generated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const nameCheck = validateDisplayName(displayName);
    if (!nameCheck.isValid) {
      setError(nameCheck.error || "Please enter a valid display name");
      setIsLoading(false);
      return;
    }

    const userCheck = validateUsername(username);
    if (!userCheck.isValid) {
      setError(userCheck.error || "Please enter a valid username");
      setIsLoading(false);
      return;
    }

    if (!gender) {
      setError("Please select your gender identification (Required for campus matching & safety).");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("displayName", displayName.trim());
    formData.set("username", username.trim().toLowerCase());
    formData.set("gender", gender);
    formData.set("dob", dob);
    formData.set("isDobPrivate", String(isDobPrivate));
    formData.set("course", course.trim());
    formData.set("branch", branch.trim());
    formData.set("year", String(year));
    formData.set("bio", bio.trim());
    formData.set("interests", JSON.stringify(interests));
    formData.set("avatarUrl", avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`);

    try {
      await completeOnboarding(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  }

  const currentAvatar = avatarUrl || (username ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}` : "");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 select-none">
      {/* Hidden PFP File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePfpUpload}
      />

      {/* Avatar Picker */}
      <div className="flex flex-col items-center justify-center space-y-2.5 rounded-2xl border border-border/60 bg-muted/20 p-4 text-center">
        <Avatar className="h-20 w-20 border-2 border-primary/40 shadow-lg">
          <AvatarImage src={currentAvatar} />
          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
            {displayName ? displayName[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isUploadingPfp}
            onClick={() => fileInputRef.current?.click()}
            className="py-1.5 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {isUploadingPfp ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <Upload className="size-3.5 text-primary" />}
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateAvatar}
            className="py-1.5 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="size-3.5" /> Randomize
          </button>
        </div>
      </div>

      {/* Full / Display Name Input with Live Validation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="displayName" className="text-xs font-bold text-foreground flex items-center gap-1">
            <User className="size-3.5 text-primary" /> Full / Real Name <span className="text-destructive">*</span>
          </label>
          {nameVal && !nameVal.isValid && (
            <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
              <AlertCircle className="size-3" /> {nameVal.error}
            </span>
          )}
          {nameVal && nameVal.isValid && (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Check className="size-3" /> Valid name
            </span>
          )}
        </div>
        <input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="e.g. Aarav Sharma"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={`w-full rounded-xl border bg-muted/20 px-3.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none transition-all ${
            nameVal && !nameVal.isValid
              ? "border-destructive focus:border-destructive"
              : "border-border/60 focus:border-primary"
          }`}
        />
      </div>

      {/* Username Handle Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="username" className="text-xs font-bold text-foreground">
            Campus Username <span className="text-destructive">*</span>
          </label>
          {userVal && !userVal.isValid && (
            <span className="text-[10px] text-destructive font-semibold">{userVal.error}</span>
          )}
          {userVal && userVal.isValid && (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Check className="size-3" /> Valid handle
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-muted-foreground">@</span>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="aarav_sharma"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border bg-muted/20 text-xs font-semibold text-foreground focus:outline-none transition-all ${
              userVal && !userVal.isValid
                ? "border-destructive focus:border-destructive"
                : "border-border/60 focus:border-primary"
            }`}
          />
        </div>
      </div>

      {/* Gender Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground">Gender Identification <span className="text-destructive">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                gender === g
                  ? "border-primary bg-primary/10 text-primary shadow-xs"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              {g === "MALE" ? "Male" : g === "FEMALE" ? "Female" : "Other"}
            </button>
          ))}
        </div>
      </div>

      {/* Birthday / Date of Birth */}
      <div className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="dob" className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Cake className="size-4 text-pink-500" /> Date of Birth (DOB)
          </label>
          <span className="text-[10px] text-muted-foreground font-medium">Optional</span>
        </div>

        <input
          id="dob"
          type="date"
          value={dob}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDob(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary outline-none"
        />

        <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDobPrivate}
            onChange={(e) => setIsDobPrivate(e.target.checked)}
            className="size-3.5 rounded border-border accent-primary cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <Lock className="size-3 text-muted-foreground" /> Keep my birthday private (hide from campus birthday calendar)
          </span>
        </label>
      </div>

      {/* Degree, Branch & Year Catalog */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <GraduationCap className="size-4 text-primary" /> Academic Degree & Branch
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Degree Level</label>
            <select
              value={course}
              onChange={(e) => {
                const newCourse = e.target.value;
                setCourse(newCourse);
                const branches = getBranchesForDegree(newCourse);
                if (branches.length > 0) setBranch(branches[0]);
              }}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary outline-none"
            >
              {DEGREE_CATEGORIES.map((cat) => (
                <optgroup key={cat.category} label={cat.category}>
                  {cat.degrees.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Year of Study</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary outline-none"
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  Year {y} {y === 1 ? "(Freshman / First Year)" : y === 4 ? "(Senior / Final Year)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentDegreeBranches.length > 0 && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">Specialization / Department</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary outline-none"
            >
              {currentDegreeBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Interests Selection for Personalization & Matchmaking */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Tag className="size-3.5 text-primary" /> Campus Interests & Vibes
        </label>
        <p className="text-[10px] text-muted-foreground">Pick topics you care about to personalize your feed & matches.</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {POPULAR_INTERESTS.map((tag) => {
            const isSelected = interests.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleInterest(tag)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/15 text-primary shadow-xs"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Bio */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Campus Bio</label>
        <textarea
          rows={2}
          placeholder="Tell your college what you study, build, or what's your vibe..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-muted/20 p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs font-semibold text-destructive text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || Boolean(nameVal && !nameVal.isValid) || Boolean(userVal && !userVal.isValid) || isUploadingPfp}
        className="mt-2 flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/95 disabled:opacity-50 shadow-md cursor-pointer"
      >
        <ShieldCheck className="size-4 mr-1.5" />
        {isLoading ? "Setting up profile..." : "Complete Setup & Enter Campus 🚀"}
      </button>
    </form>
  );
}
