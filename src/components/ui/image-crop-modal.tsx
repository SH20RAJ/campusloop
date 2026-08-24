"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, Move } from "lucide-react";
import { uploadImageToImgBB } from "@/lib/upload";
import { toast } from "sonner";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  mode: "avatar" | "banner";
  onCropComplete: (croppedUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  mode,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Reset transform state when image opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  async function handleSaveCrop() {
    if (!imgRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const outputWidth = mode === "avatar" ? 500 : 1200;
      const outputHeight = mode === "avatar" ? 500 : 400;

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Translate to canvas center
      ctx.translate(outputWidth / 2, outputHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Scale factors based on container vs canvas
      const scaleX = outputWidth / rect.width;
      const scaleY = outputHeight / rect.height;
      const scale = Math.max(scaleX, scaleY);

      const drawWidth = img.naturalWidth * zoom * (rect.width / img.width) * scaleX;
      const drawHeight = img.naturalHeight * zoom * (rect.height / img.height) * scaleY;

      ctx.drawImage(
        img,
        -drawWidth / 2 + offset.x * scale,
        -drawHeight / 2 + offset.y * scale,
        drawWidth,
        drawHeight
      );

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );

      if (!blob) throw new Error("Failed to render cropped image");

      const file = new File([blob], `cropped_${mode}_${Date.now()}.jpg`, { type: "image/jpeg" });

      toast.loading("Saving and uploading cropped image...", { id: "crop-upload" });
      const uploaded = await uploadImageToImgBB(file);
      const finalUrl = uploaded.displayUrl || uploaded.url;

      toast.success("Image cropped & updated! ✨", { id: "crop-upload" });
      onCropComplete(finalUrl);
      onClose();
    } catch (err) {
      console.error("Crop error:", err);
      toast.error("Failed to crop image. Try again.", { id: "crop-upload" });
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-5 shadow-2xl space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Move className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {mode === "avatar" ? "Resize & Crop Profile Photo" : "Reposition & Crop Cover Banner"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Viewport Mask */}
        <div className="flex flex-col items-center justify-center bg-black/90 rounded-2xl p-4 overflow-hidden">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative overflow-hidden cursor-grab active:cursor-grabbing border-2 border-primary/60 shadow-lg ${
              mode === "avatar"
                ? "size-64 sm:size-72 rounded-full"
                : "w-full h-44 sm:h-52 rounded-2xl"
            }`}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop Preview"
              crossOrigin="anonymous"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="w-full h-full object-cover pointer-events-none select-none"
            />
          </div>

          <p className="text-[11px] text-white/50 mt-2 font-medium">
            Drag photo to reposition • Use slider to zoom
          </p>
        </div>

        {/* Controls Toolbar */}
        <div className="space-y-3 px-1">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="size-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
            <ZoomIn className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold text-foreground w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
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
              className="px-3 py-1.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveCrop}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            <span>Apply & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
