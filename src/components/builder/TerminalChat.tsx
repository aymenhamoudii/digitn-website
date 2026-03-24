'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiFile, FiTerminal, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ClientPreview from './ClientPreview';

interface LogEntry {
  type: 'system' | 'ai' | 'file_update' | 'user' | 'log' | 'error' | 'signature';
  content: string;
  id?: string | number;
}

interface TerminalChatProps {
  projectId: string;
  projectName: string;
  initialStatus: string;
  projectType: string;
  projectDescription?: string;
  questionnaireAnswers?: string;
  history?: Array<{ role: string, content: string }>;
}

export default function TerminalChat({ projectId, projectName, initialStatus, projectType, projectDescription, questionnaireAnswers, history = [] }: TerminalChatProps) {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    if (initialStatus === 'building' || initialStatus === 'analyzing') {
      // Don't show static messages - let SSE populate the terminal in real-time
      return [];
    } else if (initialStatus === 'ready' && history && history.length > 0) {
      // Only show history if project is ready and has chat history
      const initialLogs: LogEntry[] = [
        { type: 'system', content: `> Initializing workspace for ${projectName}...`, id: 'init-0' }
      ];
      let entryId = 0;

      // Format history into terminal logs
      history.forEach((msg, idx) => {
        if (msg.role === 'user') {
          initialLogs.push({ type: 'user', content: msg.content, id: `hist-${idx}` });
        } else if (msg.role === 'assistant') {
          // Extract file update messages from the DB content
          const lines = msg.content.split('\n');
          let aiText = '';

          lines.forEach(line => {
            if (line.includes('[DIGITN] ✓')) {
              // Flush any accumulated ai text
              if (aiText.trim()) {
                initialLogs.push({ type: 'ai', content: aiText.trim(), id: `hist-ai-${entryId++}` });
                aiText = '';
              }
              // Push file update
              const trimmed = line.trim();
              if (!initialLogs.some(l => l.type === 'file_update' && l.content === trimmed)) {
                initialLogs.push({ type: 'file_update', content: trimmed, id: `hist-file-${entryId++}` });
              }
            } else {
              aiText += line + '\n';
            }
          });

          // Add remaining AI content
          if (aiText.trim()) {
            initialLogs.push({ type: 'ai', content: aiText.trim(), id: `hist-ai-${entryId++}` });
          }
          // Add signature marker
          initialLogs.push({ type: 'signature', content: '', id: `hist-sig-${entryId++}` });
        }
      });

      return initialLogs;
    } else {
      // Default ready state with no history
      return [
        { type: 'system', content: `> Project ${projectName} is ready.`, id: 'ready-1' },
        { type: 'system', content: `> You can request changes below or download the code.`, id: 'ready-2' }
      ];
    }
  });

  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(initialStatus === 'building' || initialStatus === 'analyzing');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle preview ready state
  useEffect(() => {
    if (initialStatus === 'ready' && !previewReady) {
      // Small delay to ensure files are loaded
      const timer = setTimeout(() => {
        setPreviewReady(true);
        setShowPreview(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialStatus, previewReady]);

  // Initial Build Stream
  useEffect(() => {
    if (initialStatus === 'building' || initialStatus === 'analyzing') {
      const evtSource = new EventSource(`/api/builder/stream/${projectId}`);

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const eventId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          if (data.type === 'log') {
            // System/build logs
            if (data.text.includes('[DIGITN] ✓')) {
              // It's a file creation log
              const lines = data.text.split('\n').filter((l: string) => l.trim().length > 0);
              lines.forEach((line: string, idx: number) => {
                const trimmedLog = line.trim();
                if (trimmedLog.includes('[DIGITN] ✓')) {
                  setLogs((prev) => {
                    if (prev.some((l) => l.type === 'file_update' && l.content === trimmedLog)) {
                      return prev;
                    }
                    return [...prev, { type: 'file_update', content: trimmedLog, id: `${eventId}-${idx}` }];
                  });
                } else {
                  setLogs(prev => [...prev, { type: 'log', content: trimmedLog, id: `${eventId}-${idx}` }]);
                }
              });
            } else {
              setLogs(prev => [...prev, { type: 'log', content: data.text, id: eventId }]);
            }
          } else if (data.type === 'content') {
            // Chat stream uses this
            setLogs(prev => {
              const lastLog = prev[prev.length - 1];
              if (lastLog && lastLog.type === 'ai') {
                // Append to existing AI chunk
                const updatedLogs = [...prev];
                updatedLogs[updatedLogs.length - 1] = { ...lastLog, content: lastLog.content + data.text };
                return updatedLogs;
              }
              return [...prev, { type: 'ai', content: data.text, id: eventId }];
            });
          } else if (data.type === 'system_status') {
            // System status messages from bridge
            setLogs(prev => [...prev, { type: 'system', content: data.text, id: eventId }]);
          } else if (data.type === 'status') {
            if (data.status === 'content_chunk') {
              setLogs(prev => {
                const lastLog = prev[prev.length - 1];
                if (lastLog && lastLog.type === 'ai') {
                  const updatedLogs = [...prev];
                  updatedLogs[updatedLogs.length - 1] = { ...lastLog, content: lastLog.content + data.text };
                  return updatedLogs;
                }
                return [...prev, { type: 'ai', content: data.text, id: eventId }];
              });
            } else {
              setStatus(data.status);
              if (data.status === 'ready') {
                setIsProcessing(false);
                setLogs(prev => [
                  ...prev,
                  { type: 'system', content: `\n> ✓ Build complete! Your project is ready.`, id: `ready-1-${Date.now()}` },
                  { type: 'system', content: `> You can now request changes below or download the code.`, id: `ready-2-${Date.now()}` }
                ]);
                setTimeout(() => {
                  setPreviewReady(true);
                  setShowPreview(true);
                }, 500);
                evtSource.close();
              } else if (data.status === 'failed') {
                setIsProcessing(false);
                setLogs(prev => [...prev, { type: 'error', content: `\n> ❌ Build failed. Please try again.`, id: `error-${Date.now()}` }]);
                evtSource.close();
              }
            }
          } else if (data.type === 'error') {
            setLogs(prev => [...prev, { type: 'error', content: `\n> Error: ${data.message}`, id: `srv-error-${Date.now()}` }]);
            setIsProcessing(false);
            setStatus('failed');
            evtSource.close();
          }
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };

      evtSource.onerror = () => {
        evtSource.close();
      };

      return () => evtSource.close();
    }
  }, [projectId, initialStatus]);

  // Handle Post-Build Chat Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || status !== 'ready') return;

    const message = input.trim();
    setInput('');
    setLogs(prev => [...prev, { type: 'user', content: message, id: `user-${Date.now()}` }]);
    setIsProcessing(true);
    setStatus('modifying');

    try {
      const response = await fetch(`/api/builder/chat/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // Keep the last partial chunk in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              const eventId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              if (data.type === 'content') {
                // Hide MODIFICATION_COMPLETE from live stream
                const text = data.text.replace(/MODIFICATION_COMPLETE/g, '');
                if (text) {
                  setLogs(prev => {
                    const lastLog = prev[prev.length - 1];
                    if (lastLog && lastLog.type === 'ai') {
                      // Merge consecutive AI chunks
                      const updated = [...prev];
                      updated[updated.length - 1] = { ...lastLog, content: lastLog.content + text };
                      return updated;
                    }
                    return [...prev, { type: 'ai', content: text, id: eventId }];
                  });
                }
              } else if (data.type === 'signature') {
                // Add signature marker
                setLogs(prev => [...prev, { type: 'signature', content: '', id: eventId }]);
              } else if (data.type === 'error') {
                setLogs(prev => [...prev, { type: 'error', content: `\n[Error] ${data.message}`, id: eventId }]);
                toast.error(data.message);
              } else if (data.type === 'status' && data.status === 'complete') {
                // complete
              }
            } catch (e) {
              console.error('Error parsing chat SSE line:', line, e);
            }
          }
        }
      }

      setIsProcessing(false);
      setStatus('ready');

      // Trigger ClientPreview to reload files
      window.dispatchEvent(new CustomEvent('project-updated', { detail: { projectId } }));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setLogs(prev => [...prev, { type: 'error', content: `\n[System Error] ${errorMessage}`, id: `err-${Date.now()}` }]);
      setIsProcessing(false);
      setStatus('ready');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-4">
      {/* Main Terminal Column */}
      <div className={`flex flex-col bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden ${showPreview && status === 'ready' && previewReady ? 'lg:w-1/2' : 'w-full'} h-full transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="font-mono text-sm text-[var(--text-secondary)] ml-2 hidden sm:inline-block truncate max-w-[150px]">{projectName}</span>
            <span className={`px-2 py-0.5 rounded text-xs ml-2 uppercase
              ${status === 'ready' ? 'bg-green-900/50 text-green-400' :
                status === 'failed' ? 'bg-red-900/50 text-red-400' :
                  'bg-blue-900/50 text-blue-400'}`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === 'ready' && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] rounded border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                {showPreview ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            )}
            {status === 'modifying' && (
              <span className="text-sm text-[var(--text-secondary)]">Updating...</span>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed space-y-4 font-sans terminal-container"
        >
          {logs.map((block, index, arr) => {
            // Check if this block should draw a line to the next block
            const isNotLast = index < arr.length - 1;

            if (block.type === 'file_update') {
              const content = block.content.trim();
              const isCreated = content.includes('Created');
              const action = isCreated ? 'Created' : 'Updated';
              const filename = content.split(`${action} `)[1]?.trim() || '';

              return (
                <div key={block.id || index} className="flex">
                  <div className="inline-flex items-center gap-2.5 py-1.5 px-3 bg-white/5 backdrop-blur-sm rounded border border-white/5 transition-colors hover:border-white/10 my-0.5">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--neon-pink)]">DIGITN</span>
                    <span className="text-white/30">•</span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">{action}</span>
                    <span className="font-mono text-sm text-[var(--neon-green)]">{filename}</span>
                  </div>
                </div>
              );
            }

            else if (block.type === 'log') {
              if (!block.content) return null;
              // Normal log output
              return <div key={block.id || index} className="font-mono text-xs text-white/40 whitespace-pre-wrap px-2">{block.content}</div>;
            }

            else if (block.type === 'ai') {
              // Also check for ad-hoc [DIGITN] file updates that were piped inside AI content stream
              if (block.content.includes('[DIGITN] ✓')) {
                const parts = block.content.split('\n');

                // Deduplicate repetitive tool outputs the AI might have hallucinated
                const uniqueParts = parts.filter((val, index, self) =>
                  val.includes('[DIGITN] ✓') ? self.findIndex(v => v === val) === index : true
                );

                return (
                  <div key={block.id || index} className={`relative pl-8 ${isNotLast ? 'tree-line' : ''}`}>
                    <div className="absolute left-1 top-[5px] text-[var(--neon-pink)]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                      </svg>
                    </div>

                    {uniqueParts.map((p, i) => {
                      if (p.includes('[DIGITN] ✓')) {
                        const isC = p.includes('Created');
                        const act = isC ? 'Created' : 'Updated';
                        const fn = p.split(`${act} `)[1]?.trim() || '';
                        return (
                          <div key={i} className="flex my-1">
                            <div className="inline-flex items-center gap-2.5 py-1.5 px-3 bg-white/5 backdrop-blur-sm rounded border border-white/5">
                              <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--neon-pink)]">DIGITN</span>
                              <span className="text-white/30">•</span>
                              <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">{act}</span>
                              <span className="font-mono text-sm text-[var(--neon-green)]">{fn}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={i} className="prose prose-sm dark:prose-invert max-w-none text-white/80">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{p}</ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div key={block.id || index} className={`relative pl-8 ${isNotLast ? 'tree-line' : ''}`}>
                  <div className="absolute left-1 top-[5px] text-[var(--neon-pink)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                    </svg>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-white/80">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            }

            else if (block.type === 'signature') {
              return (
                <div key={block.id || index} className="relative pl-8 mt-2 mb-4">
                  <div className="absolute left-[7px] top-[6px] z-10 flex items-center justify-center bg-[var(--term-bg)] p-1">
                    <div className="w-2 h-2 rounded-full border border-white/30 bg-[var(--term-bg)]"></div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">DIGITN AI</span>
                </div>
              );
            }

            else if (block.type === 'user') {
              const content = block.content.trim();
              if (!content) return null;

              return (
                <div key={block.id || index} className="bg-[var(--term-grid)] border border-white/10 text-white px-4 py-3 rounded-xl inline-block max-w-[85%] shadow-lg my-2 flex items-start gap-3">
                  <span className="font-sans leading-relaxed">{content}</span>
                </div>
              );
            }

            else {
              const content = block.content.trim();
              if (!content) return null;

              return (
                <div key={block.id || index} className="flex items-start gap-2 text-white/50 font-mono text-xs px-2">
                  <FiTerminal className="mt-0.5 flex-shrink-0" />
                  <span className="whitespace-pre-wrap">{content}</span>
                </div>
              );
            }
          })}

          {isProcessing && (
            <div className="relative pl-8 animate-fade-in">
              <div className="absolute left-1 top-[5px] animate-spin text-[var(--neon-blue)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </div>
              <span className="font-mono text-xs text-white/50 uppercase tracking-widest pt-1 block">
                {status === 'modifying'
                  ? 'DIGITN AI is modifying your project...'
                  : status === 'building'
                    ? 'DIGITN AI is building your project...'
                    : status === 'analyzing'
                      ? 'Analyzing project requirements...'
                      : 'Executing operation...'}
              </span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <span className="absolute left-4 text-[var(--text-tertiary)] font-mono text-lg">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready' || isProcessing}
              placeholder={status === 'ready' && !isProcessing ? "Type a message to modify the project..." : "Please wait..."}
              className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-sm py-3 pl-10 pr-12 rounded border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || status !== 'ready' || isProcessing}
              className="absolute right-3 p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent)] disabled:opacity-50 transition-colors"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>

      {/* Preview Column */}
      {showPreview && status === 'ready' && previewReady && (
        <div className="flex-1 h-full animate-fade-in">
          <ClientPreview
            projectId={projectId}
            projectName={projectName}
            projectType={projectType}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            fullHeight={true}
          />
        </div>
      )}
    </div>
  );
}