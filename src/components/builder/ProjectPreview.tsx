'use client';

import { useState } from 'react';
import { FiMonitor, FiSmartphone, FiExternalLink, FiDownload, FiRefreshCw } from 'react-icons/fi';

interface ProjectPreviewProps {
  projectId: string;
  projectName: string;
  expiresAt: string;
  onRebuild: () => void;
}

export function ProjectPreview({ projectId, projectName, expiresAt, onRebuild }: ProjectPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Use relative URLs so they work across environments
  // In dev, use the API route. In prod, Nginx handles /projects/ and /zips/
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const url = isLocalhost ? `/api/projects/${projectId}/index.html` : `/projects/${projectId}/`;
  const zipUrl = isLocalhost ? `/api/zips/${projectId}.zip` : `/zips/${projectId}.zip`;

  return (
    <div className="w-full flex flex-col h-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">

      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-[var(--text-primary)]">{projectName}</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Device Toggles */}
          <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border)]">
            <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
              <FiMonitor size={14} />
            </button>
            <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-[var(--card-bg)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
              <FiSmartphone size={14} />
            </button>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <button onClick={onRebuild} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <FiRefreshCw size={14} /> Reconstruire
          </button>

          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <FiExternalLink size={14} /> Ouvrir
          </a>

          <a href={zipUrl} download className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 transition-opacity">
            <FiDownload size={14} /> Télécharger
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className={`transition-all duration-300 border border-[var(--border-strong)] bg-[var(--bg-primary)] rounded-md shadow-lg ${
          device === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'
        }`} style={{ overflow: 'hidden' }}>
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Project Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
