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
    <div className="w-full max-w-2xl mx-auto min-h-screen border-x border-border/30 pb-24 select-none">
      {/* ─── Twitter-Style Sticky Top Bar ─── */}
      <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b border-border/30 bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-muted transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="size-4.5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight truncate flex items-center gap-1.5">
              <span>{branchIcon}</span>
              <span className="truncate">{branchTitle}</span>
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium truncate">
              {data ? `${data.totalCount} verified students` : "Academic Branch Directory"}
            </p>
          </div>
        </div>

        <Link
          href="/app/colleges"
          className="text-xs font-bold text-primary hover:underline shrink-0 pl-2"
        >
          All Colleges
        </Link>
      </header>

      {/* ─── Search Input ─── */}
      <div className="px-4 py-2.5 border-b border-border/30 bg-background/50">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${branchTitle} classmates...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9.5 pl-10 pr-4 rounded-full bg-muted/40 text-xs font-semibold text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/40 focus:bg-background transition-all"
          />
        </div>
      </div>

      {/* ─── Twitter-Style Equal-Width Tabs ─── */}
      <div className="flex border-b border-border/30 bg-background text-xs font-bold">
        <button
          type="button"
          onClick={() => setScope("GLOBAL")}
          className={`flex-1 py-3 text-center relative transition-colors cursor-pointer ${
            scope === "GLOBAL" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3.5" />
            All Campuses
          </span>
          {scope === "GLOBAL" && (
            <span className="absolute bottom-0 inset-x-12 h-1 bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setScope("CAMPUS")}
          className={`flex-1 py-3 text-center relative transition-colors cursor-pointer ${
            scope === "CAMPUS" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <School className="size-3.5" />
            My College
          </span>
          {scope === "CAMPUS" && (
            <span className="absolute bottom-0 inset-x-12 h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* ─── Sub-filter Sort Bar ─── */}
      <div className="px-4 py-2 border-b border-border/20 bg-muted/10 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Sort Students
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSort("CLOUT")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              sort === "CLOUT"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            🔥 Top Clout
          </button>
          <button
            type="button"
            onClick={() => setSort("RECENT")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              sort === "RECENT"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            ⚡ Newest
          </button>
        </div>
      </div>

      {/* ─── Student Directory List (Twitter Search / User Style) ─── */}
      <div className="divide-y divide-border/30">
        {isLoading ? (
          <div className="divide-y divide-border/30">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3.5 p-4 animate-pulse">
                <div className="size-11 rounded-full bg-muted/60 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-1/3 rounded bg-muted/60" />
                  <div className="h-2.5 w-1/2 rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        ) : data && data.students.length > 0 ? (
          data.students.map((student) => (
            <div
              key={student.id}
              className="flex items-start gap-3.5 px-4 py-3.5 hover:bg-muted/15 transition-colors group"
            >
              <Link href={`/@${student.username}`} className="shrink-0">
                <Avatar className="size-11 rounded-full border border-border/40 hover:opacity-90 transition-opacity">
                  <AvatarImage src={student.avatarUrl || getAvatarUrl(null, student.username)} />
                  <AvatarFallback className="font-bold text-xs bg-primary/10 text-primary">
                    {student.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="min-w-0 flex-1 space-y-1">
                {/* Name, Handle, and Action Row */}
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/@${student.username}`} className="min-w-0 group/name block">
                    <p className="text-sm font-bold text-foreground truncate group-hover/name:underline flex items-center gap-1">
                      <span className="truncate">{student.displayName}</span>
                      {student.points >= 150 && (
                        <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{student.username}
                      {student.year ? ` · Year ${student.year}` : ""}
                    </p>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/@${student.username}`}
                      className="px-3 py-1 rounded-full border border-border/60 bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors cursor-pointer"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/app/chat?userId=${student.id}`}
                      className="size-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer"
                      title="Direct Message"
                    >
                      <MessageSquare className="size-3.5" />
                    </Link>
                  </div>
                </div>

                {/* College / Institution with Direct Hyperlink */}
                {student.institution && (
                  <Link
                    href={`/app/college/${student.institution.slug || student.institution.id}`}
                    className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <School className="size-3.5 shrink-0 text-primary/70" />
                    <span className="truncate">{student.institution.name}</span>
                  </Link>
                )}

                {/* Bio Snippet */}
                {student.bio && (
                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed pt-0.5">
                    &ldquo;{student.bio}&rdquo;
                  </p>
                )}

                {/* Clout LP Badge */}
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    🔥 {student.points || 0} LP Clout
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="size-14 rounded-full bg-muted/40 flex items-center justify-center text-2xl">
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
              className="py-2 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 transition-all cursor-pointer"
            >
              Add {branchTitle} to Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
