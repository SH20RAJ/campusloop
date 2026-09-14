"use client";

import {
  ArrowRight,
  GraduationCap,
  HelpCircle,
  MapPin,
  Plus,
  Rocket,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/landing/landing-design-system";
import { cn } from "@/lib/utils";

interface CollegeItem {
  name: string;
  slug: string;
  location: string;
  state: string;
  category: "IIT" | "NIT" | "BITS" | "CENTRAL" | "DEEMED" | "STATE";
  status: "active" | "waitlist";
  students: string;
  domain: string;
}

const FEATURED_COLLEGES: CollegeItem[] = [
  {
    name: "Birla Institute of Technology, Mesra",
    slug: "bit-mesra",
    location: "Ranchi, Jharkhand",
    state: "Jharkhand",
    category: "DEEMED",
    status: "active",
    students: "4,890+ students",
    domain: "bitmesra.ac.in",
  },
  {
    name: "Indian Institute of Technology Delhi",
    slug: "iit-delhi",
    location: "Hauz Khas, New Delhi",
    state: "Delhi",
    category: "IIT",
    status: "active",
    students: "4,310+ students",
    domain: "iitd.ac.in",
  },
  {
    name: "Indian Institute of Technology Bombay",
    slug: "iit-bombay",
    location: "Powai, Mumbai",
    state: "Maharashtra",
    category: "IIT",
    status: "active",
    students: "4,950+ students",
    domain: "iitb.ac.in",
  },
  {
    name: "BITS Pilani (Pilani Campus)",
    slug: "bits-pilani",
    location: "Pilani, Rajasthan",
    state: "Rajasthan",
    category: "BITS",
    status: "active",
    students: "3,780+ students",
    domain: "bits-pilani.ac.in",
  },
  {
    name: "National Institute of Technology Karnataka",
    slug: "nit-surathkal",
    location: "Surathkal, Mangalore",
    state: "Karnataka",
    category: "NIT",
    status: "active",
    students: "3,420+ students",
    domain: "nitk.edu.in",
  },
  {
    name: "National Institute of Technology Tiruchirappalli",
    slug: "nit-trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    state: "Tamil Nadu",
    category: "NIT",
    status: "active",
    students: "3,890+ students",
    domain: "nitt.edu",
  },
  {
    name: "Delhi University (North Campus)",
    slug: "delhi-university",
    location: "New Delhi",
    state: "Delhi",
    category: "CENTRAL",
    status: "active",
    students: "7,200+ students",
    domain: "du.ac.in",
  },
  {
    name: "Vellore Institute of Technology",
    slug: "vit-vellore",
    location: "Vellore, Tamil Nadu",
    state: "Tamil Nadu",
    category: "DEEMED",
    status: "active",
    students: "6,100+ students",
    domain: "vit.ac.in",
  },
  {
    name: "Thapar Institute of Engineering & Tech",
    slug: "thapar-university",
    location: "Patiala, Punjab",
    state: "Punjab",
    category: "DEEMED",
    status: "waitlist",
    students: "1,240 on waitlist",
    domain: "thapar.edu",
  },
  {
    name: "Manipal Academy of Higher Education",
    slug: "mahe-manipal",
    location: "Manipal, Karnataka",
    state: "Karnataka",
    category: "DEEMED",
    status: "waitlist",
    students: "1,890 on waitlist",
    domain: "manipal.edu",
  },
  {
    name: "Delhi Technological University (DTU)",
    slug: "dtu-delhi",
    location: "Rohini, New Delhi",
    state: "Delhi",
    category: "STATE",
    status: "active",
    students: "4,150+ students",
    domain: "dtu.ac.in",
  },
  {
    name: "Netaji Subhas University of Technology",
    slug: "nsut-delhi",
    location: "Dwarka, New Delhi",
    state: "Delhi",
    category: "STATE",
    status: "waitlist",
    students: "980 on waitlist",
    domain: "nsut.ac.in",
  },
];

export function CollegesPublicClient({
  isAuthenticated: _isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestCollegeName, setRequestCollegeName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");

  const filteredColleges = useMemo(() => {
    return FEATURED_COLLEGES.filter((college) => {
      const matchesQuery =
        college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.domain.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || college.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestCollegeName || !requestEmail) {
      toast.error("Please fill in both your college name and institutional email.");
      return;
    }
    toast.success(
      `Request received for ${requestCollegeName}! We will notify you once 5 students join the waitlist.`
    );
    setRequestCollegeName("");
    setRequestEmail("");
    setRequestModalOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <GraduationCap className="size-3.5" />
          1,350+ Accredited Campuses
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
          Find Your University Loop
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Every Indian college on CampusLoop has a dedicated, verified student hub.
          Search your campus below or request a new loop for your institution.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, city, or domain..."
            className="w-full rounded-full border border-zinc-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0E131F]/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {["ALL", "IIT", "NIT", "BITS", "DEEMED", "STATE"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "border-border/60 text-muted-foreground hover:bg-muted/60"
              )}
            >
              {cat}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setRequestModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
          >
            <Plus className="size-3" /> Request Hub
          </button>
        </div>
      </div>

      {/* College Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((c) => {
          const isActive = c.status === "active";
          return (
            <div
              key={c.slug}
              className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/40">
                    {c.category}
                  </span>
                  {isActive ? (
                    <StatusPill status="live" label="Active Loop" />
                  ) : (
                    <StatusPill status="paused" label="Waitlist" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    {c.location}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground font-mono text-[11px]">
                    @{c.domain}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {c.students}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <Link
                  href={`/colleges/${c.slug}`}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View Campus Hub <ArrowRight className="size-3" />
                </Link>
                {isActive ? (
                  <Link
                    href={`/handler/sign-up?college=${c.slug}`}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 text-[11px]"
                  >
                    Join Loop
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRequestCollegeName(c.name);
                      setRequestModalOpen(true);
                    }}
                    className="rounded-full border border-border/70 hover:bg-muted/60 px-3 py-1 text-[11px] font-medium"
                  >
                    Join Waitlist
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredColleges.length === 0 && (
        <div className="text-center py-16 space-y-3 rounded-3xl border border-dashed border-border/80 p-8">
          <HelpCircle className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">
            No campus matched &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your university might not be indexed yet. Submit a request to launch your
            campus hub!
          </p>
          <button
            type="button"
            onClick={() => setRequestModalOpen(true)}
            className="rounded-full bg-blue-600 text-white px-4 py-2 text-xs font-bold"
          >
            Request Your College Hub
          </button>
        </div>
      )}

      {/* ─── Request Hub Modal ─── */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#111622] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="size-4 text-blue-600" />
                <h3 className="text-base font-bold text-foreground">
                  Request a Campus Hub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">College Name</label>
                <input
                  type="text"
                  required
                  value={requestCollegeName}
                  onChange={(e) => setRequestCollegeName(e.target.value)}
                  placeholder="e.g. NIT Rourkela"
                  className="w-full rounded-xl border border-border/70 bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Your College Email (.ac.in / .edu.in)
                </label>
                <input
                  type="email"
                  required
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="rollno@nitrkl.ac.in"
                  className="w-full rounded-xl border border-border/70 bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                We activate new university loops once 5 students request access. You
                will be invited as a founding student lead!
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 text-xs shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
