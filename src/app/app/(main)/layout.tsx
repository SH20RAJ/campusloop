import { GlassBottomNav } from "@/components/ui/glass-bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* 
        pb-24 ensures content doesn't get hidden behind the floating bottom nav.
        bg-background is the off-white/dark color defined in globals.css 
      */}
      {children}
      <GlassBottomNav />
    </div>
  );
}
