"use client";

import { useState, useRef, useEffect } from "react";
import { FeedPost } from "@/hooks/use-feed";
import { getAvatarUrl } from "@/lib/utils";
import { X, Download, Share2, MessageCircle, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareStoryModalProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: "dark", name: "Campus Dark", bg: "from-zinc-950 via-black to-zinc-900", accent: "#f97316" },
  { id: "orange", name: "Campus Fire", bg: "from-orange-600 via-amber-600 to-rose-700", accent: "#ffffff" },
  { id: "pink", name: "Confession Tea", bg: "from-pink-600 via-rose-600 to-purple-800", accent: "#ffffff" },
  { id: "cyan", name: "Cyber Campus", bg: "from-cyan-600 via-blue-600 to-indigo-900", accent: "#ffffff" },
];

export function ShareStoryModal({ post, isOpen, onClose }: ShareStoryModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const postUrl = typeof window !== "undefined" ? `${window.location.origin}/app/post/${post.id}` : `https://campusloop.space/app/post/${post.id}`;

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author.displayName;
  const authorHandle = post.isAnonymous ? "anonymous" : post.author.username;
  const avatarUrl = post.isAnonymous ? "" : getAvatarUrl(post.author.avatarUrl, post.author.username);

  function handleShareWhatsApp() {
    let text = "";
    if (post.type === "CONFESSION") {
      text = `🤫 Anonymous Confession on CampusLoop:\n"${post.body.slice(0, 120)}${post.body.length > 120 ? "..." : ""}"\n\nRead full tea at: ${postUrl}`;
    } else if (post.type === "POLL") {
      text = `📊 Campus Poll on CampusLoop:\n"${post.body.slice(0, 120)}${post.body.length > 120 ? "..." : ""}"\n\nCast your vote at: ${postUrl}`;
    } else {
      text = `🔥 Hot topic on CampusLoop:\n"${post.body.slice(0, 120)}${post.body.length > 120 ? "..." : ""}"\n\nJoin the discussion at: ${postUrl}`;
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share!");
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Link copied to clipboard! 🚀");
    setTimeout(() => setCopied(false), 2000);
  }

  // Draw 9:16 Story Card on HTML Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 9:16 aspect ratio dimensions (1080 x 1920)
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    if (selectedTheme.id === "dark") {
      gradient.addColorStop(0, "#09090b");
      gradient.addColorStop(0.5, "#000000");
      gradient.addColorStop(1, "#18181b");
    } else if (selectedTheme.id === "orange") {
      gradient.addColorStop(0, "#ea580c");
      gradient.addColorStop(0.5, "#d97706");
      gradient.addColorStop(1, "#be123c");
    } else if (selectedTheme.id === "pink") {
      gradient.addColorStop(0, "#db2777");
      gradient.addColorStop(0.5, "#e11d48");
      gradient.addColorStop(1, "#6b21a8");
    } else {
      gradient.addColorStop(0, "#0891b2");
      gradient.addColorStop(0.5, "#2563eb");
      gradient.addColorStop(1, "#312e81");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Draw Top Branding
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px sans-serif";
    ctx.fillText("CampusLoop", 120, 160);

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "34px sans-serif";
    ctx.fillText("VERIFIED STUDENT NETWORK", 120, 215);

    // 3. Draw Center Card Container
    const cardX = 90;
    const cardY = 340;
    const cardWidth = 900;
    const cardHeight = 1180;
    const radius = 48;

    ctx.save();
    ctx.fillStyle = "rgba(15, 15, 20, 0.82)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. Draw Post Type Tag / Institution
    ctx.fillStyle = selectedTheme.id === "dark" ? "#f97316" : "#ffffff";
    ctx.font = "bold 32px sans-serif";
    const postTypeBadge = post.type === "CONFESSION" ? "🤫 ANONYMOUS CONFESSION" : post.type === "POLL" ? "📊 CAMPUS POLL" : "🔥 CAMPUS PULSE";
    ctx.fillText(postTypeBadge, 140, 420);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "28px sans-serif";
    ctx.fillText(post.institution?.name || "Verified Campus", 140, 465);

    // 5. Draw Author Handle
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(`@${authorHandle}`, 140, 560);

    // 6. Draw Post Body Text (Wrapped lines)
    ctx.fillStyle = "#ffffff";
    ctx.font = "38px sans-serif";
    const words = post.body.split(" ");
    let line = "";
    let y = 650;
    const lineHeight = 56;
    const maxWidth = 800;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 140, y);
        line = words[n] + " ";
        y += lineHeight;
        if (y > 1320) {
          ctx.fillText("...", 140, y);
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (y <= 1320) {
      ctx.fillText(line, 140, y);
    }

    // 7. Draw Footer Call to Action
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Join the tea on CampusLoop", 120, 1680);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "34px sans-serif";
    ctx.fillText("campusloop.space/app", 120, 1735);
  }, [isOpen, post, selectedTheme, authorHandle]);

  function handleDownloadStoryImage() {
    if (!canvasRef.current) return;
    const image = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `campusloop-story-${post.id}.png`;
    link.click();
    toast.success("Story card image downloaded! Upload it to Instagram Story 📲");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Share Story & WhatsApp
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">Select Story Theme</label>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  selectedTheme.id === theme.id
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* 9:16 Story Card Preview Canvas */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-3">
          <p className="text-[11px] font-bold text-muted-foreground">9:16 Instagram Story Preview</p>
          <canvas
            ref={canvasRef}
            className="w-48 h-84 rounded-2xl shadow-xl border border-white/10 object-contain"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleShareWhatsApp}
            className="py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle className="h-4 w-4" /> Share to WhatsApp
          </button>

          <button
            onClick={handleDownloadStoryImage}
            className="py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" /> Save IG Story Image
          </button>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full py-2.5 rounded-2xl border border-border bg-muted/50 text-foreground text-xs font-bold hover:bg-muted transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Link Copied!" : "Copy Post Direct Link"}
        </button>
      </div>
    </div>
  );
}
