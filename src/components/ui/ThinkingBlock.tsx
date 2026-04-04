"use client";

import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronRight, FiCpu } from "react-icons/fi";

/* ─────────────────────────────────────────────────────────────────────────────
PARSER
Splits raw model output into { thinking, content, isThinking }.

Handles:
•  <think>…</think>    — standard
•  <thinking>…</thinking> — Claude / some models
•  <thought>…</thought>  — variant
•  <|think|>…<|/think|>  — DeepSeek-style pipe delimiters
•  <think>…             — still streaming (no closing tag yet)
•  response only        — model doesn't use think tags
•  multiple blocks      — joined into one
─────────────────────────────────────────────────────────────────────────────*/
export interface ParsedContent {
  /** Text inside all <think>…</think> blocks (trimmed), or null if none. */
  thinking: string | null;
  /** Everything outside the think blocks (what the user should read). */
  content: string;
  /** True while we are still inside an unclosed <think> tag (streaming). */
  isThinking: boolean;
}

export function parseThinkContent(raw: string): ParsedContent {
  if (!raw) return { thinking: null, content: "", isThinking: false };

  // Normalize all think tag variants to <think> / </think>
  const normalized = raw
    // <thinking> / </thinking> → <think> / </think>
    .replace(/<\/?thinking>/gi, (m) => m.startsWith('</') ? '</think>' : '<think>')
    // <thought> / </thought> → <think> / </think>
    .replace(/<\/?thought>/gi, (m) => m.startsWith('</') ? '</think>' : '<think>')
    // <|think|> / <|/think|> (DeepSeek-style) → <think> / </think>
    .replace(/<\|think\|>/gi, '<think>')
    .replace(/<\|\/think\|>/gi, '</think>')
    // Case variants
    .replace(/<Think>/g, '<think>')
    .replace(/<\/Think>/g, '</think>')
    .replace(/<THINK>/g, '<think>')
    .replace(/<\/THINK>/g, '</think>');

  const openTag = "<think>";
  const closeTag = "</think>";

  // Fast-path: no think tags — strip any stray closing tags
  if (!normalized.includes(openTag)) {
    const cleaned = normalized
      .replace(/<\/?think(ing)?>/gi, "")
      .replace(/^\n+/, "")
      .trimEnd();
    return { thinking: null, content: cleaned, isThinking: false };
  }

  const thinkingParts: string[] = [];
  const contentParts: string[] = [];
  let isThinking = false;
  let cursor = 0;

  while (cursor < normalized.length) {
    const openIdx = normalized.indexOf(openTag, cursor);
    if (openIdx === -1) {
      contentParts.push(normalized.slice(cursor));
      break;
    }

    if (openIdx > cursor) {
      contentParts.push(normalized.slice(cursor, openIdx));
    }

    const contentStart = openIdx + openTag.length;
    const closeIdx = normalized.indexOf(closeTag, contentStart);

    if (closeIdx === -1) {
      thinkingParts.push(normalized.slice(contentStart));
      isThinking = true;
      cursor = normalized.length;
      break;
    }

    thinkingParts.push(normalized.slice(contentStart, closeIdx).trim());
    cursor = closeIdx + closeTag.length;
  }

  const thinking =
    thinkingParts.length > 0
      ? thinkingParts.filter(Boolean).join("\n\n") || null
      : null;

  const content = contentParts
    .join("")
    .replace(/<\/?think(ing)?>/gi, "")
    .replace(/^\n+/, "")
    .trimEnd();

  return { thinking, content, isThinking };
}

/* ─────────────────────────────────────────────────────────────────────────────
COMPONENT
─────────────────────────────────────────────────────────────────────────────*/
interface ThinkingBlockProps {
  /** The thinking text extracted by parseThinkContent. */
  thinking: string;
  /** True while the model is still generating the think block. */
  isStreaming?: boolean;
  /** Visual context: 'chat' uses CSS vars; 'terminal' uses hardcoded dark palette. */
  variant?: "chat" | "terminal";
}

export function ThinkingBlock({
  thinking,
  isStreaming = false,
  variant = "chat",
}: ThinkingBlockProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isStreaming) setOpen(false);
  }, [isStreaming]);

  const handleToggle = () => {
    if (!isStreaming) setOpen((v) => !v);
  };

  const isTerminal = variant === "terminal";
  const iconColor = isTerminal ? "rgba(255,255,255,0.25)" : "#6b7280";

  return (
    <div style={{ marginBottom: '12px' }} aria-live="polite">
      {/* Header — plain text, subtle, clickable */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: isStreaming ? 'default' : 'pointer',
          color: isStreaming ? 'var(--accent)' : iconColor,
          fontSize: '12px',
          fontFamily: 'var(--font-sans)',
          letterSpacing: '0.03em',
          userSelect: 'none',
          opacity: isStreaming ? 1 : 0.7,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { if (!isStreaming) e.currentTarget.style.opacity = '0.7'; }}
      >
        {/* CPU dot / pulse when streaming */}
        <span className={isStreaming ? 'animate-cpu-pulse' : ''} style={{ display: 'flex', alignItems: 'center' }}>
          <FiCpu size={11} />
        </span>

        <span>{isStreaming ? 'Thinking' : 'Thought Process'}</span>

        {/* Animated dots while streaming */}
        {isStreaming && (
          <span className="flex gap-[3px] items-center ml-1">
            <span className="thinking-dot" style={{ animationDelay: '0ms' }} />
            <span className="thinking-dot" style={{ animationDelay: '150ms' }} />
            <span className="thinking-dot" style={{ animationDelay: '300ms' }} />
          </span>
        )}

        {/* Chevron when done */}
        {!isStreaming && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {open ? <FiChevronDown size={11} /> : <FiChevronRight size={11} />}
          </span>
        )}
      </button>

      {/* Expanded content — appears directly below the label */}
      {open && !isStreaming && thinking && (
        <div style={{
          marginTop: '8px',
          paddingLeft: '16px',
          borderLeft: '2px solid #3a3937',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          color: '#6b7280',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}>
          {thinking}
        </div>
      )}
    </div>
  );
}
