"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCollege, addDomain, removeDomain } from "./actions";
import { Trash2Icon, PlusIcon } from "lucide-react";

export function CollegesTable({ initialColleges }: { initialColleges: any[] }) {
  const router = useRouter();
  const [newDomain, setNewDomain] = useState("");
  const [activeInstId, setActiveInstId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all users and posts associated with this college!")) return;
    setIsLoading(true);
    await deleteCollege(id);
    setIsLoading(false);
    router.refresh();
  }

  async function handleAddDomain(institutionId: string) {
    if (!newDomain) return;
    setIsLoading(true);
    try {
      await addDomain(institutionId, newDomain);
      setNewDomain("");
      setActiveInstId(null);
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to add domain");
    }
    setIsLoading(false);
  }

  async function handleRemoveDomain(domainId: string) {
    if (!confirm("Remove this domain?")) return;
    setIsLoading(true);
    await removeDomain(domainId);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-muted-foreground">
        <thead className="bg-white/5 text-xs uppercase text-white">
          <tr>
            <th className="px-6 py-4">College Name</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Allowed Domains</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialColleges.map((college) => (
            <tr key={college.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="px-6 py-4 font-medium text-white">{college.name}</td>
              <td className="px-6 py-4">{college.district || college.state}, {college.country}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {college.domains?.map((d: any) => (
                    <span key={d.id} className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                      @{d.domain}
                      <button onClick={() => handleRemoveDomain(d.id)} className="hover:text-white" disabled={isLoading}>
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
                        className="rounded border border-white/20 bg-black px-2 py-1 text-xs text-white outline-none"
                      />
                      <button onClick={() => handleAddDomain(college.id)} disabled={isLoading} className="text-xs font-semibold text-primary">Save</button>
                      <button onClick={() => setActiveInstId(null)} className="text-xs text-muted-foreground">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveInstId(college.id)} className="flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-xs hover:bg-white/10">
                      <PlusIcon className="h-3 w-3" /> Add Domain
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button onClick={() => handleDelete(college.id)} disabled={isLoading} className="text-destructive hover:text-red-400">
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
    </div>
  );
}
