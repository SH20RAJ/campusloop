"use client";

import { CheckCircle2, Clock, Crown, Loader2, Search, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { approveJoinRequest, rejectJoinRequest } from "@/app/app/(main)/communities/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberItem {
  id: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    points?: number | null;
    branch?: string | null;
    year?: number | null;
  };
}

interface CommunityMembersClientProps {
  communityId: string;
  communityName: string;
  members: MemberItem[];
  isAdmin: boolean;
}

export function CommunityMembersClient({
  communityId,
  communityName,
  members: initialMembers,
  isAdmin,
}: CommunityMembersClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingMembers = members.filter((m) => m.status === "PENDING");
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  const filteredActive = activeMembers.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.user.displayName.toLowerCase().includes(q) ||
      m.user.username.toLowerCase().includes(q) ||
      (m.user.branch || "").toLowerCase().includes(q)
    );
  });

  const admins = filteredActive.filter((m) => m.role === "ADMIN");
  const regularMembers = filteredActive.filter((m) => m.role !== "ADMIN");

  async function handleApprove(targetUserId: string) {
    setProcessingId(targetUserId);
    try {
      await approveJoinRequest(communityId, targetUserId);
      setMembers((prev) => prev.map((m) => (m.userId === targetUserId ? { ...m, status: "ACTIVE" } : m)));
      toast.success("Member approved!");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to approve member");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(targetUserId: string) {
    setProcessingId(targetUserId);
    try {
      await rejectJoinRequest(communityId, targetUserId);
      setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      toast.success("Join request declined.");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to decline request");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-5 select-none animate-in fade-in">
      {/* Search Box */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${activeMembers.length} members in c/${communityName}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-8 rounded-full border border-border/50 bg-card text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-all shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Pending Join Requests (For Admins of Private Groups) */}
      {isAdmin && pendingMembers.length > 0 && (
        <div className="rounded-3xl bg-card p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="size-4" /> Pending Join Requests ({pendingMembers.length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              Admin Action Required
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {pendingMembers.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <Link href={`/@${m.user.username}`} className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={m.user.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {m.user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-foreground truncate">{m.user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{m.user.username} {m.user.branch ? `• ${m.user.branch}` : ""}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={processingId === m.userId}
                    onClick={() => handleApprove(m.userId)}
                    className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    {processingId === m.userId ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === m.userId}
                    onClick={() => handleReject(m.userId)}
                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="size-3.5 text-muted-foreground" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership & Admins */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
          <Crown className="size-3.5 text-amber-500" /> Community Leadership
        </h3>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {admins.map((m) => (
            <Link key={m.id} href={`/@${m.user.username}`}>
              <div className="rounded-2xl bg-card p-3.5 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={m.user.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-bold bg-amber-500/10 text-amber-600">
                      {m.user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-extrabold text-foreground truncate flex items-center gap-1">
                      <span>{m.user.displayName}</span>
                      <Crown className="size-3 text-amber-500 shrink-0" />
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{m.user.username} {m.user.branch ? `• ${m.user.branch}` : ""}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  Admin
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Members Directory */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
          <Users className="size-3.5 text-primary" /> Members ({regularMembers.length})
        </h3>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {regularMembers.map((m) => (
            <Link key={m.id} href={`/@${m.user.username}`}>
              <div className="rounded-2xl bg-card p-3.5 hover:bg-muted/30 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={m.user.avatarUrl || ""} />
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {m.user.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-extrabold text-foreground truncate">{m.user.displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      @{m.user.username} {m.user.branch ? `• ${m.user.branch}` : ""}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                  Member
                </span>
              </div>
            </Link>
          ))}

          {regularMembers.length === 0 && (
            <div className="col-span-full py-10 text-center rounded-2xl bg-card text-muted-foreground text-xs font-semibold shadow-2xs">
              No other members matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
