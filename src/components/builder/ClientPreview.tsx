'use client';

import { useEffect, useState, useRef } from 'react';
import { FiDownload, FiLayout, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ClientPreviewProps {
  projectId: string;
  projectName: string;
  projectType: string;
  showPreview: boolean;
  onTogglePreview: () => void;
  fullHeight?: boolean;
}

export default function ClientPreview({
  projectId,
  projectName,
  projectType,
  showPreview,
  onTogglePreview,
  fullHeight = false
}: ClientPreviewProps) {
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Keep track of created blobs so we can revoke them to prevent memory leaks
  const blobUrlsRef = useRef<{ [key: string]: string }>({});

  const isWebProject = !projectType?.includes('api') && !projectType?.includes('backend') && !projectType?.includes('native');

  // Load project files
  useEffect(() => {
    loadFiles();

    // Listen for project updates
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail.projectId === projectId) {
        loadFiles();
      }
    };

    window.addEventListener('project-updated', handleUpdate as EventListener);
    return () => window.removeEventListener('project-updated', handleUpdate as EventListener);
  }, [projectId]);

  // Create preview URL when files change
  useEffect(() => {
    if (files['index.html']) {
      createPreviewUrl();
    }
  }, [files]);

  async function loadFiles() {
    try {
      const response = await fetch(`/api/projects/${projectId}/files`);
      if (!response.ok) throw new Error('Failed to load files');

      const data = await response.json();
      setFiles(data.files || {});
      setLoading(false);
    } catch (err) {
      console.error('Failed to load project files:', err);
      toast.error('Failed to load project files');
      setLoading(false);
    }
  }

  function createPreviewUrl() {
    let html = files['index.html'] || '';
    if (!html) return;

    const newBlobUrls: { [key: string]: string } = {};

    // 1. Create a Blob URL for every asset file in the dictionary
    Object.entries(files).forEach(([path, content]) => {
      if (path === 'index.html') return;

      let mimeType = 'text/plain';
      if (path.endsWith('.css')) mimeType = 'text/css';
      else if (path.endsWith('.js')) mimeType = 'application/javascript';
      else if (path.endsWith('.json')) mimeType = 'application/json';
      else if (path.endsWith('.svg')) mimeType = 'image/svg+xml';

      const blob = new Blob([content], { type: mimeType });
      newBlobUrls[path] = URL.createObjectURL(blob);
    });

    // 2. Powerful Interceptor: Replace all relative paths in the HTML with the Blob URLs!
    // This makes folders like css/style.css or js/game.js work completely natively!
    Object.entries(newBlobUrls).forEach(([path, url]) => {
      // Exact matches: href="css/style.css"
      html = html.split(`"${path}"`).join(`"${url}"`);
      html = html.split(`'${path}'`).join(`'${url}'`);

      // Matches with ./ prefix: href="./css/style.css"
      html = html.split(`"./${path}"`).join(`"${url}"`);
      html = html.split(`'./${path}'`).join(`'${url}'`);

      // Matches absolute / prefix: href="/css/style.css"
      html = html.split(`"/${path}"`).join(`"${url}"`);
      html = html.split(`'/${path}'`).join(`'${url}'`);
    });

    // 3. Fallback Auto-Injection (only if the AI forgot to link them in the HTML)
    const cssFileKey = Object.keys(files).find(k => k.endsWith('.css'));
    if (cssFileKey && !html.includes(cssFileKey) && !html.includes(cssFileKey.split('/').pop() || '')) {
      const css = files[cssFileKey];
      if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${css}</style></head>`);
      } else {
        html = `<style>${css}</style>${html}`;
      }
    }

    const jsFileKey = Object.keys(files).find(k => k.endsWith('.js'));
    if (jsFileKey && !html.includes(jsFileKey) && !html.includes(jsFileKey.split('/').pop() || '')) {
      const js = files[jsFileKey];
      if (html.includes('</body>')) {
        html = html.replace('</body>', `<script>${js}</script></body>`);
      } else {
        html = `${html}<script>${js}</script>`;
      }
    }

    // 4. Generate final HTML Blob
    const blob = new Blob([html], { type: 'text/html' });
    const finalUrl = URL.createObjectURL(blob);

    // Clean up old URLs to prevent memory leaks in the browser
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));

    blobUrlsRef.current = newBlobUrls;
    setPreviewUrl(finalUrl);
  }

  async function downloadZip() {
    try {
      toast.loading('Generating ZIP...', { id: 'zip' });

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      Object.entries(files).forEach(([filePath, content]) => {
        zip.file(filePath, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'project'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('ZIP downloaded!', { id: 'zip' });
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      toast.error('Failed to generate ZIP', { id: 'zip' });
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrl]);

  if (!isWebProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] p-8">
        <FiDownload size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Backend / Native Project</h3>
        <p className="text-sm text-center max-w-sm mb-6">
          This project is a backend API or native mobile app and cannot be previewed directly in the browser.
          Please download the code to run it locally.
        </p>
        <button
          onClick={downloadZip}
          disabled={loading || Object.keys(files).length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <FiDownload />
          Download ZIP
        </button>
      </div>
    );
  }

  if (fullHeight && showPreview && isWebProject && previewUrl) {
    return (
      <div className="h-full bg-white rounded-xl border border-[var(--border)] overflow-hidden flex flex-col shadow-lg">
        <div className="bg-[var(--bg-secondary)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="font-mono text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-blue)] bg-[var(--bg-primary)] hover:bg-[var(--border)] rounded border border-[var(--border)] transition-colors"
            >
              <FiExternalLink size={14} />
              Open Full Page
            </a>
            <button
              onClick={downloadZip}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-primary)] hover:bg-[var(--border)] rounded border border-[var(--border)] transition-colors"
            >
              <FiDownload size={14} />
              Download ZIP
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)] text-sm font-mono">
            Generating view...
          </div>
        ) : (
          <iframe
            key={previewUrl}
            src={previewUrl}
            className="w-full flex-1 bg-white border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Project Preview"
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isWebProject && (
          <button
            onClick={onTogglePreview}
            className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-primary)] hover:bg-[var(--border)] text-[var(--text-secondary)]'}`}
            title="Toggle Preview"
          >
            <FiLayout />
          </button>
        )}
        <button
          onClick={downloadZip}
          disabled={loading || Object.keys(files).length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--border)] text-[var(--text-primary)] text-sm rounded transition-colors disabled:opacity-50"
        >
          <FiDownload />
          <span className="hidden sm:inline">Download ZIP</span>
        </button>
      </div>

      {showPreview && isWebProject && previewUrl && (
        <div className="flex-1 bg-white rounded-xl border border-[var(--border)] overflow-hidden h-full flex flex-col">
          <div className="bg-[var(--bg-secondary)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-center text-sm text-[var(--text-secondary)] shadow-sm z-10 relative">
            <div className="absolute left-4 flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <span className="font-mono bg-[var(--bg-primary)] text-[var(--text-tertiary)] px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
              LIVE PREVIEW
            </span>
          </div>

          <iframe
            key={previewUrl}
            src={previewUrl}
            className="w-full flex-1 bg-white border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Project Preview"
          />
        </div>
      )}
    </>
  );
}
