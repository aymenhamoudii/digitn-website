"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSend, FiTerminal, FiEye, FiEyeOff } from "react-icons/fi";
import { DigItnLogo } from "@/components/ui/DigItnLogo";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ClientPreview from "./ClientPreview";
import {
  ThinkingBlock,
  parseThinkContent,
} from "@/components/ui/ThinkingBlock";

// ── Auto-format plain text to markdown ──────────────────────────────────────
// Only applied to text that has no existing markdown syntax so we never
// double-wrap content the AI already formatted with backticks / bold / etc.
function autoFormatMarkdown(text: string): string {
  if (!text) return text;

  // If the text already contains markdown formatting, leave it as-is.
  // This prevents wrapping `filename.js` a second time into `` `filename.js` ``.
  if (/`|\*\*|\*[^*]|^#{1,6}\s|^\s{0,3}[-*+]\s|\[.+\]\(.+\)/m.test(text))
    return text;

  // Safety net: if think tags somehow reach here, bail out untouched.
  if (text.includes("<think>") || text.includes("</think>")) return text;

  // Split into fenced-code segments and plain-text segments, then only
  // apply auto-formatting to the plain-text parts.
  const segments: { code: boolean; text: string }[] = [];
  const fence = /(`{1,3})([\s\S]*?)\1/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(text)) !== null) {
    if (m.index > last)
      segments.push({ code: false, text: text.slice(last, m.index) });
    segments.push({ code: true, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length)
    segments.push({ code: false, text: text.slice(last) });

  return segments
    .map(({ code, text: seg }) => {
      if (code) return seg;

      let s = seg;

      // 1. File paths  (src/components/Header.js)
      s = s.replace(
        /\b([a-zA-Z0-9_-]+\/[a-zA-Z0-9_/.@-]+\.[a-z]{1,4})\b/g,
        "`$1`",
      );

      // 2. Standalone filenames  (package.json, .env)
      s = s.replace(/\b([a-zA-Z0-9_-]+\.[a-z]{2,4})\b(?!`)/g, "`$1`");

      // 3. Function calls  (useState(), fetchData())
      s = s.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\(\)/g, "`$1()`");

      // 4. Package-manager commands  (npm install, yarn add)
      s = s.replace(
        /\b(npm|yarn|pnpm|npx)\s+([a-z-]+(?:\s+[a-z@/-]+)*)/gi,
        "`$1 $2`",
      );

      // 5. SCREAMING_SNAKE env-vars  (API_KEY, DATABASE_URL)
      s = s.replace(/\b([A-Z][A-Z0-9_]{2,})\b/g, "**$1**");

      // 6. camelCase identifiers  (userId, isActive)
      s = s.replace(/\b([a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)\b/g, "**$1**");

      // 7. CSS classes & IDs  (.btn-primary, #header)
      s = s.replace(/([.#][a-z][a-z0-9-]*)/gi, "`$1`");

      // 8. HTTP methods  (GET, POST, PUT …)
      s = s.replace(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/g, "**$1**");

      // 9. Common tech keywords
      const kw = [
        "async",
        "await",
        "promise",
        "callback",
        "middleware",
        "hook",
        "component",
        "props",
        "state",
        "context",
        "reducer",
        "effect",
      ];
      s = s.replace(new RegExp(`\\b(${kw.join("|")})\\b`, "gi"), "*$1*");

      return s;
    })
    .join("");
}

// ── Terminal-specific markdown components ────────────────────────────────────
// Applied to every ReactMarkdown call inside the terminal so AI responses
// render with the refined terminal colour scheme instead of the default prose theme.
const TERM_MD: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  // ── Code ─────────────────────────────────────────────────────────────────
  // `pre` owns the dark container; `code` inside it is transparent so the two
  // don't double-apply backgrounds / borders.
  pre({ children }: any) {
    return (
      <pre
        style={{
          background: "var(--term-surface)", border: "none",
          borderRadius: "8px",
          margin: "12px 0",
          padding: "0", // padding lives on the inner <code>
          overflowX: "auto",
          fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
          fontSize: "13px",
          lineHeight: 1.7,
        }}
      >
        {children}
      </pre>
    );
  },

  code({ children, className }: any) {
    const content = String(children ?? "");
    const lang = /language-(\w+)/.exec(className || "")?.[1];
    // A code block has a language tag OR spans multiple lines
    const isBlock = !!lang || content.includes("\n");

    if (isBlock) {
      return (
        <div style={{ position: "relative" }}>
          {lang && (
            <span
              style={{
                position: "absolute",
                top: "10px",
                right: "12px",
                fontSize: "10px",
                fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                color: "var(--term-text-subtle)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              {lang}
            </span>
          )}
          <code
            className={className}
            style={{
              display: "block",
              color: "var(--term-text)",
              background: "transparent",
              padding: "14px 16px",
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
              whiteSpace: "pre",
              letterSpacing: "-0.01em",
            }}
          >
            {content.replace(/\n$/, "")}
          </code>
        </div>
      );
    }

    // Inline code
    return (
      <code
        style={{
          color: "var(--term-text)",
          background: "var(--term-surface)",
          padding: "2px 5px",
          borderRadius: "4px",
          fontSize: "13px",
          border: "1px solid var(--term-border)",
          fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </code>
    );
  },

  // ── Inline formatting ─────────────────────────────────────────────────────
  // Bold
  strong({ children }: any) {
    return (
      <strong style={{ color: "var(--term-text)", fontWeight: 600 }}>
        {children}
      </strong>
    );
  },

  // Italic
  em({ children }: any) {
    return (
      <em style={{ color: "var(--term-text)", fontStyle: "italic", opacity: 0.9 }}>
        {children}
      </em>
    );
  },

  // Strikethrough
  del({ children }: any) {
    return (
      <del style={{ color: "var(--term-text-subtle)", textDecoration: "line-through", opacity: 0.7 }}>
        {children}
      </del>
    );
  },

  // Links
  a({ href, children }: any) {
    return (
      <a
        href={href}
        style={{ color: "var(--term-accent)", textDecoration: "underline", textUnderlineOffset: "3px" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },

  // ── Block elements ────────────────────────────────────────────────────────
  p({ children }: any) {
    return (
      <p
        style={{
          color: "var(--term-text)",
          margin: "0 0 14px 0",
          lineHeight: 1.7,
          fontSize: "14px",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </p>
    );
  },

  blockquote({ children }: any) {
    return (
      <blockquote
        style={{
          background: "rgba(255,255,255,0.03)",
          borderLeft: "2px solid rgba(217,119,87,0.5)",
          borderTop: "none",
          borderRight: "none",
          borderBottom: "none",
          padding: "10px 16px",
          color: "#c4c4b8",
          margin: "12px 0",
          fontStyle: "italic",
          fontFamily: "var(--font-serif)",
          fontSize: "15px",
          lineHeight: 1.75,
          letterSpacing: "-0.01em",
          borderRadius: "0 4px 4px 0",
        }}
      >
        {children}
      </blockquote>
    );
  },

  // Horizontal rule (---)
  hr() {
    return (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          margin: "18px 0",
        }}
      />
    );
  },

  // ── Headings ──────────────────────────────────────────────────────────────
  h1({ children }: any) {
    return (
      <h1
        style={{
          color: "#fafafa",
          fontSize: "18px",
          fontWeight: 700,
          margin: "20px 0 10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "10px",
          letterSpacing: "-0.02em",
        }}
      >
        {children}
      </h1>
    );
  },
  h2({ children }: any) {
    return (
      <h2
        style={{
          color: "#fafafa",
          fontSize: "16px",
          fontWeight: 600,
          margin: "18px 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {children}
      </h2>
    );
  },
  h3({ children }: any) {
    return (
      <h3
        style={{
          color: "var(--term-text)",
          fontSize: "15px",
          fontWeight: 600,
          margin: "16px 0 6px",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h3>
    );
  },
  h4({ children }: any) {
    return (
      <h4
        style={{
          color: "#d4d4d8",
          fontSize: "14px",
          fontWeight: 600,
          margin: "14px 0 6px",
          letterSpacing: "-0.01em",
        }}
      >
        {children}
      </h4>
    );
  },
  h5({ children }: any) {
    return (
      <h5
        style={{
          color: "#a1a1aa",
          fontSize: "13px",
          fontWeight: 600,
          margin: "12px 0 4px",
          letterSpacing: "0",
          textTransform: "uppercase",
        }}
      >
        {children}
      </h5>
    );
  },
  h6({ children }: any) {
    return (
      <h6
        style={{
          color: "#71717a",
          fontSize: "12px",
          fontWeight: 600,
          margin: "10px 0 4px",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </h6>
    );
  },

  // ── Lists ─────────────────────────────────────────────────────────────────
  ul({ children }: any) {
    return (
      <ul style={{ margin: "10px 0", paddingLeft: 0, listStyle: "none" }}>
        {children}
      </ul>
    );
  },
  ol({ children }: any) {
    return (
      <ol style={{ margin: "10px 0", paddingLeft: "22px", color: "#d4d4d8" }}>
        {children}
      </ol>
    );
  },
  // List items — also handles task-list checkboxes (- [ ] / - [x])
  li({ children, className }: any) {
    const isTask = (className as string | undefined)?.includes(
      "task-list-item",
    );
    return (
      <li
        style={{
          color: "#d4d4d8",
          marginBottom: "7px",
          display: "flex",
          alignItems: "flex-start",
          gap: isTask ? "8px" : "12px",
          fontSize: "14px",
          lineHeight: 1.7,
          letterSpacing: "-0.01em",
          listStyle: "none",
        }}
      >
        {!isTask && (
          <span
            style={{
              color: "#d97757",
              flexShrink: 0,
              marginTop: "3px",
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            •
          </span>
        )}
        <span style={{ flex: 1 }}>{children}</span>
      </li>
    );
  },
  // Task-list checkbox
  input({ checked, disabled, ...props }: any) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "15px",
          height: "15px",
          borderRadius: "3px",
          border: checked
            ? "1.5px solid rgba(217,119,87,0.8)"
            : "1.5px solid rgba(255,255,255,0.25)",
          background: checked ? "rgba(217,119,87,0.2)" : "transparent",
          flexShrink: 0,
          marginTop: "4px",
        }}
      >
        {checked && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M1.5 5.5L4 8L8.5 2"
              stroke="#d97757"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  },

  // ── Tables ────────────────────────────────────────────────────────────────
  table({ children }: any) {
    return (
      <div
        style={{
          overflowX: "auto",
          margin: "14px 0",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
          }}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ children }: any) {
    return (
      <thead
        style={{
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {children}
      </thead>
    );
  },
  tbody({ children }: any) {
    return <tbody>{children}</tbody>;
  },
  tr({ children }: any) {
    return (
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {children}
      </tr>
    );
  },
  th({ children }: any) {
    return (
      <th
        style={{
          padding: "8px 14px",
          textAlign: "left",
          color: "#a1a1aa",
          fontWeight: 600,
          letterSpacing: "0.05em",
          fontSize: "11px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </th>
    );
  },
  td({ children }: any) {
    return (
      <td
        style={{
          padding: "8px 14px",
          color: "#d4d4d8",
          verticalAlign: "top",
          lineHeight: 1.6,
        }}
      >
        {children}
      </td>
    );
  },

  // ── Images ────────────────────────────────────────────────────────────────
  img({ src, alt }: any) {
    return (
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          maxWidth: "100%",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.08)",
          margin: "10px 0",
          display: "block",
        }}
      />
    );
  },
};
// ────────────────────────────────────────────────────────────────────────────

interface LogEntry {
  type:
    | "system"
    | "ai"
    | "file_update"
    | "user"
    | "log"
    | "error"
    | "signature"
    | "phase"
    | "plan_complete";
  content: string;
  id?: string | number;
  phase?: string;
  task?: string;
}

interface TerminalChatProps {
  projectId: string;
  projectName: string;
  initialStatus: string;
  projectType: string;
  projectStack?: string;
  projectDescription?: string;
  questionnaireAnswers?: string;
  history?: Array<{
    id?: string;
    role: string;
    content: string;
    event_type?: string;
    task_name?: string | null;
    phase?: string | null;
    sequence_number?: number;
    metadata?: any;
    created_at?: string;
  }>;  initialPhase?: string | null;
  initialTask?: string | null;
  initialPlanContent?: string;
}

export default function TerminalChat({
  projectId,
  projectName,
  initialStatus,
  projectType,
  projectStack = "html-css-js",
  projectDescription,
  questionnaireAnswers,
  history = [],
  initialPhase = null,
  initialTask = null,
  initialPlanContent = "",
}: TerminalChatProps) {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    // ── SSR-safe: Don't access sessionStorage here, it causes hydration mismatch.
    // sessionStorage restoration happens in useLayoutEffect below.
    
    if (initialStatus === "building" || initialStatus === "analyzing") {
      // Don't show static messages - let SSE populate the terminal in real-time
      return [];
    } else if (initialStatus === "failed") {
      // Show failed state with retry instruction
      return [
        {
          type: "error",
          content: `> ❌ Build failed for project ${projectName}.`,
          id: "failed-1",
        },
        {
          type: "system",
          content: `> Click the "Retry Build" button above to try again.`,
          id: "failed-2",
        },
      ];
    } else if (history && history.length > 0) {
      const initialLogs: LogEntry[] = [];
      let entryId = 0;

      // Prepend the "ready" message before showing history
      initialLogs.push(
        {
          type: "system",
          content: `> Project ${projectName} is ready.`,
          id: "ready-1",
        },
        {
          type: "system",
          content: `> You can request changes below or download the code.`,
          id: "ready-2",
        }
      );
      if (initialPlanContent) {
        initialLogs.push({
          type: "plan_complete",
          content: "",
          id: "plan-complete-0",
        });
      }

      history.forEach((msg) => {
        const eventType = msg.event_type || "message";

        if (eventType === "plan_start") {
          return;
        }

        if (eventType === "plan_chunk") {
          return;
        }

        if (eventType === "plan_end") {
          initialLogs.push({
            type: "plan_complete",
            content: "",
            id: `hist-plan-complete-${entryId++}`,
          });
          return;
        }

        if (eventType === "phase") {
          initialLogs.push({
            type: "phase",
            content: "",
            phase: msg.phase || undefined,
            task: msg.task_name || undefined,
            id: `hist-phase-${entryId++}`,
          });
          return;
        }

        if (eventType === "file_created") {
          initialLogs.push({
            type: "file_update",
            content: msg.content,
            task: msg.task_name || undefined,
            id: `hist-file-${entryId++}`,
          });
          return;
        }

        if (eventType === "signature") {
          initialLogs.push({
            type: "signature",
            content: "",
            id: `hist-sig-${entryId++}`,
          });
          return;
        }

        if (eventType === "error") {
          initialLogs.push({
            type: "error",
            content: msg.content,
            id: `hist-err-${entryId++}`,
          });
          return;
        }

        if (eventType === "status") {
          if (msg.content?.trim()) {
            initialLogs.push({
              type: "system",
              content: msg.content,
              id: `hist-status-${entryId++}`,
            });
          }
          return;
        }

        if (msg.role === "user") {
          if (
            msg.content.startsWith("Create a ") &&
            msg.content.includes("\n\nRequirements:")
          ) {
            return;
          }
          initialLogs.push({
            type: "user",
            content: msg.content,
            id: `hist-user-${entryId++}`,
          });
          return;
        }

        if (msg.role === "assistant") {
          if (msg.content?.trim()) {
            initialLogs.push({
              type: "ai",
              content: msg.content,
              id: `hist-ai-${entryId++}`,
            });
          }
        }
      });

      return initialLogs;
    } else {
      // Default ready state with no history
      const logs: LogEntry[] = [
        {
          type: "system",
          content: `> Project ${projectName} is ready.`,
          id: "ready-1",
        },
        {
          type: "system",
          content: `> You can request changes below or download the code.`,
          id: "ready-2",
        },
      ];
      if (initialPlanContent) {
        logs.push({
          type: "plan_complete",
          content: "",
          id: "plan-complete-0",
        });
      }
      return logs;
    }
  });

  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(
    initialStatus === "building" || initialStatus === "analyzing",
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string | null>(() => {
    // Prefer sessionStorage so active phase survives a refresh mid-build
    try {
      return (
        sessionStorage.getItem(`terminal-phase-${projectId}`) || initialPhase
      );
    } catch {
      return initialPhase;
    }
  });
  const [currentTask, setCurrentTask] = useState<string | null>(() => {
    try {
      return (
        sessionStorage.getItem(`terminal-task-${projectId}`) || initialTask
      );
    } catch {
      return initialTask;
    }
  });

  // Plan state — accumulated from plan_chunk events during the planning phase
  const [planContent, setPlanContent] = useState(initialPlanContent || "");
  const [showPlan, setShowPlan] = useState(() => {
    // Restore collapsed/expanded state from sessionStorage
    try {
      return sessionStorage.getItem(`terminal-plan-open-${projectId}`) === "1";
    } catch {
      return false;
    }
  });

  // ── sessionStorage persistence ──────────────────────────────────────────────
  // useLayoutEffect fires synchronously before the browser paints, so the user
  // never sees the DB-history fallback — they always get the live-build view.
  // Guard: only restore cache when the project is already built (ready/failed).
  // During an active build (building/analyzing), the SSE stream populates the
  // terminal in real-time — restoring a stale cache would show wrong data.
  useLayoutEffect(() => {
    if (initialStatus === "building" || initialStatus === "analyzing") return;
    const cached = sessionStorage.getItem(`terminal-${projectId}`);
    if (!cached) return;
    try {
      const restored: LogEntry[] = JSON.parse(cached);
      if (Array.isArray(restored) && restored.length > 0) {
        setLogs(restored);
      }
    } catch {
      // Ignore corrupt cache entries
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist logs whenever they change
  useEffect(() => {
    if (logs.length === 0) return;
    try {
      sessionStorage.setItem(`terminal-${projectId}`, JSON.stringify(logs));
    } catch {
      // sessionStorage may be unavailable or full — fail silently
    }
  }, [logs, projectId]);

  // Persist showPlan toggle
  useEffect(() => {
    try {
      sessionStorage.setItem(
        `terminal-plan-open-${projectId}`,
        showPlan ? "1" : "0",
      );
    } catch {
      // fail silently
    }
  }, [showPlan, projectId]);

  // Persist currentPhase and currentTask so active spinner state survives refresh
  useEffect(() => {
    try {
      if (currentPhase) {
        sessionStorage.setItem(`terminal-phase-${projectId}`, currentPhase);
      } else {
        sessionStorage.removeItem(`terminal-phase-${projectId}`);
      }
    } catch {
      // fail silently
    }
  }, [currentPhase, projectId]);

  useEffect(() => {
    try {
      if (currentTask) {
        sessionStorage.setItem(`terminal-task-${projectId}`, currentTask);
      } else {
        sessionStorage.removeItem(`terminal-task-${projectId}`);
      }
    } catch {
      // fail silently
    }
  }, [currentTask, projectId]);
  // ────────────────────────────────────────────────────────────────────────────

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle preview ready state
  // On refresh of an already-built project, skip the delay entirely — files
  // are already on disk. Only delay when transitioning from a live build SSE.
  useEffect(() => {
    if (initialStatus === "ready" && !previewReady) {
      setPreviewReady(true);
      setShowPreview(true);
    }
  }, [initialStatus, previewReady]);

  // Initial Build Stream
  useEffect(() => {
    if (initialStatus === "building" || initialStatus === "analyzing") {
      const evtSource = new EventSource(`/api/builder/stream/${projectId}`);

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          if (data.type === "log") {
            // Split multi-line log text; route [DIGITN] ✓ lines as file badges,
            // everything else as plain log entries. No task context here — if the
            // bridge sends task-aware file events it uses the 'file_created' type.
            const lines = data.text
              .split("\n")
              .filter((l: string) => l.trim().length > 0);
            setLogs((prev) => {
              const next = [...prev];
              lines.forEach((line: string, idx: number) => {
                const trimmed = line.trim();
                if (trimmed.includes("[DIGITN] ✓")) {
                  // Deduplicate — bridge may re-send the same file line
                  if (next.some((l) => l.type === "file_update" && l.content === trimmed)) return;
                  next.push({ type: "file_update", content: trimmed, id: `${eventId}-${idx}` });
                } else {
                  next.push({ type: "log", content: trimmed, id: `${eventId}-${idx}` });
                }
              });
              return next;
            });
          } else if (data.type === "system_status") {
            // System status messages from bridge
            setLogs((prev) => [
              ...prev,
              { type: "system", content: data.text, id: eventId },
            ]);
          } else if (data.type === "phase") {
            // Phase update (planning/building)
            setCurrentPhase(data.phase);
            setCurrentTask(data.task || null);

            // Append new task row — previous rows stay visible as completed (grey)
            setLogs((prev) => [
              ...prev,
              {
                type: "phase",
                content: "",
                phase: data.phase,
                task: data.task,
                id: eventId,
              },
            ]);
          } else if (data.type === "file_created") {
            // File created with task context — now emitted as proper 'file_created' type
            // (no longer wrapped in emitStatus which was corrupting setStatus with 'file_created')
            const fileMsg = `[DIGITN] ✓ Created ${data.file}`;
            setLogs((prev) => {
              if (
                prev.some(
                  (l) => l.type === "file_update" && l.content === fileMsg,
                )
              ) {
                return prev;
              }
              return [
                ...prev,
                {
                  type: "file_update",
                  content: fileMsg,
                  task: data.task,
                  id: eventId,
                },
              ];
            });
          } else if (data.type === "plan_start") {
            // Planning phase begins — separate context from builder
            setLogs((prev) => [
              ...prev,
              {
                type: "system",
                content:
                  "> Analyzing requirements and creating implementation plan...",
                id: eventId,
              },
            ]);
          } else if (data.type === "plan_chunk") {
            // Accumulate plan content separately — does NOT appear as AI text in terminal
            setPlanContent((prev) => prev + data.text);
          } else if (data.type === "plan_end") {
            // Plan complete — insert a collapsible plan card into the log
            setLogs((prev) => [
              ...prev,
              { type: "plan_complete", content: "", id: eventId },
            ]);
          } else if (data.type === "status") {
            // Note: "content_chunk" sub-type is a legacy bridge event that duplicates
            // the top-level "content" type. We handle only the canonical path above;
            // if only the legacy path arrives, handle it here as a fallback.
            if (data.status === "content_chunk") {
              setLogs((prev) => {
                const lastLog = prev[prev.length - 1];
                if (lastLog && lastLog.type === "ai") {
                  const updatedLogs = [...prev];
                  updatedLogs[updatedLogs.length - 1] = {
                    ...lastLog,
                    content: lastLog.content + data.text,
                  };
                  return updatedLogs;
                }
                return [
                  ...prev,
                  { type: "ai", content: data.text, id: eventId },
                ];
              });
            } else if (data.status === "ready") {
              // Only set status for known values — never call setStatus for arbitrary server values
              setStatus("ready");
              setIsProcessing(false);
              setCurrentPhase(null);
              setCurrentTask(null);
              // Keep all phase/task rows — they render as completed (grey) once isProcessing=false.
              // Add signature + completion messages at the end.
              setLogs((prev) => [
                ...prev,
                {
                  type: "signature",
                  content: "",
                  id: `sig-build-${Date.now()}`,
                },
                {
                  type: "system",
                  content: `\n> ✓ Build complete! Your project is ready.`,
                  id: `ready-1-${Date.now()}`,
                },
                {
                  type: "system",
                  content: `> You can now request changes below or download the code.`,
                  id: `ready-2-${Date.now()}`,
                },
              ]);
              setTimeout(() => {
                setPreviewReady(true);
                setShowPreview(true);
              }, 500);
              evtSource.close();
            } else if (data.status === "failed") {
              setStatus("failed");
              setIsProcessing(false);
              setLogs((prev) => [
                ...prev,
                {
                  type: "error",
                  content: `\n> ❌ Build failed. Click the "Retry Build" button to try again.`,
                  id: `error-${Date.now()}`,
                },
              ]);
              evtSource.close();
            }
            // Silently ignore unknown status values (e.g. old 'file_created' from legacy builds)
          } else if (data.type === "error") {
            setLogs((prev) => [
              ...prev,
              {
                type: "error",
                content: `\n> Error: ${data.message}`,
                id: `srv-error-${Date.now()}`,
              },
            ]);
            setIsProcessing(false);
            setStatus("failed");
            evtSource.close();
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') console.error("Failed to parse SSE data", err);
        }
      };

      // ── SSE error handler ────────────────────────────────────────────────────
      // A single transient disconnect (e.g. network blip) is expected and the
      // browser will auto-reconnect. We only treat it as a hard failure after
      // the connection has been closed AND the build never reached "ready".
      // Strategy: allow up to 3 auto-reconnect attempts (browser default behaviour),
      // then close and surface a clear user-facing message with a retry prompt.
      let errorCount = 0;
      const MAX_ERRORS = 8;  // increased from 3 — bridge may take a moment to be ready
      let lastErrorTime = 0;

      evtSource.onerror = () => {
        const now = Date.now();
        // Reset error count if enough time has passed (successful reconnect window)
        if (now - lastErrorTime > 5000) errorCount = 0;
        lastErrorTime = now;
        errorCount++;

        if (errorCount >= MAX_ERRORS) {
          evtSource.close();
          setIsProcessing(false);
          setStatus("failed");
          setLogs((prev) => [
            ...prev,
            {
              type: "error",
              content:
                '> ❌ Connection to build server lost. Click "Retry Build" to start again.',
              id: `sse-error-${Date.now()}`,
            },
          ]);
        }
        // else: browser will auto-reconnect — let it try silently
      };

      return () => evtSource.close();
    }
  }, [projectId, initialStatus]);

  const router = useRouter();

  // Handle Retry Build — creates a fresh project with identical metadata,
  // deletes the failed one (files + DB row), then navigates to the new terminal.
  const handleRetry = async () => {
    setIsRetrying(true);
    setLogs([
      {
        type: "system",
        content: "> Removing failed project and starting fresh build...",
        id: "retry-init",
      },
    ]);

    try {
      const response = await fetch("/api/builder/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retry build");
      }

      const { newProjectId } = data;

      // Clear session storage for the old (now deleted) project
      sessionStorage.removeItem(`terminal-${projectId}`);

      toast.success("Fresh build started!");

      // Navigate to the new project's terminal
      router.push(`/app/builder/terminal/${newProjectId}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to retry build";
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          content: `\n> ❌ ${errorMessage}`,
          id: `retry-error-${Date.now()}`,
        },
      ]);
      setIsRetrying(false);
      setIsProcessing(false);
      setStatus("failed");
      toast.error(errorMessage);
    }
  };

  // Core submit logic — accepts an explicit message so it can be called
  // both from the form submit handler AND programmatically (e.g. Fix Errors button).
  const submitMessage = async (message: string) => {
    if (!message.trim() || isProcessing || status !== "ready") return;

    setInput("");
    setLogs((prev) => [
      ...prev,
      { type: "user", content: message, id: `user-${Date.now()}` },
    ]);
    setIsProcessing(true);
    setStatus("modifying");

    // Scroll terminal to bottom so user sees activity immediately
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);

    try {
      const response = await fetch(`/api/builder/chat/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!response.body) throw new Error("No readable stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              const eventId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              if (data.type === "content") {
                const text = data.text.replace(/MODIFICATION_COMPLETE/g, "");
                if (text) {
                  setLogs((prev) => {
                    const lastLog = prev[prev.length - 1];
                    if (lastLog && lastLog.type === "ai") {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...lastLog,
                        content: lastLog.content + text,
                      };
                      return updated;
                    }
                    return [...prev, { type: "ai", content: text, id: eventId }];
                  });
                }
              } else if (data.type === "signature") {
                setLogs((prev) => [
                  ...prev,
                  { type: "signature", content: "", id: eventId },
                ]);
              } else if (data.type === "error") {
                setLogs((prev) => [
                  ...prev,
                  { type: "error", content: `\n[Error] ${data.message}`, id: eventId },
                ]);
                toast.error(data.message);
              }
            } catch (e) {
              if (process.env.NODE_ENV === 'development') console.error("Error parsing chat SSE line:", line, e);
            }
          }
        }
      }

      setIsProcessing(false);
      setStatus("ready");

      window.dispatchEvent(
        new CustomEvent("project-updated", { detail: { projectId } }),
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setLogs((prev) => [
        ...prev,
        { type: "error", content: `\n[System Error] ${errorMessage}`, id: `err-${Date.now()}` },
      ]);
      setIsProcessing(false);
      setStatus("ready");
      toast.error(errorMessage);
    }
  };

  // Handle Post-Build Chat Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await submitMessage(input.trim());
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-4">
      {/* Main Terminal Column */}
      <div
        className={`flex flex-col bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden ${showPreview && status === "ready" && previewReady ? "lg:w-1/2" : "w-full"} h-full transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)] ml-2 hidden sm:inline-block truncate max-w-[200px] font-medium">
              {projectName}
            </span>
            <span
              className="px-2 py-1 rounded-md text-[10px] ml-2 uppercase font-semibold tracking-wide"
              style={{
                backgroundColor:
                  status === "ready"
                    ? "var(--status-ready-bg)"
                    : status === "failed"
                      ? "var(--status-failed-bg)"
                      : "var(--status-pending-bg)",
                color:
                  status === "ready"
                    ? "var(--status-ready)"
                    : status === "failed"
                      ? "var(--status-failed)"
                      : "var(--status-pending)",
              }}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === "ready" && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] rounded-md border border-[var(--border)] hover:border-[var(--accent)] transition-all"
              >
                {showPreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                <span className="hidden sm:inline">
                  {showPreview ? "Hide" : "Show"}
                </span>
              </button>
            )}
            {status === "failed" && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Retrying...
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Retry Build
                  </>
                )}
              </button>
            )}
            {status === "modifying" && (
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Updating...
              </span>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed font-mono terminal-container"
          style={{ display: "flex", flexDirection: "column", gap: "0px" }}
        >
          {logs.map((block, index, arr) => {
            if (block.type === "file_update") {
              // Check if this file_update is already rendered by a preceding phase block's child list
              // (phase blocks with tasks render their child file_updates inline)
              // IMPORTANT: stop scanning at message-boundary entries (signature, user) so that
              // post-build modification file_updates are never claimed by the initial build's phases.
              for (let j = index - 1; j >= 0; j--) {
                const prev = arr[j];
                // Stop at message boundaries — don't cross into a different chat turn
                if (prev.type === "signature") break;
                if (prev.type === "user") break;
                if (prev.type === "phase" && prev.task) {
                  // This file belongs to a task — it's rendered by the phase block above
                  return null;
                }
                if (prev.type === "phase") break; // hit a non-task phase, stop looking
              }

              const content = block.content.trim();
              const isCreated = content.includes("Created");
              const action = isCreated ? "Created" : "Updated";
              const filename = content.split(`${action} `)[1]?.trim() || "";

              // Indent only when the badge explicitly carries a task reference.
              // We deliberately do NOT use `status === "building"` here because that
              // causes a layout shift the moment status flips to "ready" at build end —
              // badges that were indented suddenly lose their margin. Task-attached badges
              // (from file_created events) are always indented; taskless log-path badges
              // (from legacy log events) are rendered flat, which is the correct fallback.
              const isIndented = !!block.task;

              return (
                <div
                  key={block.id || index}
                  className={`my-1 ${isIndented ? "ml-8 relative" : ""}`}
                >
                  {isIndented && (
                    <div
                      className="absolute left-[-14px] top-[-6px] w-2.5 h-[20px] rounded-bl border-b border-l"
                      style={{ borderColor: "var(--term-border)" }}
                    />
                  )}
                  <div
                    className="inline-flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors"
                    style={{
                      background: "var(--term-surface)", border: "none",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "var(--term-success)", flexShrink: 0 }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <div>
                      <span
                        className="font-mono text-[10px] uppercase tracking-wider mr-1.5"
                        style={{ color: "var(--term-text-subtle)" }}
                      >
                        {action}
                      </span>
                      <span
                        className="font-mono text-xs"
                        style={{ color: "var(--term-text)", fontWeight: 500 }}
                      >
                        {filename}
                      </span>
                    </div>
                  </div>
                </div>
              );
            } else if (block.type === "plan_complete") {
              return (
                <div key={block.id || index} className="my-3">
                  <button
                    onClick={() => setShowPlan((p) => !p)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md transition-all hover:bg-opacity-80"
                    style={{
                      background: "var(--term-surface)", border: "none",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "var(--term-accent)", flexShrink: 0 }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span
                      className="font-mono text-xs tracking-wide"
                      style={{ color: "var(--term-text)", fontWeight: 500 }}
                    >
                      Implementation Plan
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: "var(--term-text-subtle)",
                        transform: showPlan ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {showPlan && planContent && (
                    <div
                      className="mt-2 p-4 rounded-md"
                      style={{
                        background: "var(--term-surface)", border: "none",
                      }}
                    >
                      <div className="max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={TERM_MD}
                        >
                          {planContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            } else if (block.type === "phase") {
              // Determine if this is the currently active task
              const isActiveTask = block.task === currentTask && isProcessing;
              // A completed task is any task-phase that is NOT the current active one
              const isCompleted = block.task && !isActiveTask;

              if (!block.task) {
                // Phase header without a task — "Creating Plan" or "Starting build..."
                const isActivePhase =
                  block.phase === currentPhase && isProcessing;
                // Check if any later phase block exists (meaning this phase completed)
                const hasLaterPhase = arr
                  .slice(index + 1)
                  .some((b) => b.type === "phase");
                const phaseCompleted = hasLaterPhase || !isProcessing;

                return (
                  <div
                    key={block.id || index}
                    className="flex items-center gap-2.5 py-2 my-1"
                  >
                    {isActivePhase && !phaseCompleted ? (
                      <svg
                        className="animate-spin h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "var(--term-accent)" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "var(--term-success)" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                        />
                      </svg>
                    )}
                    <span
                      className="font-mono text-xs tracking-wide"
                      style={{
                        color:
                          isActivePhase && !phaseCompleted
                            ? "var(--term-text)"
                            : "var(--term-text-subtle)",
                        fontWeight:
                          isActivePhase && !phaseCompleted ? 500 : 400,
                      }}
                    >
                      {block.phase === "planning"
                        ? "Creating Plan"
                        : "Starting build..."}
                    </span>
                  </div>
                );
              }

              // ── Task row with vertical tree-line ──
              // Collect all file_update blocks that follow this phase block
              // until the next phase block OR a message boundary (signature/user).
              // This prevents the last initial-build phase from swallowing file_updates
              // that belong to subsequent post-build modification messages.
              const childFiles: LogEntry[] = [];
              for (let j = index + 1; j < arr.length; j++) {
                const next = arr[j];
                if (next.type === "phase") break;
                if (next.type === "signature") break; // end of this build/modification
                if (next.type === "user") break; // start of next chat turn
                if (next.type === "file_update") childFiles.push(next);
              }

              return (
                <div key={block.id || index} className="mt-3 mb-1">
                  {/* Task header */}
                  <div className="flex items-center gap-2.5 py-1.5">
                    {isActiveTask ? (
                      <svg
                        className="animate-spin h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "var(--term-accent)" }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "var(--term-success)" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                        />
                      </svg>
                    )}
                    <span
                      className="font-sans text-[13px] tracking-wide"
                      style={{
                        color: isActiveTask
                          ? "var(--term-text)"
                          : isCompleted
                            ? "var(--term-text-subtle)"
                            : "var(--term-text)",
                        fontWeight: isActiveTask ? 600 : 500,
                      }}
                    >
                      {block.task!.replace(/Task \d+:\s*/i, "")}
                    </span>
                    {isActiveTask && (
                      <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[var(--term-accent)]" />
                    )}
                  </div>

                  {/* Child files rendered inline under this task header */}
                  {childFiles.length > 0 && (
                    <div className="ml-[7px] border-l border-[var(--term-border)] pl-4 mt-1 mb-1 space-y-0.5">
                      {childFiles.map((file, fi) => {
                        const fc = file.content.trim();
                        const isC = fc.includes("Created");
                        const act = isC ? "Created" : "Updated";
                        const fn = fc.split(`${act} `)[1]?.trim() || "";
                        return (
                          <div
                            key={file.id || `child-${fi}`}
                            className="flex items-center gap-2 py-0.5"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color: "var(--term-success)",
                                flexShrink: 0,
                              }}
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span
                              className="font-mono text-[10px] uppercase tracking-wider"
                              style={{ color: "var(--term-text-subtle)" }}
                            >
                              {act}
                            </span>
                            <span
                              className="font-mono text-xs"
                              style={{
                                color: isCompleted
                                  ? "var(--term-text-subtle)"
                                  : "var(--term-text)",
                                fontWeight: 500,
                              }}
                            >
                              {fn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else if (block.type === "log") {
              if (!block.content) return null;
              // Normal log output
              return (
                <div
                  key={block.id || index}
                  className="font-mono text-xs whitespace-pre-wrap px-1"
                  style={{ color: "var(--term-text-subtle)" }}
                >
                  {block.content}
                </div>
              );
            } else if (block.type === "ai") {
              // Strip only pure technical markers — never discard real AI prose.
              // Empty lines are preserved (they provide paragraph spacing).

              // First, parse out any <think>…</think> reasoning blocks the model emitted
              const {
                thinking: blockThinking,
                content: withoutThink,
                isThinking: blockIsThinking,
              } = parseThinkContent(block.content);

              const filtered = withoutThink
                .split("\n")
                .filter((line) => {
                  const t = line.trim();
                  return (
                    !/^Working on:/i.test(t) &&
                    !/^✓\s*BUILD_COMPLETE/i.test(t) &&
                    !/^BUILD_COMPLETE/i.test(t) &&
                    !/^✓\s*PLAN_COMPLETE/i.test(t) &&
                    !/^✓\s*CHANGES_APPLIED/i.test(t) &&
                    !/^MODIFICATION_COMPLETE/i.test(t)
                  );
                })
                .join("\n")
                .trim();

              // Only suppress the block when it contained nothing but technical markers
              // (thinking-only blocks are still shown via ThinkingBlock below)
              if (!filtered && !blockThinking) return null;

              // Inline [DIGITN] ✓ file badges inside AI content
              if (filtered.includes("[DIGITN] ✓")) {
                const parts = filtered.split("\n");
                const unique = parts.filter((v, i, s) =>
                  v.includes("[DIGITN] ✓")
                    ? s.findIndex((x) => x === v) === i
                    : true,
                );

                return (
                  <div key={block.id || index} className="space-y-1 pl-1">
                    {/* Thinking block above file badges */}
                    {(blockThinking || blockIsThinking) && (
                      <ThinkingBlock
                        thinking={blockThinking ?? ""}
                        isStreaming={blockIsThinking}
                        variant="terminal"
                      />
                    )}
                    {unique.map((p, i) => {
                      if (p.includes("[DIGITN] ✓")) {
                        const isC = p.includes("Created");
                        const act = isC ? "Created" : "Updated";
                        const fn = p.split(`${act} `)[1]?.trim() || "";
                        return (
                          <div key={i} className="flex my-1">
                            <div
                              className="inline-flex items-center gap-2 py-1.5 px-3 rounded-md"
                              style={{
                                background: "var(--term-surface)", border: "none",
                              }}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                  color: "var(--term-success)",
                                  flexShrink: 0,
                                }}
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <div>
                                <span
                                  className="font-mono text-[10px] uppercase tracking-wider mr-1.5"
                                  style={{ color: "var(--term-text-subtle)" }}
                                >
                                  {act}
                                </span>
                                <span
                                  className="font-mono text-xs"
                                  style={{
                                    color: "var(--term-text)",
                                    fontWeight: 500,
                                  }}
                                >
                                  {fn}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      if (!p.trim()) return null;
                      return (
                        <div key={i} className="text-xs pl-1 mt-1">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={TERM_MD}
                          >
                            {p}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Regular AI assistant message (post-build chat) - with connecting line
              // Apply auto-formatting to detect and wrap common patterns
              const formattedContent = autoFormatMarkdown(filtered);

              return (
                <div
                  key={block.id || index}
                  className="relative pl-[22px] mt-2 mb-0"
                >
                  {/* DIGITN Logo at start */}
                  <div
                    className="absolute left-0 top-0"
                    style={{ color: "var(--term-text-subtle)" }}
                  >
                    <DigItnLogo size={14} />
                  </div>
                  {/* Thinking block — shown above the response text */}
                  {(blockThinking || blockIsThinking) && (
                    <ThinkingBlock
                      thinking={blockThinking ?? ""}
                      isStreaming={blockIsThinking}
                      variant="terminal"
                    />
                  )}
                  <div className="text-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={TERM_MD}
                    >
                      {formattedContent}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            } else if (block.type === "signature") {
              return (
                <div
                  key={block.id || index}
                  className="flex items-center gap-2 mt-0.5 mb-4 pl-[22px]"
                  style={{ color: "var(--term-text-subtle)" }}
                >
                  <span
                    className="font-mono text-[11px] font-medium tracking-wide"
                    style={{ color: "var(--term-text-subtle)" }}
                  >
                    DIGITN AI
                  </span>
                </div>
              );
            } else if (block.type === "user") {
              const content = block.content.trim();
              if (!content) return null;
              return (
                <div key={block.id || index} className="flex justify-end my-3">
                  <div
                    className="font-sans text-sm leading-relaxed px-4 py-2.5 rounded-xl max-w-[85%]"
                    style={{
                      background: "var(--term-surface)",
                      border: "1px solid var(--term-border)",
                      color: "var(--term-text)",
                      borderRadius: "18px 18px 4px 18px",
                    }}
                  >
                    {content}
                  </div>
                </div>
              );
            } else if (block.type === "error") {
              const content = block.content.trim();
              if (!content) return null;
              return (
                <div
                  key={block.id || index}
                  className="flex items-start gap-2.5 px-3 py-2.5 rounded-md my-2"
                  style={{
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span
                    className="font-mono text-xs whitespace-pre-wrap"
                    style={{ color: "#fca5a5" }}
                  >
                    {content}
                  </span>
                </div>
              );
            } else {
              // system messages
              const content = block.content.trim();
              if (!content) return null;
              return (
                <div
                  key={block.id || index}
                  className="flex items-center gap-2 px-2 py-1 my-0.5 rounded"
                  style={{
                    borderLeft: "2px solid var(--term-border)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <FiTerminal
                    size={11}
                    style={{ color: "var(--term-text-subtle)", flexShrink: 0 }}
                  />
                  <span
                    className="font-mono text-[11px] whitespace-pre-wrap"
                    style={{ color: "var(--term-text-subtle)" }}
                  >
                    {content}
                  </span>
                </div>
              );
            }
          })}

          {isProcessing &&
            (status === "modifying" || status === "analyzing") && (
              <div
                className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-md"
                style={{
                  background: "var(--term-surface)", border: "none",
                }}
              >
                {/* Minimal spinner ring */}
                <svg
                  className="animate-spin flex-shrink-0"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="var(--term-border)"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="var(--term-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="font-mono text-xs tracking-wide"
                  style={{ color: "var(--term-text-dim)", fontWeight: 500 }}
                >
                  {status === "modifying"
                    ? "Modifying project..."
                    : "Analyzing..."}
                </span>
              </div>
            )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <span className="absolute left-4 text-[var(--text-tertiary)] font-mono text-base select-none">
              $
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== "ready" || isProcessing}
              placeholder={
                status === "ready" && !isProcessing
                  ? "Request changes to your project..."
                  : "Please wait..."
              }
              className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-sm py-3 pl-9 pr-12 rounded-lg border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--text-tertiary)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || status !== "ready" || isProcessing}
              className="absolute right-3 p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] disabled:opacity-40 transition-colors rounded-md hover:bg-[var(--bg-secondary)]"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Preview Column */}
      {showPreview && status === "ready" && previewReady && (
        <div className="flex-1 h-full animate-fade-in">
          <ClientPreview
            projectId={projectId}
            projectName={projectName}
            projectType={projectType}
            projectStack={projectStack}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            fullHeight={true}
            onFixErrors={(prompt) => {
              // Submit the error prompt directly without needing to manage input state
              submitMessage(prompt);
            }}
          />
        </div>
      )}
    </div>
  );
}
