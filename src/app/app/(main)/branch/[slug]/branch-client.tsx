"use client";

import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { getBranchIcon } from "@/constants";
import type { Institution,UserProfile } from "@/db/schema";
import { fetcher } from "@/lib/api";
import { getAvatarUrl } from "@/lib/utils";
import { ArrowLeft,Globe,MessageSquare,School,Search,ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams,useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

type BranchStudent = UserProfile & { institution?: Institution | null };

type BranchApiResponse = {
  branch: string;
  slug: string;
  icon: string;
  category: string;
  totalCount: number;
  students: BranchStudent[];
};

export function BranchDirectoryClient() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = typeof params.slug === "string" ? params.slug : "";
  const slug = decodeURIComponent(rawSlug);

  const [scope, setScope] = useState<"GLOBAL" | "CAMPUS">("GLOBAL");
  const [sort, setSort] = useState<"CLOUT" | "RECENT" | "NAME">("CLOUT");
  const [searchQuery, setSearchQuery] = useState("");

  const url = `/api/academics/branch/${encodeURIComponent(slug)}?scope=${scope}&sort=${sort}&q=${encodeURIComponent(searchQuery)}`;
  const { data, isLoading } = useSWR<BranchApiResponse>(url, fetcher, { revalidateOnFocus: false });

  const branchTitle = data?.branch || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const branchIcon = data?.icon || getBranchIcon(branchTitle);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col min-h-screen px-4 pt-4 pb-24 space-y-5 select-none">
      {/* ─── Top Header Bar ─── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <h1 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Academic Branch Directory
        </h1>

        <Link
          href="/app/colleges"
          className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
        >
          All Colleges
        </Link>
      </div>

      {/* ─── Hero Branch Banner Card ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/20 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-2xl shadow-xs shrink-0">
            {branchIcon}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground truncate">
                {branchTitle}
              </h2>
              {data && (
                <span className="rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-2.5 py-0.5">
                  {data.totalCount} Students
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Verified campus students enrolled in this discipline across India.
            </p>
          </div>
        </div>

        {/* Search & Scope Controls */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search classmates in ${branchTitle}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border/80 bg-muted/20 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-background transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Scope Toggle */}
            <div className="flex rounded-xl bg-muted/60 p-1 border border-border/50 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setScope("GLOBAL")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  scope === "GLOBAL" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe className="size-3" /> All Campuses
              </button>
              <button
                type="button"
                onClick={() => setScope("CAMPUS")}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  scope === "CAMPUS" ? "bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <School className="size-3" /> My College
              </button>
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 mr-1">Sort:</span>
              <button
                type="button"
                onClick={() => setSort("CLOUT")}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  sort === "CLOUT" ? "bg-primary/10 border-primary text-primary font-bold" : "border-transparent hover:bg-muted"
                }`}
              >
                🔥 Top Clout
              </button>
              <button
                type="button"
                onClick={() => setSort("RECENT")}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  sort === "RECENT" ? "bg-primary/10 border-primary text-primary font-bold" : "border-transparent hover:bg-muted"
                }`}
              >
                ⚡ Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Student Grid / List ─── */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-border/60 bg-card p-4 animate-pulse" />
            ))}
          </div>
        ) : data && data.students.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/90 p-4 shadow-xs hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Link href={`/@${student.username}`}>
                    <Avatar className="size-11 border border-border shrink-0">
                      <AvatarImage src={student.avatarUrl || getAvatarUrl(null, student.username)} />
                      <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                        {student.displayName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Link href={`/@${student.username}`} className="block">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                        <span>{student.displayName}</span>
                        {student.points >= 150 && <ShieldCheck className="size-3 text-blue-500 shrink-0" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">@{student.username}</p>
                    </Link>

                    {student.institution && (
                      <Link
                        href={`/app/college/${student.institution.slug || student.institution.id}`}
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 pt-0.5 truncate"
                      >
                        <School className="size-3 shrink-0" />
                        <span className="truncate">{student.institution.name.split(",")[0]}</span>
                      </Link>
                    )}
                  </div>
                </div>

                {student.bio && (
                  <p className="text-[11px] text-muted-foreground/90 line-clamp-2 mt-2.5 pt-2 border-t border-border/40 italic">
                    &ldquo;{student.bio}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    {student.year ? `Year ${student.year} · ` : ""}
                    <span className="text-amber-500 font-black">🔥 {student.points || 0} LP</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/@${student.username}`}
                      className="px-2.5 py-1 rounded-xl bg-muted/40 hover:bg-muted text-[10px] font-bold text-foreground transition-colors cursor-pointer"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/app/chat?userId=${student.id}`}
                      className="p-1 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/95 transition-colors cursor-pointer shadow-2xs"
                      title="Direct Message"
                    >
                      <MessageSquare className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center space-y-3 my-4">
            <div className="size-12 rounded-2xl bg-muted/60 flex items-center justify-center text-xl">
              {branchIcon}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No students found</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                {searchQuery
                  ? `No students matching "${searchQuery}" in ${branchTitle}.`
                  : `Be the first student to enroll in ${branchTitle} on CampusLoop!`}
              </p>
            </div>
            <Link
              href="/app/profile/edit"
              className="py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
            >
              Add {branchTitle} to Profile
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
