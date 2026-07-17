"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keepPost, deletePost } from "./actions";
import { CheckIcon, Trash2Icon } from "lucide-react";

interface ReportRow {
  id: string;
  reason: string;
  details: string | null;
  postId: string;
  postBody: string;
  authorDisplayName: string;
  authorUsername: string;
}

export function ReportsTable({ initialReports }: { initialReports: ReportRow[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleKeep(postId: string) {
    if (!confirm("Keep this post? This will dismiss all active reports for it.")) return;
    setIsLoading(true);
    try {
      await keepPost(postId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to resolve report");
    }
    setIsLoading(false);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to remove this post? It will be hidden from all user feeds.")) return;
    setIsLoading(true);
    try {
      await deletePost(postId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove post");
    }
    setIsLoading(false);
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
                  <span className="font-medium text-foreground">{report.authorDisplayName}</span>
                  <span className="text-xs text-muted-foreground">@{report.authorUsername}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleKeep(report.postId)} 
                    disabled={isLoading} 
                    title="Keep Post"
                    className="p-2 rounded-md hover:bg-muted text-green-500 hover:text-green-600 transition-colors"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(report.postId)} 
                    disabled={isLoading} 
                    title="Delete Post"
                    className="p-2 rounded-md hover:bg-muted text-destructive hover:text-red-600 transition-colors"
                  >
                    <Trash2Icon className="h-4 w-4" />
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
