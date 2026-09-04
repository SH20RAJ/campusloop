"use client";

import {
  BookOpen,
  Check,
  Code2,
  Coffee,
  Globe,
  Home,
  Image as ImageIcon,
  Loader2,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
  Users2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserProfile } from "@/db/schema";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onGroupCreated: (newConversationId: string, createdConv?: any) => void;
}

const GROUP_CATEGORIES = [
  {
    id: "STUDY_POD",
    label: "Study Pod",
    icon: BookOpen,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "PROJECT_TEAM",
    label: "Project / Hackathon",
    icon: Code2,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "CAMPUS_CLUB",
    label: "Club & Society",
    icon: Trophy,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "HOSTEL_FLAT",
    label: "Hostel & Flat",
    icon: Home,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "GENERAL_HANG",
    label: "Campus Hangout",
    icon: Coffee,
    color: "text-pink-500 bg-pink-500/10 border-pink-500/30",
  },
] as const;

export function CreateGroupModal({ isOpen, onClose, currentUserId, onGroupCreated }: CreateGroupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("STUDY_POD");
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Members selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle("");
      setDescription("");
      setCategory("STUDY_POD");
      setScope("CAMPUS");
      setAvatarUrl("");
      setSelectedMembers([]);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen]);

  // Search users for member selection
  useEffect(() => {
    if (!isOpen || step !== 2) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/chat/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const users = (await res.json()) as UserProfile[];
          // Filter out current user
          setSearchResults(users.filter((u) => u.id !== currentUserId));
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, isOpen, step, currentUserId]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      toast.loading("Uploading group avatar...", { id: "grp-avatar" });
      const uploaded = await uploadImageToImgBB(file);
      setAvatarUrl(uploaded.displayUrl || uploaded.url);
      toast.success("Group avatar updated! 🎨", { id: "grp-avatar" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar", { id: "grp-avatar" });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleToggleMember(user: UserProfile) {
    sounds.tap();
    haptics.light();
    setSelectedMembers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  }

  async function handleCreateGroup() {
    if (!title.trim()) {
      toast.error("Please enter a group name");
      setStep(1);
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least 1 member to add to the group");
      return;
    }

    setIsCreating(true);
    sounds.pop();
    haptics.success();

    const toastId = "create-group-toast";
    toast.loading("Creating campus group...", { id: toastId });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GROUP",
          title: title.trim(),
          avatarUrl: avatarUrl || undefined,
          category,
          scope,
          participantIds: selectedMembers.map((m) => m.id),
          content: `🎉 Welcome to "${title.trim()}"! Study, collaborate, and share campus vibes here.`,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || "Failed to create group");
      }

      const data = (await res.json()) as { id: string };
      toast.success("Group created successfully! 🚀", { id: toastId });
      onClose();
      onGroupCreated(data.id, data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create group", { id: toastId });
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] h-[650px] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />

        {/* ─── Modal Header ─── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3.5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-2xs">
              <Users2 className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-foreground">
                {step === 1 ? "Create Campus Group" : "Add Group Members"}
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {step === 1
                  ? "Step 1 of 2 · Group Details & Style"
                  : `Step 2 of 2 · ${selectedMembers.length} selected`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* ─── Step 1: Group Basics ─── */}
        {step === 1 && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Avatar & Name Input Row */}
            <div className="flex items-center gap-3.5">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="size-16 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 shadow-xs group-hover:border-primary transition-colors">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                    {title.trim() ? (
                      title.slice(0, 2).toUpperCase()
                    ) : (
                      <ImageIcon className="size-6 text-primary/70" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  {isUploadingAvatar ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4 stroke-[3]" />
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-foreground">Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel 7 Coders, Midterm Prep..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={40}
                  className="w-full h-10 px-3.5 rounded-xl border border-border/80 bg-background text-sm font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Group Category Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-foreground">Category & Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {GROUP_CATEGORIES.map((cat) => {
                  const active = category === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                        setCategory(cat.id);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer",
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon
                        className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                      />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-foreground">Description (Optional)</label>
              <textarea
                placeholder="What's this group about? Goals, topics, meeting times..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={180}
                rows={2}
                className="w-full p-3 rounded-xl border border-border/80 bg-background text-xs font-medium placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Campus Scope Toggle */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-foreground">Privacy & Campus Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope("CAMPUS")}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    scope === "CAMPUS"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  <Lock className="size-3.5 text-blue-500 shrink-0" />
                  <div className="text-left">
                    <p className="leading-none">Campus Only</p>
                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      Your college peers only
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("GLOBAL")}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    scope === "GLOBAL"
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  <Globe className="size-3.5 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="leading-none">Inter-Campus</p>
                    <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      Verified Indian colleges
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Member Selection ─── */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-border/40 shrink-0 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students by name, @username, or branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9.5 pr-4 rounded-xl border border-border/80 bg-background text-xs font-semibold placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              {/* Selected Members Chips */}
              {selectedMembers.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {selectedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1 pl-1 pr-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold shrink-0 animate-in fade-in zoom-in-95"
                    >
                      <Avatar className="size-5 border border-primary/40">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback className="text-[9px] font-black">
                          {member.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[90px]">{member.displayName.split(" ")[0]}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleMember(member)}
                        className="size-4 rounded-full hover:bg-primary/20 flex items-center justify-center text-primary cursor-pointer"
                      >
                        <X className="size-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <span className="text-xs font-semibold">Searching campus students...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const isSelected = selectedMembers.some((m) => m.id === user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleMember(user)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer",
                        isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="size-10 border border-border/40 shrink-0">
                          <AvatarImage src={user.avatarUrl || ""} />
                          <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                            {user.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-black text-foreground truncate flex items-center gap-1">
                            <span>{user.displayName}</span>
                            {user.points && user.points >= 150 && (
                              <ShieldCheck className="size-3 text-brand shrink-0" />
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            @{user.username} {user.branch ? `• ${user.branch}` : ""}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center transition-all shrink-0",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-xs scale-105"
                            : "border-2 border-border/80 bg-background"
                        )}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center space-y-2 px-4 text-muted-foreground">
                  <Users2 className="size-8 mx-auto opacity-40" />
                  <p className="text-xs font-bold text-foreground">
                    {searchQuery
                      ? `No students found for "${searchQuery}"`
                      : "Type to search campus classmates"}
                  </p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Search by first name, username handle, or degree branch.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Modal Bottom Footer Actions ─── */}
        <div className="p-3.5 border-t border-border/40 bg-card/90 flex items-center justify-between gap-3 shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!title.trim()}
                onClick={() => {
                  if (!title.trim()) {
                    toast.error("Please enter a group name");
                    return;
                  }
                  sounds.tap();
                  haptics.light();
                  setStep(2);
                }}
                className="h-9 px-6 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                Next: Add Members →
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={selectedMembers.length === 0 || isCreating}
                onClick={handleCreateGroup}
                className="h-9 px-6 rounded-full bg-primary text-primary-foreground text-xs font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isCreating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Zap className="size-3.5" />
                    <span>Create Group ({selectedMembers.length + 1})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
