"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keepPost, deletePost, hidePost, dismissReport } from "./actions";
import { revealAnonymousAuthor, type RevealedIdentity } from "../anonymity-actions";
import { CheckIcon, Trash2Icon, EyeOff, XCircle, Eye } from "lucide-react";

interface ReportRow {
  id: string;
  reason: string;
  details: string | null;
  postId: string;
  postBody: string;
  postPseudonym?: string | null;
  authorDisplayName: string | null;
  authorUsername: string | null;
}

export function ReportsTable({ initialReports }: { initialReports: ReportRow[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, RevealedIdentity>>({});

  async function run(fn: () => Promise<unknown>) {
    setIsLoading(true);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Action failed");
    }
    setIsLoading(false);
  }

  async function handleKeep(postId: string) {
    if (!confirm("Keep this post? This will publish it and dismiss all active reports for it.")) return;
    await run(() => keepPost(postId));
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to remove this post? It will be hidden from all user feeds.")) return;
    await run(() => deletePost(postId));
  }

  async function handleHide(postId: string) {
    await run(() => hidePost(postId));
  }

  async function handleDismiss(reportId: string) {
    await run(() => dismissReport(reportId));
  }

  function handleReveal(postId: string) {
    if (!confirm("Reveal the author of this anonymous post? This action is audit-logged.")) return;
    return run(async () => {
      const identity = await revealAnonymousAuthor("POST", postId);
      setRevealed((prev) => ({ ...prev, [postId]: identity }));
    });
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-muted-foreground">
        <thead className="bg-muted text-xs uppercase text-foreground">
          <tr>
            <th className="px-6 py-4">Report Details</th>
            <th className="px-6 py-4">Post Content</th>
            <th className="px-6 py-4">Author</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialReports.map((report) => (
            <tr key={report.id} className="border-b border-border hover:bg-muted/50">
              <td className="px-6 py-4 space-y-1">
                <span className="font-semibold text-destructive text-xs uppercase bg-destructive/15 px-2 py-0.5 rounded border border-destructive/10">
                  {report.reason}
                </span>
                {report.details && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] line-clamp-2">{report.details}</p>
                )}
              </td>
              <td className="px-6 py-4 font-medium text-foreground max-w-[300px]">
                <p className="line-clamp-3 leading-relaxed whitespace-pre-wrap">{report.postBody}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {report.authorDisplayName ?? revealed[report.postId]?.displayName ?? "👻 Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {report.authorUsername
                      ? `@${report.authorUsername}`
                      : revealed[report.postId]
                        ? `@${revealed[report.postId].username} · ${revealed[report.postId].accountStatus}`
                        : report.postPseudonym || "anon"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1.5">
                  {report.authorUsername === null && !revealed[report.postId] && (
                    <button
                      onClick={() => handleReveal(report.postId)}
                      disabled={isLoading}
                      title="Reveal author (audit logged)"
                      className="p-2 rounded-md hover:bg-muted text-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleKeep(report.postId)}
                    disabled={isLoading}
                    title="Keep Post"
                    className="p-2 rounded-md hover:bg-muted text-green-500 hover:text-green-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleHide(report.postId)}
                    disabled={isLoading}
                    title="Hide Post (soft action)"
                    className="p-2 rounded-md hover:bg-muted text-orange-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(report.postId)}
                    disabled={isLoading}
                    title="Delete Post"
                    className="p-2 rounded-md hover:bg-muted text-destructive hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDismiss(report.id)}
                    disabled={isLoading}
                    title="Dismiss report only (keep post status)"
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {initialReports.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center">No open reports. All clean!</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
