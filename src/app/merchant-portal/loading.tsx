export default function MerchantLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <div className="absolute size-20 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <img
          src="/logo.png"
          alt="CampusLoop"
          className="relative size-12 sm:size-14 object-contain animate-pulse duration-1000 drop-shadow-md"
        />
      </div>
    </div>
  );
}
