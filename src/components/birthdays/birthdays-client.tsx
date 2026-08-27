"use client";

import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
Cake,
Calendar,
Globe,
Loader2,
Lock,
PartyPopper,
Plus,
School,
Search,
Unlock,
X,
Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { BirthdayCard } from "./birthday-card";

interface BirthdayResponse {
  today: Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    course?: string | null;
    branch?: string | null;
    gender?: string | null;
    dob?: string | null;
    institution?: { id: string; name: string } | null;
  }>;
  upcoming: Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    course?: string | null;
    branch?: string | null;
    gender?: string | null;
    dob?: string | null;
    daysUntil: number;
    birthMonth: number;
    birthDay: number;
    institution?: { id: string; name: string } | null;
  }>;
  byMonth?: Array<{
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    course?: string | null;
    branch?: string | null;
    dob?: string | null;
    institution?: { id: string; name: string } | null;
  }>;
  currentUserDob?: string | null;
  currentUserIsPrivate?: boolean;
}

const MONTHS = [
  { value: "", label: "All" },
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

export function BirthdaysClient() {
  const router = useRouter();
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [searchDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

  const queryParams = new URLSearchParams();
  queryParams.set("scope", scope);
  if (searchDate) queryParams.set("date", searchDate);
  if (selectedMonth) queryParams.set("month", selectedMonth);

  const { data, isLoading, mutate } = useSWR<BirthdayResponse>(
    `/api/birthdays?${queryParams.toString()}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  async function handleTogglePrivacy() {
    if (!data) return;
    setIsUpdatingPrivacy(true);
    const newStatus = !data.currentUserIsPrivate;

    // Flip the switch right away; revalidate once the server agrees.
    mutate((prev) => (prev ? { ...prev, currentUserIsPrivate: newStatus } : prev), false);

    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDobPrivate: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update birthday privacy");

      toast.success(newStatus ? "Birthday set to Private 🔒" : "Birthday is now Public to peers 🎉");
      mutate();
    } catch (err) {
      mutate((prev) => (prev ? { ...prev, currentUserIsPrivate: !newStatus } : prev), false);
      toast.error(err instanceof Error ? err.message : "Error updating privacy");
    } finally {
      setIsUpdatingPrivacy(false);
    }
  }

  const todayList = (data?.today || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.displayName.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  const upcomingList = (data?.upcoming || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.displayName.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  const monthList = (data?.byMonth || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.displayName.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-screen pb-24 select-none">
      {/* ─── Sticky Minimal Top Bar ─── */}
      <header className="sticky top-0 z-40 bg-background/85 px-4 py-3 backdrop-blur-xl border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center size-8 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-1.5">
              <span>Campus Birthdays</span>
              <span className="size-1.5 rounded-full bg-pink-500" />
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold">
              Today&apos;s campus celebrations &amp; student DOB
            </p>
          </div>
        </div>

        {/* Scope Pill Toggle */}
        <div className="flex rounded-full bg-muted/50 p-0.5 border border-border/40 shadow-2xs">
          <button
            type="button"
            onClick={() => setScope("CAMPUS")}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
              scope === "CAMPUS"
                ? "bg-card text-foreground shadow-2xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <School className="size-3" />
            <span>Campus</span>
          </button>
          <button
            type="button"
            onClick={() => setScope("GLOBAL")}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
              scope === "GLOBAL"
                ? "bg-card text-foreground shadow-2xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="size-3" />
            <span>All India</span>
          </button>
        </div>
      </header>

      <main className="px-3 sm:px-4 pt-3.5 space-y-4">
        {/* ─── Minimal Birthday & Privacy Capsule ─── */}
        {data && (
          <div className="rounded-3xl bg-card p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                  <Cake className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {data.currentUserDob
                      ? `Your Birthday: ${data.currentUserDob}`
                      : "Add your birthday to celebrate with classmates"}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {data.currentUserIsPrivate ? (
                      <>
                        <Lock className="size-2.5 text-amber-500" />
                        <span>Private · Hidden from campus feed</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="size-2.5 text-emerald-500" />
                        <span>Public · Classmates can wish you</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {data.currentUserDob ? (
                  <button
                    type="button"
                    disabled={isUpdatingPrivacy}
                    onClick={handleTogglePrivacy}
                    className="rounded-full border border-border/70 bg-muted/40 hover:bg-muted px-3.5 py-1 text-[11px] font-bold text-foreground transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    {isUpdatingPrivacy && <Loader2 className="size-3 animate-spin text-primary" />}
                    <span>{data.currentUserIsPrivate ? "Make Public 🎉" : "Set Private 🔒"}</span>
                  </button>
                ) : (
                  <Link
                    href="/app/profile/edit"
                    className="rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold text-white hover:opacity-90 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="size-3" />
                    <span>Add DOB</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Search & Month Filter Pills ─── */}
        <div className="space-y-2.5">
          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classmate by name or @handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-full border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/70 focus:border-primary outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Month Pills Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MONTHS.map((m) => {
              const isSelected = selectedMonth === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSelectedMonth(m.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs",
                    isSelected
                      ? "bg-foreground text-background font-black"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Main Birthday Content ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ─── Today's Celebrations Section ─── */}
            {!selectedMonth && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <PartyPopper className="size-3.5 text-pink-500" />
                    <span>Today&apos;s Campus Celebrations 🎉</span>
                  </h2>
                  <span className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full">
                    {todayList.length} Celebrant{todayList.length === 1 ? "" : "s"}
                  </span>
                </div>

                {todayList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {todayList.map((student) => (
                      <BirthdayCard key={student.id} student={student} isToday={true} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-card p-6 text-center space-y-2 shadow-2xs">
                    <div className="size-10 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto text-pink-500">
                      <Cake className="size-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">No campus birthdays today</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      {scope === "CAMPUS"
                        ? "None of your college batchmates have a public birthday today. Switch to All India or check upcoming dates!"
                        : "No students indexed with a public birthday today."}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ─── Filtered Month View ─── */}
            {selectedMonth && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    <span>
                      Born in {MONTHS.find((m) => m.value === selectedMonth)?.label} ({monthList.length})
                    </span>
                  </h2>
                </div>

                {monthList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {monthList.map((student) => (
                      <BirthdayCard key={student.id} student={student} isToday={false} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-card p-6 text-center space-y-2 shadow-2xs">
                    <p className="text-xs font-bold text-foreground">No students found for this month</p>
                    <p className="text-[11px] text-muted-foreground">
                      Try selecting another month or invite classmates to add their DOB.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ─── Upcoming Celebrations (Next 60 Days) ─── */}
            {!selectedMonth && (
              <section className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Zap className="size-3.5 text-amber-500" />
                    <span>Upcoming Celebrations (Next 60 Days)</span>
                  </h2>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {upcomingList.length} Upcoming
                  </span>
                </div>

                {upcomingList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {upcomingList.map((student) => (
                      <BirthdayCard key={student.id} student={student} isToday={false} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-card p-6 text-center space-y-2 shadow-2xs">
                    <p className="text-xs font-bold text-foreground">No upcoming birthdays indexed</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Encourage batchmates to add their Date of Birth in their profile to celebrate together!
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
