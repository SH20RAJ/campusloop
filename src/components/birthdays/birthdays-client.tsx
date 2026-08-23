"use client";

import { useState } from "react";
import useSWR from "swr";
import { BirthdayCard } from "./birthday-card";
import { Cake, Sparkles, Calendar, Search, Globe, School, Lock, Unlock, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { fetcher } from "@/lib/api";

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
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];


export function BirthdaysClient() {
  const [scope, setScope] = useState<"CAMPUS" | "GLOBAL">("CAMPUS");
  const [searchDate, setSearchDate] = useState("");
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
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDobPrivate: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update birthday privacy");

      toast.success(newStatus ? "Birthday is now private 🔒" : "Birthday is now visible to campus 🎉");
      mutate();
    } catch (err) {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 pt-2 px-4 select-none">
      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-background p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-500 shadow-xs">
                <Cake className="size-5" />
              </span>
              <h1 className="text-xl font-black tracking-tight text-foreground">Campus Birthdays & DOB</h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Discover today's birthdays on campus, send wishes, and check who shares your special day!
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope Switcher */}
            <div className="flex rounded-xl bg-card p-1 border border-border/80 shadow-xs">
              <button
                type="button"
                onClick={() => setScope("CAMPUS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scope === "CAMPUS"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <School className="size-3.5" />
                <span>My Campus</span>
              </button>
              <button
                type="button"
                onClick={() => setScope("GLOBAL")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scope === "GLOBAL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="size-3.5" />
                <span>All India</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current User Birthday Privacy Status Banner */}
        {data && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              {data.currentUserIsPrivate ? (
                <>
                  <Lock className="size-3.5 text-amber-500 shrink-0" />
                  <span>Your birthday is <strong>Private</strong> (hidden from peers).</span>
                </>
              ) : (
                <>
                  <Unlock className="size-3.5 text-emerald-500 shrink-0" />
                  <span>
                    Your birthday is <strong>Public</strong> {data.currentUserDob ? `(${data.currentUserDob})` : "(No DOB added)"}.
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              disabled={isUpdatingPrivacy}
              onClick={handleTogglePrivacy}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isUpdatingPrivacy && <Loader2 className="size-3 animate-spin" />}
              {data.currentUserIsPrivate ? "Make Birthday Public 🎉" : "Set to Private 🔒"}
            </button>
          </div>
        )}
      </div>

      {/* ─── Filter & Date Lookup Bar ─── */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" /> Lookup Specific Birthday Date
          </span>
          {(searchDate || selectedMonth || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchDate("");
                setSelectedMonth("");
                setSearchQuery("");
              }}
              className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Specific Date input */}
          <div className="space-y-1">
            <label htmlFor="lookup-date" className="text-[10px] font-semibold text-muted-foreground">Find by Exact Date</label>
            <input
              id="lookup-date"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary outline-none"
            />
          </div>

          {/* Month selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground">Filter by Birth Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-foreground focus:border-primary outline-none"
            >
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search by student name / handle */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground">Search Student</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or handle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ─── Today's Birthdays (Celebrations) ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <PartyPopper className="size-4 text-pink-500" />
                {searchDate ? "Birthdays on Selected Date" : "Today's Campus Celebrations 🎉"}
              </h2>
              <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                {todayList.length} Celebrants
              </span>
            </div>

            {todayList.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {todayList.map((student) => (
                  <BirthdayCard key={student.id} student={student} isToday={!searchDate} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center space-y-2">
                <div className="size-10 rounded-2xl bg-muted flex items-center justify-center">
                  <Cake className="size-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-bold text-foreground">No public birthdays today</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  {scope === "CAMPUS"
                    ? "No one in your college has a public birthday today. Switch to All India or check upcoming dates!"
                    : "No students found with a public birthday on this date."}
                </p>
              </div>
            )}
          </div>

          {/* ─── Upcoming Campus Birthdays ─── */}
          {!searchDate && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-amber-500" /> Upcoming Birthdays (Next 60 Days)
                </h2>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                  {upcomingList.length} Upcoming
                </span>
              </div>

              {upcomingList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {upcomingList.map((student) => (
                    <BirthdayCard key={student.id} student={student} isToday={false} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center space-y-2">
                  <p className="text-xs font-bold text-foreground">No upcoming birthdays indexed</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Encourage classmates to add their Date of Birth in their profile to celebrate together!
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
