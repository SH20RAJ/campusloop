"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulsing Ambient Backlight */}
        <div className="absolute size-24 rounded-full bg-primary/20 blur-2xl animate-pulse" />

        {/* Minimal Logo with breathing animation */}
        <div className="relative z-10 flex items-center justify-center animate-pulse">
          <img
            src="/logo.png"
            alt="CampusLoop"
            className="size-14 object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
