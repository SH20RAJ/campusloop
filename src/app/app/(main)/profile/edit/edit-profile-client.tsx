"use client";

import {
  AlertCircle,
  ArrowLeft,
  Cake,
  Camera,
  Check,
  Image as ImageIcon,
  Loader2,
  Lock,
  Move,
  Plus,
  Save,
  ShieldCheck,
  Upload,
  User,
  VenetianMask,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { isUsernameBlocking, UsernameStatusHint } from "@/components/ui/username-status";
import { getBranchOptionsForDegree } from "@/constants";
import { useProfile } from "@/hooks/use-profile";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { uploadImageToImgBB } from "@/lib/upload";
import { getAvatarUrl } from "@/lib/utils";
import { validateDisplayName, validateUsername } from "@/lib/validation";

const INTEREST_SUGGESTIONS = [
  "Tech & Coding",
  "Late Night Tea",
  "Hostel Life",
  "Exam Prep",
  "Music & Jamming",
  "Campus Dating",
  "Gaming",
  "Sports",
  "Photography",
  "Startups & AI",
];

export function EditProfileClient() {
  const router = useRouter();
  const { profile, isLoading: isProfileLoading, mutate } = useProfile();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dob, setDob] = useState("");
  const [isDobPrivate, setIsDobPrivate] = useState(false);
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState<number>(1);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [anonUsername, setAnonUsername] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploadingDatingPhoto, setIsUploadingDatingPhoto] = useState(false);

  // Crop Modal States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropMode, setCropMode] = useState<"avatar" | "banner">("avatar");

  const pfpInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const datingPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const nameVal = displayName ? validateDisplayName(displayName) : null;
  const userVal = username ? validateUsername(username) : null;
  const usernameStatus = useUsernameAvailability(username);
  const branchOptions = getBranchOptionsForDegree(course).map((b) => ({
    value: b.name,
    label: b.name,
    icon: b.icon,
  }));

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUsername(profile.username || "");
      setHeadline(profile.headline || "");
      setGender((profile.gender as "MALE" | "FEMALE" | "OTHER") || "MALE");
      setDob(profile.dob || "");
      setIsDobPrivate(Boolean(profile.isDobPrivate));
      setCourse(profile.course || "");
      setBranch(profile.branch || "");
      setYear(profile.year || 1);
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
      setBannerUrl(profile.bannerUrl || "");
      setAnonUsername(profile.anonymousUsername || "");
      setPhotos(profile.photos || []);
      setInterests(profile.interests || []);
    }
  }, [profile]);

  function handleToggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handlePfpFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageUrl(reader.result);
        setCropMode("avatar");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (pfpInputRef.current) pfpInputRef.current.value = "";
  }

  function handleBannerFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropImageUrl(reader.result);
        setCropMode("banner");
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function handleOpenCropForCurrent(mode: "avatar" | "banner") {
    const targetUrl = mode === "avatar" ? avatarUrl : bannerUrl;
    if (!targetUrl) {
      if (mode === "avatar") pfpInputRef.current?.click();
      else bannerInputRef.current?.click();
      return;
    }
    setCropImageUrl(targetUrl);
    setCropMode(mode);
    setCropModalOpen(true);
  }

  async function handleDatingPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= 6) {
      toast.error("Maximum 6 dating photos allowed.");
      return;
    }

    setIsUploadingDatingPhoto(true);
    try {
      toast.loading("Uploading dating photo...", { id: "dating-photo" });
      const res = await uploadImageToImgBB(file);
      const newUrl = res.displayUrl || res.url;
      setPhotos((prev) => [...prev, newUrl]);
      toast.success("Photo added to dating gallery! 📸", { id: "dating-photo" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed", { id: "dating-photo" });
    } finally {
      setIsUploadingDatingPhoto(false);
      if (datingPhotoInputRef.current) datingPhotoInputRef.current.value = "";
    }
  }

  function handleRemoveDatingPhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleGenerateDiceBearAvatar() {
    const seed = username.trim() || displayName.trim() || "student";
    const generated = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
    setAvatarUrl(generated);
    toast.success("Generated new Campus avatar! 🎨");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const nameCheck = validateDisplayName(displayName);
    if (!nameCheck.isValid) {
      setError(nameCheck.error || "Please provide a valid display name.");
      setIsSaving(false);
      return;
    }

    const userCheck = validateUsername(username);
    if (!userCheck.isValid) {
      setError(userCheck.error || "Please provide a valid username.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim().toLowerCase(),
          headline: headline.trim(),
          gender,
          dob: dob ? dob : null,
          isDobPrivate,
          course: course.trim(),
          branch: branch.trim(),
          year,
          bio: bio.trim(),
          avatarUrl,
          bannerUrl,
          photos,
          interests,
          anonymousUsername: anonUsername ? anonUsername.trim().toLowerCase().replace(/^@/, "") : null,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile & dating photos saved!");
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
        <Zap className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16 pt-2 px-4 select-none">
      {/* Image Crop & Resize Modal */}
      {cropModalOpen && (
        <ImageCropModal
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageUrl={cropImageUrl}
          mode={cropMode}
          onCropComplete={(croppedUrl) => {
            if (cropMode === "avatar") {
              setAvatarUrl(croppedUrl);
            } else {
              setBannerUrl(croppedUrl);
            }
          }}
        />
      )}

      {/* Hidden PFP File Input */}
      <input
        ref={pfpInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePfpFileSelected}
      />

      {/* Hidden Banner File Input */}
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleBannerFileSelected}
      />

      {/* Hidden Dating Photo File Input */}
      <input
        ref={datingPhotoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleDatingPhotoUpload}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Link
          href="/app/profile"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Profile
        </Link>
        <h2 className="text-sm font-bold text-foreground">Edit Profile & Dating Photos</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Cover Banner & Avatar Section ─── */}
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
          {/* Banner Preview */}
          <div className="relative h-36 w-full bg-linear-to-r from-orange-500/25 via-primary/30 to-amber-500/25">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            )}

            <div className="absolute top-3 right-3 flex items-center gap-2">
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenCropForCurrent("banner")}
                  className="py-1.5 px-3 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-md"
                  title="Reposition / Crop Banner"
                >
                  <Move className="size-3.5" />
                  <span>Reposition</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="py-1.5 px-3 rounded-xl bg-black/70 hover:bg-black/85 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer shadow-md"
              >
                <Camera className="size-3.5" />
                <span>{bannerUrl ? "Change" : "Upload Banner"}</span>
              </button>
            </div>
          </div>

          {/* Avatar Row */}
          <div className="p-5 flex flex-col sm:flex-row items-center gap-4 -mt-14">
            <div className="relative group shrink-0">
              <Avatar className="size-24 border-4 border-card shadow-xl">
                <AvatarImage src={avatarUrl || getAvatarUrl(null, username || "user")} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {displayName ? displayName[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenCropForCurrent("avatar")}
                  className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Resize & Crop Avatar"
                >
                  <Move className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 sm:pt-8">
              <button
                type="button"
                onClick={() => pfpInputRef.current?.click()}
                className="py-1.5 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Upload className="size-3.5 text-primary" />
                <span>Upload Avatar</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenCropForCurrent("avatar")}
                  className="py-1.5 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Move className="size-3.5 text-primary" />
                  <span>Resize & Crop</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleGenerateDiceBearAvatar}
                className="py-1.5 px-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="size-3.5" /> Randomize
              </button>
            </div>
          </div>
        </div>

        {/* ─── Campus Dating Photo Gallery Section (Up to 6 Photos) ─── */}
        <div className="space-y-3 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-rose-500" /> Dating Photo Gallery
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upload up to 6 pictures to showcase on your Campus Dating swipe card.
              </p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              {photos.length}/6
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {photos.map((imgUrl, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border/80 shadow-xs group bg-muted/40"
              >
                <img src={imgUrl} alt={`Dating photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveDatingPhoto(i)}
                  className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-destructive transition-colors cursor-pointer shadow-md"
                  title="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                    Main
                  </span>
                )}
              </div>
            ))}

            {photos.length < 6 && (
              <button
                type="button"
                disabled={isUploadingDatingPhoto}
                onClick={() => datingPhotoInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploadingDatingPhoto ? (
                  <Loader2 className="size-5 animate-spin text-primary" />
                ) : (
                  <>
                    <Plus className="size-5" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ─── Basic Details (Display Name & Username) with Validation ─── */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-primary" /> Identity Details
          </h3>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Full / Display Name</label>
              {nameVal && !nameVal.isValid && (
                <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                  <AlertCircle className="size-3" /> {nameVal.error}
                </span>
              )}
              {nameVal?.isValid && (
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="size-3" /> Valid name
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className={`w-full rounded-xl border bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none transition-all ${
                nameVal && !nameVal.isValid
                  ? "border-destructive focus:border-destructive"
                  : "border-border/60 focus:border-primary focus:bg-background"
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Campus Username (@handle)</label>
              <UsernameStatusHint status={usernameStatus} />
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-muted-foreground">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className={`w-full pl-8 pr-3.5 py-2 rounded-xl border bg-muted/20 text-xs font-semibold text-foreground outline-none transition-all ${
                  usernameStatus.state === "taken" || usernameStatus.state === "invalid"
                    ? "border-destructive focus:border-destructive"
                    : usernameStatus.state === "available"
                      ? "border-emerald-500/60 focus:bg-background"
                      : "border-border/60 focus:border-primary focus:bg-background"
                }`}
              />
            </div>
          </div>

          {/* Student Headline / Tagline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">
                Profile Headline / Tagline
              </label>
              <span className="text-[10px] text-muted-foreground">{headline.length}/100</span>
            </div>
            <input
              type="text"
              maxLength={100}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. CS Sophomore @ BIT Mesra | Building AI agents & web apps"
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary focus:bg-background"
            />
          </div>

          {/* Gender Selector */}
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
                  {g === "MALE" ? "Male" : g === "FEMALE" ? "Female" : "Other"}
                </button>
              ))}
            </div>
          </div>

          {/* Birthday / Date of Birth */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-dob"
                className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
              >
                <Cake className="size-3.5 text-pink-500" /> Birthday / Date of Birth
              </label>
              <span className="text-[10px] text-muted-foreground">Used for campus birthday wishes</span>
            </div>
            <input
              id="edit-dob"
              type="date"
              value={dob}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none transition-all focus:border-primary focus:bg-background"
            />
            <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDobPrivate}
                onChange={(e) => setIsDobPrivate(e.target.checked)}
                className="size-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Lock className="size-3 text-muted-foreground" /> Keep birthday private (do not display in
                campus celebrations)
              </span>
            </label>
          </div>
        </div>

        {/* ─── Anonymous Posting Persona (Custom Anonymous Username) ─── */}
        <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <VenetianMask className="size-4 text-primary" /> Anonymous Persona & Custom Username
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Create a custom anonymous alias for confessions, polls, and anonymous questions. All your
                anonymous posts will appear under this username instead of a random ID. Your real identity
                remains 100% cryptographically sealed.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
              Encrypted
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground">Custom Anonymous Username</label>
              {anonUsername && (
                <span className="text-[10px] text-primary font-bold">
                  Posts appear as: @{anonUsername.toLowerCase().replace(/^@/, "")}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2 text-xs font-bold text-muted-foreground">🎭 @</span>
              <input
                type="text"
                value={anonUsername}
                onChange={(e) => setAnonUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="e.g. ghost_student, shadow_coder, campus_ninja"
                maxLength={24}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-border/60 bg-background text-xs font-semibold text-foreground outline-none transition-all focus:border-primary"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Leave blank to automatically use randomized cryptographic pseudonyms (e.g. anon_9a4f21b7).
            </p>
          </div>
        </div>

        {/* ─── Academic Info with Presets ─── */}
        <div className="space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-xs">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-blue-500" /> Academic & Campus Info
          </h3>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Degree / Course</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pb-1">
                {["B.Tech", "B.Arch", "MCA", "MBA", "MBBS", "BBA", "B.Com", "BCA", "PhD", "M.Tech"].map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCourse(c)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                        course === c
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  )
                )}
              </div>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Or type custom course (e.g. B.Arch, MCA, PhD Physics)..."
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Department / Branch</label>
              {/*
                Was a hardcoded 10-chip list whose labels did not match the
                catalog ("Civil Engineering" vs "Civil & Structural
                Engineering"), so a chip stored a branch that never resolved to
                a directory slug. Now driven by the catalog itself.
              */}
              <SearchableSelect
                options={branchOptions}
                value={branch}
                onChange={setBranch}
                placeholder="Select your branch"
                searchPlaceholder="Search branches..."
                emptyText="No branch matches. Pick 'Other / Not listed'."
              />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Or type a custom branch/major..."
                className="w-full rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary focus:bg-background transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Academic Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  Year {y} Student {y === 1 ? "(Fresher)" : y >= 4 ? "(Senior/Final)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── Bio & Campus Interests ─── */}
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

        {error && <p className="text-xs font-semibold text-destructive text-center">{error}</p>}

        {/* Action Button */}
        <button
          type="submit"
          disabled={
            isSaving ||
            Boolean(nameVal && !nameVal.isValid) ||
            Boolean(userVal && !userVal.isValid) ||
            isUsernameBlocking(usernameStatus) ||
            isUploadingDatingPhoto
          }
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
        >
          <Save className="size-4" />
          {isSaving ? "Saving changes..." : "Save Profile & Dating Photos"}
        </button>
      </form>
    </div>
  );
}
