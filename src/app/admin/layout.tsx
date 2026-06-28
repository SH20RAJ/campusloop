import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { LayoutDashboard, School, ShieldAlert, ArrowLeft, Users, FileText, MessageSquare } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verify Passkey Cookie first (bypass DB check)
  const cookieStore = await cookies();
  const passkey = cookieStore.get("admin_session")?.value;
  
  let isAuthorized = passkey === "17092006";

  if (!isAuthorized) {
    // 2. Fallback to normal role check
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      redirect("/admin-login");
    }

    const db = getDb();

    // If there are 0 users, auto-create the first user as ADMIN
    const profilesCount = await db.select({ count: sql<number>`count(*)` }).from(userProfiles);
    if (profilesCount[0]?.count === 0) {
      const fallbackInst = await db.query.institutions.findFirst();
      if (fallbackInst) {
        const email = user.primaryEmail || "admin@campusloop.com";
        const username = email.split("@")[0] || "admin";
        
        await db.insert(userProfiles).values({
          userId: user.id,
          username,
          displayName: "Admin",
          institutionId: fallbackInst.id,
          onboardingCompleted: true,
          role: "ADMIN",
          status: "ACTIVE",
        });
      }
    }

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (profile && profile.role === "ADMIN") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    redirect("/admin-login");
  }

  return (
    <div className="relative min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border bg-card px-4 py-6 md:flex md:flex-col justify-between">
        <div className="space-y-6">
          <div className="px-3 py-2 text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            CampusLoop Admin
          </div>
          
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              Dashboard
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <Users className="h-4 w-4 text-muted-foreground" />
              Users
            </Link>
            <Link href="/admin/posts" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Posts
            </Link>
            <Link href="/admin/comments" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Comments
            </Link>
            <Link href="/admin/colleges" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <School className="h-4 w-4 text-muted-foreground" />
              Colleges
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Reports
            </Link>
            <Link href="/app/campus" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Exit Admin
            </Link>
          </nav>
        </div>
        
        <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border pt-4">
          Admin Console • Secure Session
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-6 py-4 md:hidden">
          <h1 className="text-md font-bold tracking-tight text-foreground flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            CampusLoop Admin
          </h1>
          <nav className="flex gap-4">
            <Link href="/admin" className="text-xs font-semibold hover:text-primary">Dashboard</Link>
            <Link href="/admin/posts" className="text-xs font-semibold hover:text-primary">Posts</Link>
            <Link href="/admin/comments" className="text-xs font-semibold hover:text-primary">Comments</Link>
          </nav>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
