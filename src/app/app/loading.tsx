export default function AppLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Subtle glowing ambient halo */}
        <div className="absolute size-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
        
        {/* Centered CampusLoop Logo */}
        <img
          src="/logo.png"
          alt="CampusLoop"
          className="relative size-12 sm:size-14 object-contain animate-pulse duration-1000 drop-shadow-md"
        />
      </div>
    </div>
  );
}
