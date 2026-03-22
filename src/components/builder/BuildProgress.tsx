'use client';

import { useEffect, useState, useRef } from 'react';
import { FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface BuildProgressProps {
  projectId: string;
  onComplete: () => void;
}

export function BuildProgress({ projectId, onComplete }: BuildProgressProps) {
  const [logs, setLogs] = useState<string>('');
  const [status, setStatus] = useState<'building' | 'ready' | 'failed'>('building');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/builder/stream/${projectId}`);

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'log') {
        setLogs(prev => prev + data.text);
      } else if (data.type === 'status') {
        setStatus(data.status);
        if (data.status === 'ready' || data.status === 'failed') {
          eventSource.close();
          if (data.status === 'ready') onComplete();
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStatus('failed');
    };

    return () => eventSource.close();
  }, [projectId, onComplete]);

  return (
    <div className="w-full bg-[#1e1d1b] rounded-xl overflow-hidden border border-[var(--border)] font-mono text-sm text-green-400">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/70">
          {status === 'building' ? <FiLoader className="animate-spin" /> :
           status === 'ready' ? <FiCheckCircle className="text-green-500" /> :
           <FiXCircle className="text-red-500" />}
          <span>Terminal — DIGITN AI Builder</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
      </div>

      <div className="p-4 h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {logs === '' && status === 'building' ? (
          <span className="text-white/40 text-sm">Connecting to build server...</span>
        ) : (
          logs
        )}
        {status === 'building' && logs !== '' && <span className="animate-pulse">_</span>}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
