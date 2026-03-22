'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DigItnLogo } from '@/components/ui/DigItnLogo';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  // Keep cursor visible for a beat after streaming ends
  const [showCursor, setShowCursor] = useState(false);
  const cursorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isStreaming) {
      setShowCursor(true);
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
    } else if (showCursor) {
      cursorTimer.current = setTimeout(() => setShowCursor(false), 1000);
    }
    return () => {
      if (cursorTimer.current) clearTimeout(cursorTimer.current);
    };
  }, [isStreaming]);

  // ── USER message — right-aligned bubble, NO avatar ──
  if (isUser) {
    return (
      <div className="flex justify-end mb-6 px-1">
        <div
          className="px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed max-w-[75%]"
          style={{
            backgroundColor: 'var(--card-strong)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // ── ASSISTANT message ──
  // While streaming / just-finished: show text with blinking cursor (no logo yet)
  // When done (no cursor): show full markdown + logo as bottom-left signature
  const isActive = isStreaming || showCursor;

  if (isActive) {
    // Streaming state — text + blinking cursor, logo at top-left like Claude
    return (
      <div className="flex gap-3 mb-8 px-1">
        <div
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center mt-1"
          style={{ color: 'var(--text-primary)' }}
        >
          <DigItnLogo size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[15px] leading-[1.75] whitespace-pre-wrap"
            style={{ color: 'var(--text-primary)' }}
          >
            {content}
            <span
              style={{
                display: 'inline-block',
                width: '2px',
                height: '1em',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                backgroundColor: 'var(--accent)',
                animation: 'blink 0.9s step-end infinite',
                opacity: isStreaming ? 1 : showCursor ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
            />
          </p>
        </div>
      </div>
    );
  }

  // Finished state — full markdown, logo as bottom signature
  return (
    <div className="mb-8 px-1">
      <div
        className="text-[15px] leading-[1.75]"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="digitn-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
      {/* Logo signature — bottom left */}
      <div
        className="flex items-center gap-1.5 mt-3"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <DigItnLogo size={16} />
        <span className="text-[11px] font-medium tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
          DIGITN AI
        </span>
      </div>
    </div>
  );
}
