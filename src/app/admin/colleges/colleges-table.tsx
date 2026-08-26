"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Edit3,Globe,PlusIcon,School,Search,Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo,useState } from "react";
import { toast } from "sonner";
import { addDomain,deleteCollege,removeDomain } from "./actions";
import { CollegeEditData,EditCollegeModal } from "./edit-college-modal";

interface CollegeRow {
  id: string;
  name: string;
  slug: string;
  district: string | null;
  state: string | null;
  country: string;
  website?: string | null;
  yearOfEstablishment?: number | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  nirfRank?: number | null;
  description?: string | null;
  domains?: { id: string; domain: string }[];
}

export function CollegesTable({ initialColleges }: { initialColleges: CollegeRow[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [activeInstId, setActiveInstId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeEditData | null>(null);
  const [deleteCollegeData, setDeleteCollegeData] = useState<{ id: string; name: string } | null>(null);
  const [removeDomainId, setRemoveDomainId] = useState<string | null>(null);

  const filteredColleges = useMemo(() => {
    if (!searchQuery.trim()) return initialColleges;
    const q = searchQuery.toLowerCase();
    return initialColleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q))
    );
  }, [initialColleges, searchQuery]);

  async function confirmDeleteCollege() {
    if (!deleteCollegeData) return;
    setIsLoading(true);
    try {
      await deleteCollege(deleteCollegeData.id);
      toast.success("College hub deleted");
      setDeleteCollegeData(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete college");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDomain(institutionId: string) {
    if (!newDomain.trim()) return;
    setIsLoading(true);
    try {
      await addDomain(institutionId, newDomain.trim().toLowerCase());
      toast.success(`Domain @${newDomain} added!`);
      setNewDomain("");
      setActiveInstId(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmRemoveDomain() {
    if (!removeDomainId) return;
    setIsLoading(true);
    try {
      await removeDomain(removeDomainId);
      toast.success("Domain removed");
      setRemoveDomainId(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove domain");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search colleges by name, slug, state, or district..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />
      </div>

      <div className="w-full overflow-x-auto border border-border rounded-2xl bg-card shadow-xs">
        <table className="w-full text-left text-sm text-muted-foreground">
          <thead className="bg-muted/60 text-[11px] font-black uppercase tracking-wider text-foreground border-b border-border">
            <tr>
              <th className="px-6 py-3.5">College &amp; Branding</th>
              <th className="px-6 py-3.5">Location &amp; Rank</th>
              <th className="px-6 py-3.5">Allowed Domains</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredColleges.map((college) => (
              <tr key={college.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* Logo Thumbnail */}
                    <div className="size-10 rounded-xl bg-card border border-border shadow-2xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {college.logoUrl ? (
                        <img
                          src={college.logoUrl}
                          alt={college.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <School className="size-5 text-muted-foreground/60" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-foreground">
                          {college.name}
                        </span>
                        {college.bannerUrl && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                            Banner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>slug: <code className="text-foreground">{college.slug}</code></span>
                        {college.website && (
                          <a
                            href={college.website.startsWith("http") ? college.website : `https://${college.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-primary flex items-center gap-0.5"
                          >
                            <Globe className="size-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-3.5 text-xs">
                  <div>
                    <span className="font-medium text-foreground">
                      {college.district ? `${college.district}, ` : ""}{college.state || college.country}
                    </span>
                    {college.nirfRank && (
                      <span className="block text-[10px] text-amber-500 font-bold">
                        NIRF #{college.nirfRank}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {college.domains?.map((d) => (
                      <span
                        key={d.id}
                        className="flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/60"
                      >
                        @{d.domain}
                        <button
                          onClick={() => setRemoveDomainId(d.id)}
                          className="hover:text-destructive ml-0.5 cursor-pointer"
                          disabled={isLoading}
                        >
                          &times;
                        </button>
                      </span>
                    ))}

                    {activeInstId === college.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. bitmesra.ac.in"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          className="rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => handleAddDomain(college.id)}
                          disabled={isLoading}
                          className="text-xs font-bold text-primary cursor-pointer hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setActiveInstId(null)}
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveInstId(college.id)}
                        className="flex items-center gap-1 rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                      >
                        <PlusIcon className="h-3 w-3" /> Add Domain
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingCollege(college)}
                      className="px-2.5 py-1 rounded-lg border border-border bg-card text-xs font-bold text-foreground hover:bg-muted hover:text-primary transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Edit College Details & Media"
                    >
                      <Edit3 className="size-3 text-primary" />
                      <span>Edit Media</span>
                    </button>

                    <button
                      onClick={() => setDeleteCollegeData({ id: college.id, name: college.name })}
                      disabled={isLoading}
                      className="size-7 rounded-lg border border-transparent hover:border-destructive/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete College"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredColleges.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground">
                  No colleges found matching your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit College Media & Details Modal */}
      {editingCollege && (
        <EditCollegeModal
          college={editingCollege}
          onClose={() => setEditingCollege(null)}
          onSaved={() => {
            router.refresh();
          }}
        />
      )}

      {/* Delete College Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteCollegeData)}
        title="Delete College Hub?"
        description={`Are you sure you want to delete ${deleteCollegeData?.name || "this college"}? This will permanently delete all associated student accounts, posts, and domains.`}
        confirmText="Delete College"
        variant="danger"
        isLoading={isLoading}
        onClose={() => setDeleteCollegeData(null)}
        onConfirm={confirmDeleteCollege}
      />

      {/* Remove Domain Modal */}
      <ConfirmDialog
        isOpen={Boolean(removeDomainId)}
        title="Remove Allowed Domain?"
        description="Are you sure you want to remove this verified email domain? New signups with this domain will no longer be allowed."
        confirmText="Remove Domain"
        variant="warning"
        isLoading={isLoading}
        onClose={() => setRemoveDomainId(null)}
        onConfirm={confirmRemoveDomain}
      />
    </div>
  );
}
