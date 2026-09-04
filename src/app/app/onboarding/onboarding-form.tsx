"use client";

import { AlertCircle, Camera, Check, Loader2, Lock, School, Search, Zap } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { isUsernameBlocking, UsernameStatusHint } from "@/components/ui/username-status";
import { DEGREE_CATEGORIES, getBranchOptionsForDegree } from "@/constants";
import { useColleges } from "@/hooks/use-colleges";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn, getAvatarUrl } from "@/lib/utils";
import { validateDisplayName, validateUsername } from "@/lib/validation";
import { completeOnboarding } from "./actions";

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

/** What an aspirant is preparing for, in place of a degree and branch. */
const TARGET_EXAMS = ["JEE Main", "JEE Advanced", "NEET", "CUET", "BITSAT", "CAT", "GATE", "Still deciding"];

const ASPIRANT_STAGES = ["Class 11", "Class 12", "Drop year", "Awaiting results", "Just exploring"];

const MAX_DREAM_CAMPUSES = 5;

interface OnboardingFormProps {
  initialDisplayName?: string;
  initialUsername?: string;
  initialAvatarUrl?: string;
  /**
   * `student` is the verified college-email flow. `viewer` is Campus Preview:
   * an aspirant signing up with a personal email, who has no branch or year yet
   * and picks the campuses they are aiming for instead.
   */
  variant?: "student" | "viewer";
}

/** Shared label styling, so every field reads the same way. */
function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[13px] font-bold text-foreground">
        {children}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {hint}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-border/60 bg-transparent px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary";

const selectClass =
  "w-full rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary";

/** Rounded-full choice pill, matching the filter pills used across the app. */
function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95",
        selected
          ? "bg-foreground font-black text-background"
          : "border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function OnboardingForm({
  initialDisplayName = "",
  initialUsername = "",
  initialAvatarUrl = "",
  variant = "student",
}: OnboardingFormProps) {
  const isViewer = variant === "viewer";

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
  const [interests, setInterests] = useState<string[]>(["Tech & Coding", "Hostel Life"]);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Aspirant-only state
  const [targetExam, setTargetExam] = useState("JEE Main");
  const [aspirantStage, setAspirantStage] = useState("Class 12");
  const [dreamCampusIds, setDreamCampusIds] = useState<string[]>([]);
  const [campusQuery, setCampusQuery] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nameVal = displayName ? validateDisplayName(displayName) : null;
  const userVal = username ? validateUsername(username) : null;
  const usernameStatus = useUsernameAvailability(username);
  const currentDegreeBranches = getBranchOptionsForDegree(course);
  const branchOptions = currentDegreeBranches.map((b) => ({
    value: b.name,
    label: b.name,
    icon: b.icon,
  }));

  const { colleges } = useColleges(120);

  const visibleCampuses = useMemo(() => {
    if (!colleges) return [];
    const q = campusQuery.trim().toLowerCase();
    if (!q) return colleges.slice(0, 8);
    return colleges
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.state?.toLowerCase().includes(q) ||
          c.district?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [colleges, campusQuery]);

  const selectedCampuses = useMemo(
    () => (colleges || []).filter((c) => dreamCampusIds.includes(c.id)),
    [colleges, dreamCampusIds]
  );

  function toggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function toggleDreamCampus(id: string) {
    setDreamCampusIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= MAX_DREAM_CAMPUSES) {
        toast.info(`You can pick up to ${MAX_DREAM_CAMPUSES} campuses`);
        return prev;
      }
      return [...prev, id];
    });
  }

  async function handlePfpUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPfp(true);
    try {
      toast.loading("Uploading photo...", { id: "onb-pfp" });
      const res = await uploadImageToImgBB(file);
      setAvatarUrl(res.displayUrl || res.url);
      toast.success("Photo updated", { id: "onb-pfp" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo", { id: "onb-pfp" });
    } finally {
      setIsUploadingPfp(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const [showIllustrationOption, setShowIllustrationOption] = useState(false);

  function handleGenerateAvatar() {
    const seed = username.trim() || displayName.trim() || String(Date.now());
    setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`);
    toast.info("Illustration set. Real student photos get 3x higher campus visibility!");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.set("displayName", displayName);
    formData.set("username", username);
    formData.set("gender", gender);
    formData.set("avatarUrl", avatarUrl);
    formData.set("bio", bio);
    formData.set("dob", dob);
    formData.set("isDobPrivate", String(isDobPrivate));
    formData.set("interests", JSON.stringify(interests));

    if (isViewer) {
      // An aspirant has no degree or year yet: record what they are preparing
      // for and which campuses they are aiming at instead.
      formData.set("course", "Aspirant");
      formData.set("branch", targetExam);
      formData.set("aspirantStage", aspirantStage);
      formData.set("targetInstitutionIds", JSON.stringify(dreamCampusIds));
    } else {
      formData.set("course", course);
      formData.set("branch", branch);
      formData.set("year", String(year));
    }

    try {
      await completeOnboarding(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  }

  const isRealPhoto = Boolean(avatarUrl && !avatarUrl.includes("dicebear.com"));
  const currentAvatar = avatarUrl || getAvatarUrl(null, username, displayName);

  const submitDisabled =
    isLoading ||
    Boolean(nameVal && !nameVal.isValid) ||
    Boolean(userVal && !userVal.isValid) ||
    isUsernameBlocking(usernameStatus) ||
    isUploadingPfp;

  return (
    <form onSubmit={handleSubmit} className="select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePfpUpload}
      />

      {/* ─── Photo Section with Psychology Incentive ─── */}
      <section className="space-y-3 py-6 border-b border-border/40">
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer shrink-0"
          >
            <Avatar className="size-20 border-2 border-primary/30 shadow-md group-hover:border-primary transition-all">
              <AvatarImage src={currentAvatar} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-xl font-black text-primary">
                {displayName ? displayName[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="size-5" />
            </div>
          </div>

          <div className="min-w-0 space-y-2 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <span>Profile Photo</span>
                {isRealPhoto ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="size-2.5" /> Real Photo Verified (+50 LP)
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    🎁 +50 LP Clout Reward
                  </span>
                )}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isUploadingPfp}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {isUploadingPfp ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5 stroke-[2.5]" />
                )}
                <span>{isRealPhoto ? "Change Real Photo" : "Upload Real Photo (+50 LP)"}</span>
              </button>
            </div>

            {/* Social Proof & Psychology Text */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isRealPhoto
                ? "✨ Great photo! Your profile will be boosted across campus dating, study pods & college feeds."
                : "💡 Verified profiles with real photos get 3x more friend connections, dating matches, and instant trust on campus."}
            </p>
          </div>
        </div>

        {/* Discreet / Harder to choose illustration option */}
        {!isRealPhoto && (
          <div className="pt-1">
            {!showIllustrationOption ? (
              <button
                type="button"
                onClick={() => setShowIllustrationOption(true)}
                className="text-[11px] font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
              >
                Need a temporary illustration instead? ▾
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-muted/20 border border-border/50 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-start gap-2 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>
                    Note: Illustrated avatars receive 60% fewer matches and do not unlock the 50 LP verified
                    clout reward.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    className="px-3 py-1 rounded-full border border-border/70 bg-card text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Zap className="size-3 inline mr-1" /> Use Cartoon Avatar Anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIllustrationOption(false)}
                    className="text-[11px] text-muted-foreground hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Identity ─── */}
      <section className="space-y-4 border-t border-border/40 py-6">
        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="displayName"
            required
            hint={
              nameVal && !nameVal.isValid ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                  <AlertCircle className="size-3" /> {nameVal.error}
                </span>
              ) : nameVal?.isValid ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : null
            }
          >
            Full name
          </FieldLabel>
          <input
            id="displayName"
            type="text"
            placeholder="Aarav Sharma"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={cn(inputClass, nameVal && !nameVal.isValid && "border-destructive")}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="username" required hint={<UsernameStatusHint status={usernameStatus} />}>
            Username
          </FieldLabel>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
              @
            </span>
            <input
              id="username"
              type="text"
              placeholder="aarav_sharma"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                inputClass,
                "pl-8",
                usernameStatus.state === "taken" || usernameStatus.state === "invalid"
                  ? "border-destructive"
                  : usernameStatus.state === "available" && "border-emerald-500/60"
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel required>Gender</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
              <Pill key={g} selected={gender === g} onClick={() => setGender(g)}>
                {g === "MALE" ? "Male" : g === "FEMALE" ? "Female" : "Other"}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel
            htmlFor="dob"
            hint={<span className="text-[11px] text-muted-foreground">Optional</span>}
          >
            Date of birth
          </FieldLabel>
          <input
            id="dob"
            type="date"
            value={dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDob(e.target.value)}
            className={inputClass}
          />
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
            <input
              type="checkbox"
              checked={isDobPrivate}
              onChange={(e) => setIsDobPrivate(e.target.checked)}
              className="size-3.5 cursor-pointer rounded border-border accent-primary"
            />
            <span className="flex items-center gap-1">
              <Lock className="size-3" /> Hide from the campus birthday calendar
            </span>
          </label>
        </div>
      </section>

      {/* ─── Academics (student) or Preparation (aspirant) ─── */}
      {isViewer ? (
        <section className="space-y-5 border-t border-border/40 py-6">
          <div className="space-y-2">
            <FieldLabel>Where are you right now?</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {ASPIRANT_STAGES.map((stage) => (
                <Pill key={stage} selected={aspirantStage === stage} onClick={() => setAspirantStage(stage)}>
                  {stage}
                </Pill>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel>Preparing for</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {TARGET_EXAMS.map((exam) => (
                <Pill key={exam} selected={targetExam === exam} onClick={() => setTargetExam(exam)}>
                  {exam}
                </Pill>
              ))}
            </div>
          </div>

          {/* Dream campuses */}
          <div className="space-y-2.5">
            <FieldLabel
              hint={
                <span className="text-[11px] text-muted-foreground">
                  {dreamCampusIds.length}/{MAX_DREAM_CAMPUSES}
                </span>
              }
            >
              Campuses you&apos;re aiming for
            </FieldLabel>
            <p className="text-[13px] text-muted-foreground">
              We&apos;ll bring their confessions, placement threads and fest buzz into your feed.
            </p>

            {selectedCampuses.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedCampuses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleDreamCampus(c.id)}
                    className="flex cursor-pointer items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black text-primary hover:bg-primary/20"
                  >
                    {c.name.split(",")[0]}
                    <span aria-hidden>×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search colleges"
                value={campusQuery}
                onChange={(e) => setCampusQuery(e.target.value)}
                className={cn(inputClass, "pl-10")}
              />
            </div>

            <div className="divide-y divide-border/30 overflow-hidden rounded-xl border border-border/50">
              {visibleCampuses.length > 0 ? (
                visibleCampuses.map((c) => {
                  const selected = dreamCampusIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleDreamCampus(c.id)}
                      className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/25"
                    >
                      <School className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-foreground">{c.name}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {[c.district, c.state].filter(Boolean).join(", ") || "India"}
                        </span>
                      </span>
                      {selected && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  );
                })
              ) : (
                <p className="px-3.5 py-4 text-[13px] text-muted-foreground">No colleges found.</p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-4 border-t border-border/40 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="degree">Degree</FieldLabel>
              <select
                id="degree"
                value={course}
                onChange={(e) => {
                  const next = e.target.value;
                  setCourse(next);
                  // Keep the current branch when the new degree still offers it.
                  const branches = getBranchOptionsForDegree(next);
                  if (!branches.some((b) => b.name === branch) && branches.length > 0) {
                    setBranch(branches[0].name);
                  }
                }}
                className={selectClass}
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

            <div className="space-y-1.5">
              <FieldLabel htmlFor="year">Year</FieldLabel>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={selectClass}
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {branchOptions.length > 0 && (
            <div className="space-y-1.5">
              <FieldLabel htmlFor="branch">Branch</FieldLabel>
              <SearchableSelect
                id="branch"
                options={branchOptions}
                value={branch}
                onChange={setBranch}
                placeholder="Select your branch"
                searchPlaceholder="Search branches..."
                emptyText="No branch matches. Pick 'Other / Not listed'."
              />
            </div>
          )}
        </section>
      )}

      {/* ─── Interests ─── */}
      <section className="space-y-2.5 border-t border-border/40 py-6">
        <FieldLabel>Interests</FieldLabel>
        <p className="text-[13px] text-muted-foreground">
          Used to personalise your feed. Pick as many as you like.
        </p>
        <div className="flex flex-wrap gap-2 pt-0.5">
          {POPULAR_INTERESTS.map((tag) => (
            <Pill key={tag} selected={interests.includes(tag)} onClick={() => toggleInterest(tag)}>
              {tag}
            </Pill>
          ))}
        </div>
      </section>

      {/* ─── Bio ─── */}
      <section className="space-y-1.5 border-t border-border/40 py-6">
        <FieldLabel htmlFor="bio" hint={<span className="text-[11px] text-muted-foreground">Optional</span>}>
          Bio
        </FieldLabel>
        <textarea
          id="bio"
          rows={3}
          placeholder={
            isViewer
              ? "What are you hoping to find out about these campuses?"
              : "What do you study, build, or care about?"
          }
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={cn(inputClass, "resize-none")}
        />
      </section>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[13px] font-semibold text-destructive">
          {error}
        </div>
      )}

      {/* ─── Submit ─── */}
      <div className="sticky bottom-0 -mx-4 border-t border-border/40 bg-background/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <button
          type="submit"
          disabled={submitDisabled}
          className="flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Setting up
            </>
          ) : isViewer ? (
            "Start exploring"
          ) : (
            "Enter your campus"
          )}
        </button>
      </div>
    </form>
  );
}
