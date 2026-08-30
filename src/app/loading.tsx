"use client";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-0.5 w-full bg-primary/20 overflow-hidden">
        <div className="h-full bg-primary w-1/2 animate-pulse" />
      </div>
    </div>
  );
}
