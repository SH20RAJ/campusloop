"use client";

import { fetchCollegeWikipediaSummary } from "@/lib/college-enricher";
import { uploadImageToImgBB } from "@/lib/upload";
import {
Globe,
Image as ImageIcon,
Loader2,
Save,
School,
Sparkles,
Trophy,
Upload,
X,
} from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { toast } from "sonner";
import { updateCollegeDetails } from "./actions";

export interface CollegeEditData {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
  district?: string | null;
  website?: string | null;
  yearOfEstablishment?: number | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  nirfRank?: number | null;
  description?: string | null;
  extraData?: Record<string, unknown> | null;
}

interface EditCollegeModalProps {
  college: CollegeEditData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditCollegeModal({
  college,
  onClose,
  onSaved,
}: EditCollegeModalProps) {
  const [name, setName] = useState(college?.name || "");
  const [logoUrl, setLogoUrl] = useState(college?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(college?.bannerUrl || "");
  const [website, setWebsite] = useState(college?.website || "");
  const [nirfRank, setNirfRank] = useState<string>(
    college?.nirfRank ? String(college.nirfRank) : ""
  );
  const [yearOfEstablishment, setYearOfEstablishment] = useState<string>(
    college?.yearOfEstablishment ? String(college.yearOfEstablishment) : ""
  );
  const [state, setState] = useState(college?.state || "");
  const [district, setDistrict] = useState(college?.district || "");
  const [description, setDescription] = useState(college?.description || "");

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (college) {
      setName(college.name);
      setLogoUrl(college.logoUrl || "");
      setBannerUrl(college.bannerUrl || "");
      setWebsite(college.website || "");
      setNirfRank(college.nirfRank ? String(college.nirfRank) : "");
      setYearOfEstablishment(
        college.yearOfEstablishment ? String(college.yearOfEstablishment) : ""
      );
      setState(college.state || "");
      setDistrict(college.district || "");
      setDescription(college.description || "");
    }
  }, [college]);

  if (!college) return null;

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      toast.loading("Uploading college logo...", { id: "upload-logo" });
      const res = await uploadImageToImgBB(file);
      setLogoUrl(res.displayUrl || res.url);
      toast.success("Logo uploaded successfully! 🎓", { id: "upload-logo" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo upload failed", {
        id: "upload-logo",
      });
    } finally {
      setIsUploadingLogo(false);
      if (logoFileRef.current) logoFileRef.current.value = "";
    }
  }

  async function handleUploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      toast.loading("Uploading campus banner...", { id: "upload-banner" });
      const res = await uploadImageToImgBB(file);
      setBannerUrl(res.displayUrl || res.url);
      toast.success("Banner uploaded successfully! 🖼️", { id: "upload-banner" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Banner upload failed", {
        id: "upload-banner",
      });
    } finally {
      setIsUploadingBanner(false);
      if (bannerFileRef.current) bannerFileRef.current.value = "";
    }
  }

  async function handleAutoEnrich() {
    setIsEnriching(true);
    try {
      toast.loading("Searching Wikipedia & educational databases...", {
        id: "enrich",
      });
      const data = await fetchCollegeWikipediaSummary(name);
      if (!data) {
        toast.error("No matching Wikipedia article found for this college.", {
          id: "enrich",
        });
        return;
      }

      if (data.extract) setDescription(data.extract);
      if (data.thumbnailUrl && !logoUrl) setLogoUrl(data.thumbnailUrl);
      if (data.originalImageUrl && !bannerUrl) setBannerUrl(data.originalImageUrl);

      toast.success("Auto-fetched data from Wikipedia!", { id: "enrich" });
    } catch {
      toast.error("Failed to auto-fetch Wikipedia data", { id: "enrich" });
    } finally {
      setIsEnriching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!college || !name.trim()) return;

    setIsSaving(true);
    try {
      await updateCollegeDetails(college.id, {
        name,
        logoUrl: logoUrl.trim() || null,
        bannerUrl: bannerUrl.trim() || null,
        website: website.trim() || null,
        nirfRank: nirfRank ? parseInt(nirfRank, 10) : null,
        yearOfEstablishment: yearOfEstablishment
          ? parseInt(yearOfEstablishment, 10)
          : null,
        state: state.trim() || null,
        district: district.trim() || null,
        description: description.trim() || null,
      });

      toast.success(`Updated ${name} successfully! 🚀`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update college");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <School className="size-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">
              Edit College Hub Media &amp; Info
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={logoFileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleUploadLogo}
        />
        <input
          ref={bannerFileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUploadBanner}
        />

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Live Media Previews & Uploads */}
          <div className="space-y-3 p-4 rounded-2xl border border-border/80 bg-muted/20">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-primary" /> Campus Banner &amp; Official Logo
            </span>

            {/* Live Banner Preview Card */}
            <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center group">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  No banner set. Upload or paste URL below.
                </span>
              )}

              {/* Logo Overlay Preview */}
              <div className="absolute bottom-2 left-3 size-14 rounded-xl bg-card border-2 border-border shadow-lg p-1 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <School className="size-6 text-primary/60" />
                )}
              </div>
            </div>

            {/* Upload Buttons Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                disabled={isUploadingLogo}
                onClick={() => logoFileRef.current?.click()}
                className="h-9 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted font-bold text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {isUploadingLogo ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Upload className="size-3.5 text-primary" />
                )}
                <span>Upload Logo (PFP)</span>
              </button>

              <button
                type="button"
                disabled={isUploadingBanner}
                onClick={() => bannerFileRef.current?.click()}
                className="h-9 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted font-bold text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {isUploadingBanner ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Upload className="size-3.5 text-orange-500" />
                )}
                <span>Upload Campus Banner</span>
              </button>
            </div>

            {/* URL Input Fields */}
            <div className="space-y-2 pt-2">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Logo URL (Direct Image Link)
                </label>
                <input
                  type="url"
                  placeholder="https://upload.wikimedia.org/.../logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Banner Image URL (Direct Image Link)
                </label>
                <input
                  type="url"
                  placeholder="https://bitmesra.ac.in/.../campus_banner.jpg"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* College Information Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                College Official Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Est. Year
                </label>
                <input
                  type="number"
                  placeholder="1955"
                  value={yearOfEstablishment}
                  onChange={(e) => setYearOfEstablishment(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1 text-amber-500">
                  <Trophy className="size-3" /> NIRF Rank
                </label>
                <input
                  type="number"
                  placeholder="53"
                  value={nirfRank}
                  onChange={(e) => setNirfRank(e.target.value)}
                  className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Globe className="size-3" /> Official Website
              </label>
              <input
                type="text"
                placeholder="https://bitmesra.ac.in"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full h-9 px-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            {/* Description & Auto-Enrich */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  College Description &amp; History Summary
                </label>
                <button
                  type="button"
                  disabled={isEnriching}
                  onClick={handleAutoEnrich}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                >
                  {isEnriching ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  <span>Auto-Fetch from Wikipedia</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of campus history, accreditations, and achievements..."
                className="w-full p-3 mt-1 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:border-primary resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
