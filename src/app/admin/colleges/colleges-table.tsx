"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCollege, addDomain, removeDomain } from "./actions";
import { Trash2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CollegeRow {
  id: string;
  name: string;
  district: string | null;
  state: string | null;
  country: string;
  domains?: { id: string; domain: string }[];
}

export function CollegesTable({ initialColleges }: { initialColleges: CollegeRow[] }) {
  const router = useRouter();
  const [newDomain, setNewDomain] = useState("");
  const [activeInstId, setActiveInstId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteCollegeData, setDeleteCollegeData] = useState<{ id: string; name: string } | null>(null);
  const [removeDomainId, setRemoveDomainId] = useState<string | null>(null);

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
    <div className="w-full overflow-x-auto border rounded-lg bg-card">
      <table className="w-full text-left text-sm text-muted-foreground">
        <thead className="bg-muted text-xs uppercase text-foreground">
          <tr>
            <th className="px-6 py-4">College Name</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Allowed Domains</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialColleges.map((college) => (
            <tr key={college.id} className="border-b border-border hover:bg-muted/50">
              <td className="px-6 py-4 font-medium text-foreground">{college.name}</td>
              <td className="px-6 py-4">{college.district || college.state}, {college.country}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {college.domains?.map((d) => (
                    <span key={d.id} className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground border">
                      @{d.domain}
                      <button onClick={() => setRemoveDomainId(d.id)} className="hover:text-foreground ml-1 cursor-pointer" disabled={isLoading}>
                        &times;
                      </button>
                    </span>
                  ))}
                  
                  {activeInstId === college.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. mit.edu"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="rounded border border-input bg-transparent px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button onClick={() => handleAddDomain(college.id)} disabled={isLoading} className="text-xs font-semibold text-primary cursor-pointer">Save</button>
                      <button onClick={() => setActiveInstId(null)} className="text-xs text-muted-foreground cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveInstId(college.id)} className="flex items-center gap-1 rounded-full border border-input px-2.5 py-0.5 text-xs text-foreground hover:bg-muted cursor-pointer">
                      <PlusIcon className="h-3 w-3" /> Add Domain
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => setDeleteCollegeData({ id: college.id, name: college.name })}
                  disabled={isLoading}
                  className="text-destructive hover:text-red-400 cursor-pointer"
                  title="Delete College"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {initialColleges.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center">No colleges found. Seed the database first.</td>
            </tr>
          )}
        </tbody>
      </table>

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
