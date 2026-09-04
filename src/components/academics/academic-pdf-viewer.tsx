"use client";

import {
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Minimize2,
  Moon,
  RotateCw,
  Sun,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

interface AcademicPdfViewerProps {
  fileUrl?: string | null;
  driveUrl?: string | null;
  title: string;
  subjectCode: string;
  resourceType: string;
  onDownload?: () => void;
  className?: string;
}

export function AcademicPdfViewer({
  fileUrl,
  driveUrl,
  title,
  subjectCode,
  resourceType,
  onDownload,
  className,
}: AcademicPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasIframeError, setHasIframeError] = useState<boolean>(false);

  // Normalize URLs
  const rawUrl = fileUrl || driveUrl || "";
  const isGoogleDrive = rawUrl.includes("drive.google.com");
  const isMultisim = rawUrl.toLowerCase().endsWith(".ms14") || title.toLowerCase().includes("multisim");
  const isDirectPdf = rawUrl.toLowerCase().includes(".pdf");

  // Determine embeddable URL
  const embedUrl = useMemo(() => {
    if (!rawUrl) return null;

    if (isGoogleDrive) {
      // Convert /view, /edit to /preview for Google Docs viewer
      return rawUrl.replace(/\/view(\?.*)?$/, "/preview").replace(/\/edit(\?.*)?$/, "/preview");
    }

    if (isDirectPdf) {
      // If it is a direct PDF, append toolbar and fit parameters
      return `${rawUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
    }

    // Otherwise pass raw
    return rawUrl;
  }, [rawUrl, isGoogleDrive, isDirectPdf]);

  // Handle direct download
  function handleDownloadClick(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    sounds.pop();
    haptics.success();

    if (onDownload) {
      onDownload();
    }

    if (!rawUrl) {
      toast.info("Preparing direct download link...");
      return;
    }

    // If it is a Google Drive view link, attempt direct download format
    let downloadLink = rawUrl;
    if (isGoogleDrive && rawUrl.includes("/file/d/")) {
      const match = rawUrl.match(/\/file\/d\/([^/]+)/);
      if (match && match[1]) {
        downloadLink = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    // Open download in new tab / trigger download
    const link = document.createElement("a");
    link.href = downloadLink;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = `${subjectCode}_${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started! Zero login required 🚀");
  }

  // Handle zoom controls
  function handleZoom(direction: "in" | "out" | "reset") {
    sounds.tap();
    haptics.light();
    if (direction === "in") {
      setZoomLevel((prev) => Math.min(prev + 20, 200));
    } else if (direction === "out") {
      setZoomLevel((prev) => Math.max(prev - 20, 60));
    } else {
      setZoomLevel(100);
      setRotation(0);
    }
  }

  // Toggle fullscreen
  function toggleFullscreen() {
    sounds.tap();
    haptics.medium();

    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  }

  // Listen to browser fullscreen exit
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Multisim Circuit Simulation File UI
  if (isMultisim) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "w-full rounded-3xl border border-indigo-500/30 bg-card overflow-hidden shadow-xs relative transition-all p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4",
          className
        )}
      >
        <div className="relative">
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-3xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shadow-md">
            <Cpu className="size-8 sm:size-10 animate-pulse" />
          </div>
          <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-black text-[10px] tracking-wider shadow-xs">
            .MS14
          </span>
        </div>

        <div className="max-w-md space-y-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            National Instruments Multisim Circuit Simulation
          </span>
          <h3 className="text-base sm:lg font-black text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Interactive circuit schematic &amp; simulation file for {subjectCode}. Compatible with NI
            Multisim v14.0+. Directly download and simulate BJT, Op-Amp, and amplifier stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Download className="size-4" />
            <span>Download .ms14 File</span>
          </button>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-all cursor-pointer"
            >
              <ExternalLink className="size-3.5" />
              <span>Direct Link</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full rounded-3xl border border-border/60 bg-card overflow-hidden shadow-xs relative transition-all flex flex-col select-none",
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen bg-background" : "h-[540px] sm:h-[620px]",
        className
      )}
    >
      {/* ─── Reader Top Control Toolbar ─── */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-muted/40 border-b border-border/40 backdrop-blur-md shrink-0 flex-wrap">
        {/* Left: Document info & badges */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shrink-0">
            <FileText className="size-3" />
            <span>{isGoogleDrive ? "Drive PDF" : "PDF Doc"}</span>
          </span>
          <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
            {title}
          </span>
        </div>

        {/* Right: Controls (Zoom, Night Mode, Rotate, Fullscreen, Direct Download) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Zoom controls (for direct embeds) */}
          <div className="hidden sm:flex items-center bg-card rounded-full border border-border/50 p-0.5">
            <button
              type="button"
              onClick={() => handleZoom("out")}
              disabled={zoomLevel <= 60}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1.5 text-muted-foreground tabular-nums">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom("in")}
              disabled={zoomLevel >= 200}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-all cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
          </div>

          {/* Night Mode Invert Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setIsNightMode(!isNightMode);
              toast.info(isNightMode ? "Reader night mode off" : "Reader night mode enabled (inverted) 🌙");
            }}
            className={cn(
              "p-1.5 rounded-full border transition-all cursor-pointer",
              isNightMode
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                : "border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
            title={isNightMode ? "Disable dark reader" : "Enable dark reader for night study"}
          >
            {isNightMode ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
          </button>

          {/* Rotate Toggle */}
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              haptics.light();
              setRotation((r) => (r + 90) % 360);
            }}
            className="hidden sm:flex p-1.5 rounded-full border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Rotate 90 degrees"
          >
            <RotateCw className="size-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Reader"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>

          {/* Direct Download Button (No Login Required) */}
          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer transition-all active:scale-95"
            title="Download PDF (No login required)"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Open in new tab link */}
          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-full border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Open direct file in new tab"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* ─── PDF Viewer Body Canvas ─── */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-neutral-900/95 flex items-center justify-center">
        {embedUrl ? (
          <div
            className="w-full h-full transition-transform duration-200 origin-center flex items-center justify-center overflow-auto"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              filter: isNightMode ? "invert(90%) hue-rotate(180deg)" : "none",
            }}
          >
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 bg-white"
              allow="autoplay; encrypted-media; fullscreen"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasIframeError(true);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/20 text-muted-foreground">
              <FileText className="size-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Direct Cloud Document</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                This document is available for direct zero-login download.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 shadow-md cursor-pointer transition-all"
            >
              <Download className="size-4" />
              <span>Download &amp; Open Document</span>
            </button>
          </div>
        )}

        {/* Fallback overlay if iframe encounters embedding blockage */}
        {hasIframeError && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <p className="text-sm font-bold text-foreground">Viewer Embed Protected</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Your browser blocked third-party embedding for this file. You can open or download the PDF
              directly below:
            </p>
            <button
              type="button"
              onClick={handleDownloadClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer shadow-md"
            >
              <Download className="size-4" />
              <span>Direct Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Footer Notice ─── */}
      <div className="px-4 py-1.5 bg-muted/20 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Public Access: Free reading &amp; download (No sign-in required)</span>
        </span>
        <span className="hidden sm:inline">Press Esc to exit fullscreen</span>
      </div>
    </div>
  );
}
