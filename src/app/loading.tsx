export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Minimal Spinner */}
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-2 border-muted/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        
        {/* Text */}
        <p className="text-xs text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
