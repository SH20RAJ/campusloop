"use client";

import { Check, ImageUp, Loader2, Move, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { haptics } from "@/lib/haptics";
import { uploadImageToImgBB } from "@/lib/upload";
import { cn } from "@/lib/utils";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  mode: "avatar" | "banner";
  onCropComplete: (croppedUrl: string) => void;
}

/** Output size per mode. The preview frame uses the same aspect, so it is WYSIWYG. */
const OUTPUT = {
  avatar: { width: 640, height: 640 },
  banner: { width: 1500, height: 500 },
} as const;

/**
 * Pure geometry for the crop, extracted so it can be unit tested — the previous
 * implementation ignored `object-cover` here and blew large photos up.
 */
export function computeCropDraw(params: {
  naturalWidth: number;
  naturalHeight: number;
  frameWidth: number;
  frameHeight: number;
  outputWidth: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}) {
  const { naturalWidth, naturalHeight, frameWidth, frameHeight, outputWidth, zoom, offsetX, offsetY } =
    params;

  const coverScale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);
  const previewToOutput = outputWidth / frameWidth;

  return {
    coverScale,
    previewToOutput,
    drawWidth: naturalWidth * coverScale * zoom * previewToOutput,
    drawHeight: naturalHeight * coverScale * zoom * previewToOutput,
    translateX: offsetX * previewToOutput,
    translateY: offsetY * previewToOutput,
  };
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function ImageCropModal({ isOpen, onClose, imageUrl, mode, onCropComplete }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingOriginal, setIsUploadingOriginal] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

  const output = OUTPUT[mode];

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setNaturalSize(null);
    }
  }, [isOpen]);

  /**
   * The preview renders the image with `object-cover`, which scales it to fill
   * the frame. Every crop calculation has to start from that same factor —
   * ignoring it was what made large photos appear massively zoomed in.
   */
  const getCoverScale = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !img.naturalWidth) return 1;

    const rect = container.getBoundingClientRect();
    return Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
  }, []);

  /** Keeps the frame covered, so you can never drag empty space into the crop. */
  const clampOffset = useCallback(
    (next: { x: number; y: number }, nextZoom = zoom, nextRotation = rotation) => {
      const img = imgRef.current;
      const container = containerRef.current;
      if (!img || !container || !img.naturalWidth) return next;

      const rect = container.getBoundingClientRect();
      const coverScale = getCoverScale();

      let shownWidth = img.naturalWidth * coverScale * nextZoom;
      let shownHeight = img.naturalHeight * coverScale * nextZoom;

      // A quarter turn swaps which axis the image spans.
      if (nextRotation === 90 || nextRotation === 270) {
        [shownWidth, shownHeight] = [shownHeight, shownWidth];
      }

      const maxX = Math.max(0, (shownWidth - rect.width) / 2);
      const maxY = Math.max(0, (shownHeight - rect.height) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [zoom, rotation, getCoverScale]
  );

  function applyZoom(nextZoom: number) {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    setZoom(clamped);
    setOffset((prev) => clampOffset(prev, clamped));
  }

  function applyRotation() {
    haptics.light();
    const next = (rotation + 90) % 360;
    setRotation(next);
    setOffset((prev) => clampOffset(prev, zoom, next));
  }

  // ─── Pointer dragging (mouse + touch through Pointer Events) ───
  function handlePointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch" && e.isPrimary === false) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging || pinchStart.current) return;
    setOffset(clampOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
  }

  function handlePointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
  }

  // ─── Pinch to zoom ───
  function touchDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      pinchStart.current = { distance: touchDistance(e.touches), zoom };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchStart.current) {
      e.preventDefault();
      const ratio = touchDistance(e.touches) / pinchStart.current.distance;
      applyZoom(pinchStart.current.zoom * ratio);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.touches.length < 2) pinchStart.current = null;
  }

  function handleWheel(e: React.WheelEvent) {
    applyZoom(zoom - e.deltaY * 0.002);
  }

  /** Turns the source data URL back into a File for upload. */
  async function sourceAsFile(name: string) {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const extension = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    return new File([blob], `${name}.${extension}`, { type: blob.type || "image/jpeg" });
  }

  /** Uploads the picked image untouched, for people who don't want a crop. */
  async function handleUseOriginal() {
    setIsUploadingOriginal(true);
    toast.loading("Uploading your photo...", { id: "crop-upload" });

    try {
      const file = await sourceAsFile(`${mode}_original_${Date.now()}`);
      const uploaded = await uploadImageToImgBB(file);
      toast.success("Photo updated!", { id: "crop-upload" });
      onCropComplete(uploaded.displayUrl || uploaded.url);
      onClose();
    } catch (err) {
      console.error("Original upload error:", err);
      toast.error("Upload failed. Please try again.", { id: "crop-upload" });
    } finally {
      setIsUploadingOriginal(false);
    }
  }

  async function handleSaveCrop() {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    setIsProcessing(true);

    try {
      const rect = container.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, output.width, output.height);

      // The preview frame and the output share an aspect ratio, so a single
      // factor maps preview pixels onto output pixels.
      const { drawWidth, drawHeight, translateX, translateY } = computeCropDraw({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        frameWidth: rect.width,
        frameHeight: rect.height,
        outputWidth: output.width,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      });

      ctx.save();
      // Mirrors the CSS `translate(offset) scale(zoom) rotate(deg)` on the preview.
      ctx.translate(output.width / 2 + translateX, output.height / 2 + translateY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to render cropped image");

      const file = new File([blob], `cropped_${mode}_${Date.now()}.jpg`, { type: "image/jpeg" });

      toast.loading("Saving your photo...", { id: "crop-upload" });
      const uploaded = await uploadImageToImgBB(file);

      toast.success("Photo updated!", { id: "crop-upload" });
      onCropComplete(uploaded.displayUrl || uploaded.url);
      onClose();
    } catch (err) {
      console.error("Crop error:", err);
      toast.error("Could not save the crop. Please try again.", { id: "crop-upload" });
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isOpen) return null;

  const busy = isProcessing || isUploadingOriginal;

  return (
    <div className="fixed inset-0 z-50 flex select-none items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg space-y-4 overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Move className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {mode === "avatar" ? "Position your photo" : "Position your cover"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-black/90 p-4">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={cn(
              "relative touch-none overflow-hidden border-2 border-primary/60 shadow-lg",
              isDragging ? "cursor-grabbing" : "cursor-grab",
              mode === "avatar" ? "size-64 rounded-full sm:size-72" : "aspect-3/1 w-full rounded-2xl"
            )}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              crossOrigin="anonymous"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.12s ease-out",
              }}
              className="pointer-events-none h-full w-full select-none object-cover"
            />
          </div>

          <p className="mt-2 text-[11px] font-medium text-white/50">
            Drag to reposition · pinch or scroll to zoom
          </p>
          {naturalSize && (
            <p className="text-[10px] font-medium text-white/35">
              Original {naturalSize.w}×{naturalSize.h} · saved at {output.width}×{output.height}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.25)}
              aria-label="Zoom out"
              className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ZoomOut className="size-4" />
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.02"
              value={zoom}
              aria-label="Zoom"
              onChange={(e) => applyZoom(parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-muted accent-primary"
            />
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.25)}
              aria-label="Zoom in"
              className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
            >
              <ZoomIn className="size-4" />
            </button>
            <span className="w-10 text-right text-xs font-bold text-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={applyRotation}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50"
            >
              <RotateCw className="size-3.5" /> Rotate 90°
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="cursor-pointer rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleUseOriginal}
            disabled={busy}
            title="Upload the photo exactly as it is, without cropping"
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border/60 px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
          >
            {isUploadingOriginal ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImageUp className="size-3.5" />
            )}
            <span>Upload without cropping</span>
          </button>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={busy}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
