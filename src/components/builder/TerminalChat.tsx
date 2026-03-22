'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiDownload, FiLayout } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface TerminalChatProps {
  projectId: string;
  projectName: string;
  initialStatus: string;
  projectType: string;
}

export default function TerminalChat({ projectId, projectName, initialStatus, projectType }: TerminalChatProps) {
  const [logs, setLogs] = useState<string[]>([`> Initializing workspace for ${projectName}...`]);
  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(initialStatus === 'building' || initialStatus === 'analyzing');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPreview, setShowPreview] = useState(initialStatus === 'ready');
  const isWebProject = !projectType.includes('api') && !projectType.includes('backend');

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Initial Build Stream
  useEffect(() => {
    if (initialStatus === 'building' || initialStatus === 'analyzing') {
        const evtSource = new EventSource(`/api/builder/stream/${projectId}`);

        evtSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'log' || data.type === 'content') {
                    setLogs(prev => [...prev, data.text]);
                } else if (data.type === 'status') {
                    setStatus(data.status);
                    if (data.status === 'ready') {
                        setIsProcessing(false);
                        setLogs(prev => [...prev, '\n> ✓ Build complete! Your project is ready.', '> You can now request changes below or download the code.']);
                        if (isWebProject) setShowPreview(true);
                        evtSource.close();
                    } else if (data.status === 'failed') {
                        setIsProcessing(false);
                        setLogs(prev => [...prev, '\n> ❌ Build failed. Please try again.']);
                        evtSource.close();
                    }
                } else if (data.type === 'error') {
                    setLogs(prev => [...prev, `\n> Error: ${data.message}`]);
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
    } else if (initialStatus === 'ready') {
        setLogs([`> Project ${projectName} loaded.`, `> You can request changes below or download the code.`]);
    }
  }, [projectId, initialStatus, isWebProject, projectName]);

  // Handle Post-Build Chat Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || status !== 'ready') return;

    const message = input.trim();
    setInput('');
    setLogs(prev => [...prev, `\nYou: ${message}\n`]);
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

              if (data.type === 'content') {
                 const text = data.text.replace(/\n$/, '');
                 setLogs(prev => [...prev, text]);
              } else if (data.type === 'error') {
                 setLogs(prev => [...prev, `\n[Error] ${data.message}`]);
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

      // Refresh the iframe preview
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
         iframe.src = iframe.src;
      }

    } catch (err: any) {
      setLogs(prev => [...prev, `\n[System Error] ${err.message}`]);
      setIsProcessing(false);
      setStatus('ready');
      toast.error(err.message);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)] gap-4 ${showPreview && isWebProject ? 'lg:flex-row' : ''}`}>
      {/* Main Terminal Column */}
      <div className={`flex flex-col bg-[#1a1a19] rounded-xl border border-[#333] overflow-hidden ${showPreview && isWebProject ? 'lg:w-[40%]' : 'w-full'} h-full transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#222220] border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="font-mono text-sm text-gray-300 ml-2 hidden sm:inline-block truncate max-w-[150px]">{projectName}</span>
            <span className={`px-2 py-0.5 rounded text-xs ml-2 uppercase
              ${status === 'ready' ? 'bg-green-900/50 text-green-400' :
                status === 'failed' ? 'bg-red-900/50 text-red-400' :
                'bg-blue-900/50 text-blue-400'}`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {status === 'ready' && isWebProject && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-[var(--accent)] text-white' : 'bg-[#333] hover:bg-[#444] text-gray-300'}`}
                title="Toggle Preview"
              >
                <FiLayout />
              </button>
            )}
            {status === 'ready' && (
              <a
                href={`/zips/${projectId}.zip`}
                download
                className="flex items-center gap-2 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-white text-sm rounded transition-colors"
              >
                <FiDownload />
                <span className="hidden sm:inline">Download ZIP</span>
              </a>
            )}
            {status === 'modifying' && (
              <button disabled className="flex items-center gap-2 px-3 py-1.5 bg-[#333] opacity-50 text-white text-sm rounded cursor-not-allowed">
                <FiDownload />
                <span className="hidden sm:inline">Updating...</span>
              </button>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
        >
          {logs.map((log, i) => (
            <span key={i}>{log}</span>
          ))}
          {isProcessing && status !== 'modifying' && (
            <span className="animate-pulse">_</span>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[#222220] border-t border-[#333]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <span className="absolute left-4 text-gray-500 font-mono text-lg">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready' || isProcessing}
              placeholder={status === 'ready' && !isProcessing ? "Type a message to modify the project..." : "Please wait..."}
              className="w-full bg-[#1a1a19] text-gray-200 font-mono text-sm py-3 pl-10 pr-12 rounded border border-[#444] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || status !== 'ready' || isProcessing}
              className="absolute right-3 p-1.5 text-gray-400 hover:text-[var(--accent)] disabled:opacity-50 transition-colors"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>

      {/* Live Preview Pane */}
      {showPreview && isWebProject && status === 'ready' && (
        <div className="flex-1 bg-white rounded-xl border border-[var(--border)] overflow-hidden h-full flex flex-col">
          <div className="bg-[var(--bg-secondary)] px-4 py-2 border-b border-[var(--border)] flex items-center text-sm text-[var(--text-secondary)]">
            <span className="font-mono bg-[var(--bg-primary)] px-2 py-1 rounded">https://digitn.tech/projects/{projectId}</span>
          </div>
          <iframe
            id="preview-iframe"
            src={`/projects/${projectId}/`}
            className="w-full flex-1 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Project Preview"
          />
        </div>
      )}
    </div>
  );
}