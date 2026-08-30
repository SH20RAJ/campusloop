"use client";

import { cn } from "@/lib/utils";
import React from "react";

/**
 * CampusLoop Markdown Renderer
 *
 * Renders a markdown string to React elements — never to raw HTML — so a post,
 * article or event description can never inject markup into the page.
 *
 * Supported blocks: `#`/`##`/`###` headings, `>` quotes, fenced code, bullet and
 * numbered lists, `---` rules, standalone images and tables of paragraphs.
 * Supported inline: `**bold**`, `*italic*`, `~~strike~~`, `` `code` ``,
 * `[text](url)`, `![alt](url)` and bare links.
 *
 * Hashtags and @mentions are deliberately NOT linkified here: long-form content
 * legitimately contains `#include`, `#define` and `@decorator`. Short social
 * copy uses `RichText` instead, which does linkify them.
 */

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** Renders tighter spacing for compact surfaces such as event cards. */
  compact?: boolean;
}

const INLINE_PATTERN = new RegExp(
  [
    "!\\[([^\\]]*)\\]\\(([^)\\s]+)\\)", // 1,2  image
    "\\[([^\\]]+)\\]\\(([^)\\s]+)\\)", // 3,4  link
    "`([^`]+)`", // 5    inline code
    "\\*\\*([^*]+)\\*\\*", // 6    bold
    "__([^_]+)__", // 7    bold
    "~~([^~]+)~~", // 8    strikethrough
    "\\*([^*\\n]+)\\*", // 9    italic
    "(https?:\\/\\/[^\\s<>\"')]+)", // 10   bare url
  ].join("|"),
  "g"
);

const MAX_INLINE_DEPTH = 4;

/** Parses inline markdown into React nodes, recursing for nested emphasis. */
function parseInline(text: string, keyPrefix: string, depth = 0): React.ReactNode[] {
  if (!text) return [];
  if (depth >= MAX_INLINE_DEPTH) return [text];

  const nodes: React.ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${match.index}`;
    const [, imgAlt, imgUrl, linkText, linkUrl, code, bold, boldAlt, strike, italic, bareUrl] =
      match;

    if (imgUrl !== undefined) {
      nodes.push(
        <img
          key={key}
          src={imgUrl}
          alt={imgAlt || "Image"}
          loading="lazy"
          className="my-3 max-h-[32rem] w-full rounded-2xl border border-border/40 object-cover"
        />
      );
    } else if (linkUrl !== undefined) {
      nodes.push(
        <a
          key={key}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          {linkText}
        </a>
      );
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-border/40 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {code}
        </code>
      );
    } else if (bold !== undefined || boldAlt !== undefined) {
      nodes.push(
        <strong key={key} className="font-black text-foreground">
          {parseInline((bold ?? boldAlt)!, key, depth + 1)}
        </strong>
      );
    } else if (strike !== undefined) {
      nodes.push(
        <s key={key} className="opacity-70">
          {parseInline(strike, key, depth + 1)}
        </s>
      );
    } else if (italic !== undefined) {
      nodes.push(
        <em key={key} className="italic">
          {parseInline(italic, key, depth + 1)}
        </em>
      );
    } else if (bareUrl !== undefined) {
      nodes.push(
        <a
          key={key}
          href={bareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline break-all"
        >
          {bareUrl.replace(/^https?:\/\//, "")}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownContent({ content, className, compact = false }: MarkdownContentProps) {
  if (!content?.trim()) return null;

  const blocks: React.ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    // Blank line — collapses into block spacing.
    if (!trimmed) {
      index++;
      continue;
    }

    // Fenced code block.
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const body: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        body.push(lines[index]);
        index++;
      }
      index++; // consume the closing fence
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-2xl border border-border/40 bg-muted/60 p-4 text-xs md:text-sm"
        >
          {language && (
            <span className="mb-2 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {language}
            </span>
          )}
          <code className="font-mono text-foreground">{body.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule.
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      blocks.push(<hr key={key++} className="my-6 border-border/40" />);
      index++;
      continue;
    }

    // Headings.
    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const inline = parseInline(text, `h${key}`);
      if (level === 1) {
        blocks.push(
          <h2
            key={key++}
            className="border-b border-border/30 pb-2 pt-4 text-2xl font-black tracking-tight text-foreground md:text-3xl"
          >
            {inline}
          </h2>
        );
      } else if (level === 2) {
        blocks.push(
          <h3 key={key++} className="pt-3 text-xl font-black tracking-tight text-foreground md:text-2xl">
            {inline}
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={key++} className="pt-2 text-lg font-bold text-foreground md:text-xl">
            {inline}
          </h4>
        );
      }
      index++;
      continue;
    }

    // Blockquote (consumes consecutive `>` lines).
    if (trimmed.startsWith(">")) {
      const body: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        body.push(lines[index].trim().replace(/^>\s?/, ""));
        index++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="rounded-r-xl border-l-4 border-primary bg-muted/20 py-2 pl-4 italic text-foreground/80"
        >
          {parseInline(body.join(" "), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // Bullet list.
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index++;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-5 marker:text-primary">
          {items.map((item, i) => (
            <li key={i}>{parseInline(item, `ul${key}-${i}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list.
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1.5 pl-5 font-medium marker:font-black marker:text-primary">
          {items.map((item, i) => (
            <li key={i}>{parseInline(item, `ol${key}-${i}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph — consumes until a blank line or the start of another block.
    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        current.startsWith("```") ||
        current.startsWith(">") ||
        /^(#{1,3})\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        /^(---|\*\*\*|___)$/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      index++;
    }

    if (paragraph.length > 0) {
      blocks.push(
        <p key={key++} className="leading-relaxed text-foreground/90">
          {parseInline(paragraph.join(" "), `p${key}`)}
        </p>
      );
    }
  }

  return (
    <div
      className={cn(
        "max-w-none break-words text-[15px] text-foreground",
        compact ? "space-y-2.5" : "space-y-4",
        className
      )}
    >
      {blocks}
    </div>
  );
}
