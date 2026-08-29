import type { Metadata } from "next";
import Link from "next/link";

import { resolveAdminSession } from "./_lib/guard";

export const metadata: Metadata = {
	title: {
		default: "Admin Console",
		template: "%s | CampusLoop Admin",
	},
	description: "Internal moderation console — content review, user management, and audit trails.",
	robots: {
		index: false,
		follow: false,
	},
};

import {
	ArrowLeft,
	Bike,
	FileText,
	Ghost,
	LayoutDashboard,
	MessageSquare,
	School,
	ScrollText,
	ShieldAlert,
	ShoppingBag,
	Store,
	Users,
	UtensilsCrossed,
} from "lucide-react";


const primaryNav = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/admin/review", label: "Review Queue", icon: ShieldAlert },
	{ href: "/admin/reports", label: "Reports", icon: ShieldAlert },
];

const contentNav = [
	{ href: "/admin/posts", label: "Posts", icon: FileText },
	{ href: "/admin/comments", label: "Comments", icon: MessageSquare },
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/colleges", label: "Colleges", icon: School },
];

const commercialNav = [
	{ href: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
	{ href: "/admin/marketplace/merchants", label: "Merchants", icon: Store },
	{ href: "/admin/marketplace/products", label: "Products", icon: UtensilsCrossed },
	{ href: "/admin/marketplace/rentals", label: "Bike Rentals", icon: Bike },
];

const systemNav = [{ href: "/admin/audit", label: "Audit Log", icon: ScrollText }];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-muted text-foreground transition-colors"
		>
			<Icon className="h-4 w-4 text-muted-foreground" />
			{label}
		</Link>
	);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	await resolveAdminSession();

	return (
		<div className="relative min-h-screen bg-background flex">
			{/* Desktop Sidebar */}
			<aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-border bg-card px-4 py-6 md:flex md:flex-col justify-between overflow-y-auto">
				<div className="space-y-6">
					<Link href="/admin" className="px-3 py-2 text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
						CampusLoop Admin
					</Link>

					<nav className="space-y-1" aria-label="Moderation">
						<p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Safety</p>
						{primaryNav.map((item) => (
							<NavLink key={item.href} {...item} />
						))}
					</nav>

					<nav className="space-y-1" aria-label="Content">
						<p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Content</p>
						{contentNav.map((item) => (
							<NavLink key={item.href} {...item} />
						))}
					</nav>

					<nav className="space-y-1" aria-label="Commerce">
						<p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Marketplace</p>
						{commercialNav.map((item) => (
							<NavLink key={item.href} {...item} />
						))}
					</nav>

					<nav className="space-y-1" aria-label="System">
						<p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System</p>
						{systemNav.map((item) => (
							<NavLink key={item.href} {...item} />
						))}
					</nav>
				</div>

				<div className="space-y-3 px-3 pt-4 border-t border-border">
					<Link
						href="/app"
						className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> Exit Admin
					</Link>
					<p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
						<Ghost className="h-3 w-3" /> Identity reveals are audit-logged
					</p>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 md:pl-64 flex flex-col min-h-screen">
				<header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-6 py-4 md:hidden">
					<h1 className="text-md font-bold tracking-tight text-foreground flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
						CampusLoop Admin
					</h1>
					<nav className="flex gap-3 overflow-x-auto">
						{[...primaryNav, ...contentNav].map((item) => (
							<Link key={item.href} href={item.href} className="text-xs font-semibold whitespace-nowrap hover:text-primary transition-colors">
								{item.label}
							</Link>
						))}
					</nav>
				</header>

				<main className="flex-1 p-6 md:p-8">{children}</main>
			</div>
		</div>
	);
}
