export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background select-none">
      <div className="relative flex items-center justify-center">
        {/* Subtle glowing ambient halo */}
        <div className="absolute size-24 rounded-full bg-primary/20 blur-xl animate-pulse" />
        
        {/* Centered CampusLoop Logo with smooth breathing effect */}
        <img
          src="/logo.png"
          alt="CampusLoop"
          className="relative size-14 sm:size-16 object-contain animate-pulse duration-1000 drop-shadow-md"
        />
      </div>
    </div>
  );
}
