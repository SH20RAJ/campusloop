"use client";

import { Check, Copy, Terminal } from "lucide-react";
import Prism from "prismjs";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  yml: "yaml",
  golang: "go",
  rs: "rust",
  postgres: "sql",
  pgsql: "sql",
};

export function CodeBlock({
  code,
  language = "typescript",
  className,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanLang = (language.toLowerCase() || "typescript").trim();
  const prismLang = LANGUAGE_MAP[cleanLang] || cleanLang;

  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[prismLang] || Prism.languages.typescript || Prism.languages.clike;
      if (!grammar) return code;
      return Prism.highlight(code, grammar, prismLang);
    } catch {
      return code;
    }
  }, [code, prismLang]);

  const lines = useMemo(() => code.split("\n"), [code]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      sounds.pop();
      haptics.light();
      setCopied(true);
      toast.success("Code copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }

  return (
    <div
      className={cn(
        "group relative my-4 overflow-hidden rounded-2xl border border-border/40 bg-[#0d1117] text-[#e6edf3] shadow-lg",
        className
      )}
    >
      {/* ─── Mac Terminal Header ─── */}
      <div className="flex h-9 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-3.5 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#8b949e]">
            <Terminal className="size-3 text-[#8b949e]" />
            <span>{cleanLang || "CODE"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#8b949e]">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#8b949e] hover:bg-[#30363d] hover:text-[#f0f6fc] transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Code Viewport with Optional Line Numbers ─── */}
      <div className="overflow-x-auto p-3.5 text-xs md:text-sm font-mono leading-relaxed scrollbar-thin">
        {showLineNumbers && lines.length > 1 ? (
          <div className="flex gap-4">
            {/* Line Numbers Gutter */}
            <div
              className="select-none text-right font-mono text-[11px] text-[#484f58] space-y-0"
              aria-hidden="true"
            >
              {lines.map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Syntax Highlighted Code */}
            <pre className="flex-1 overflow-x-auto font-mono">
              <code
                className={`language-${prismLang}`}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          </div>
        ) : (
          <pre className="overflow-x-auto font-mono">
            <code className={`language-${prismLang}`} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          </pre>
        )}
      </div>
    </div>
  );
}
