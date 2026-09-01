"use client";

import { Download, ExternalLink, FileArchive, FileCode, FileSpreadsheet, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  url: string;
  name?: string;
  size?: number;
  compact?: boolean;
  isMe?: boolean;
  className?: string;
}

export function DocumentCard({
  url,
  name = "Campus Notes Document",
  size,
  compact = false,
  isMe = false,
  className,
}: DocumentCardProps) {
  const extension = name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : "";
  const isPdf = extension === "pdf" || url.endsWith(".pdf");
  const isDoc = ["doc", "docx", "txt", "rtf", "odt"].includes(extension);
  const isSheet = ["xls", "xlsx", "csv"].includes(extension);
  const isZip = ["zip", "rar", "7z", "tar", "gz"].includes(extension);
  const isCode = ["py", "cpp", "c", "java", "js", "ts", "html", "css", "sql"].includes(extension);

  const Icon = isPdf
    ? FileText
    : isDoc
      ? FileText
      : isSheet
        ? FileSpreadsheet
        : isZip
          ? FileArchive
          : isCode
            ? FileCode
            : FileText;

  const badgeColor = isPdf
    ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
    : isDoc
      ? "bg-blue-500/15 text-blue-500 border-blue-500/30"
      : isSheet
        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
        : isZip
          ? "bg-purple-500/15 text-purple-500 border-purple-500/30"
          : "bg-primary/15 text-primary border-primary/30";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "rounded-2xl border transition-all select-none no-card-nav max-w-md",
        compact
          ? isMe
            ? "bg-white/10 border-white/20 p-2.5 text-white"
            : "bg-muted/60 border-border/50 p-2.5 text-foreground"
          : "bg-card border-border/60 p-3.5 shadow-xs hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Document Icon Avatar */}
        <div
          className={cn(
            "size-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
            badgeColor
          )}
        >
          <Icon className="size-5.5" />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{name}</h4>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <span className="uppercase font-black tracking-wider text-[9px] px-1.5 py-0.2 rounded bg-muted">
              {extension || "DOC"}
            </span>
            {size ? <span>{formatFileSize(size)}</span> : <span>Document Attachment</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={name}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors cursor-pointer",
              compact && isMe
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
            )}
            title="Download notes"
            aria-label="Download notes"
          >
            <Download className="size-4" />
          </a>

          {!compact && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
