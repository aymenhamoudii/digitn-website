"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiClock,
  FiTrash2,
  FiBox,
  FiFolder,
  FiDownload,
  FiRefreshCw,
  FiGlobe,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  status: string;
  created_at: string;
  serve_path?: string;
}

interface ProjectsClientProps {
  projects: Project[];
  tier: string;
}

export default function ProjectsClient({
  projects: initialProjects,
  tier,
}: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [retryingProjects, setRetryingProjects] = useState<Set<string>>(
    new Set(),
  );

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this project? This cannot be undone.")) return;

    // Optimistic remove
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Restore on failure
        setProjects(initialProjects);
        try {
          const body = await res.json();
          toast.error(body?.error || "Failed to delete project");
        } catch {
          toast.error("Failed to delete project");
        }
      } else {
        toast.success("Project deleted");
      }
    } catch (err: unknown) {
      setProjects(initialProjects);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete project",
      );
    }
  };

  const handleRetry = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setRetryingProjects((prev) => new Set(prev).add(projectId));

    try {
      const response = await fetch("/api/builder/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restart build");
      }

      toast.success("Build restarted");
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: "building" } : p,
        ),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to retry build");
    } finally {
      setRetryingProjects((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const handleDownload = async (
    projectId: string,
    projectName: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      toast.loading("Generating ZIP...", { id: "zip" });

      const response = await fetch(`/api/projects/${projectId}/files`);
      if (!response.ok) throw new Error("Failed to load files");

      const data = await response.json();
      const files = data.files || {};

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      Object.entries(files).forEach(([filePath, content]) => {
        if (typeof content === "string" && content.startsWith("data:")) {
          // base64 binary file
          const base64 = content.split(",")[1];
          zip.file(filePath, base64, { base64: true });
        } else {
          zip.file(filePath, content as string);
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName || "project"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("ZIP downloaded!", { id: "zip" });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error("Failed to generate ZIP:", err);
      toast.error("Failed to generate ZIP", { id: "zip" });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="p-8 max-w-platform mx-auto w-full">
        <div
          className="text-center py-20 rounded-xl"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <FiFolder size={28} style={{ color: "var(--text-tertiary)" }} />
          </div>
          <h3
            className="text-lg font-medium"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            No presentations yet
          </h3>
          <p
            className="mt-2 mb-6 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Start by creating your first AI-generated presentation.
          </p>
          <Link
            href="/app/builder"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-md font-medium text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <FiBox size={16} /> Create a presentation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-platform mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => {
          const isExpired = p.status === "expired";
          const isFailed = p.status === "failed";
          const isRetrying = retryingProjects.has(p.id);

          return (
            <div
              key={p.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(p.type === 'presentation' ? `/app/builder/studio/${p.id}` : `/app/builder/terminal/${p.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(p.type === 'presentation' ? `/app/builder/studio/${p.id}` : `/app/builder/terminal/${p.id}`);
                }
              }}
              className={`rounded-xl overflow-hidden transition-all flex flex-col cursor-pointer ${
                isExpired
                  ? "opacity-60"
                  : "hover:shadow-md hover:-translate-y-1"
              }`}
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Status header bar */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isExpired
                        ? "var(--text-tertiary)"
                        : isFailed
                          ? "var(--status-failed)"
                          : p.status === "ready"
                            ? "var(--status-ready)"
                            : "var(--status-pending)",
                    }}
                  />
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider"
                    style={{
                      color: isExpired
                        ? "var(--text-tertiary)"
                        : isFailed
                          ? "var(--status-failed)"
                          : p.status === "ready"
                            ? "var(--status-ready)"
                            : "var(--status-pending)",
                    }}
                  >
                    {isExpired ? "Expired" : p.status}
                  </span>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {p.type || "project"}
                </span>
              </div>

              <div className="p-5 flex flex-col h-full flex-1">
                <h3
                  className="font-medium truncate mb-1"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-serif)",
                  }}
                  title={p.name}
                >
                  {p.name}
                </h3>

                {p.description && (
                  <p
                    className="text-xs line-clamp-2 mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.description}
                  </p>
                )}

                <p
                  className="text-xs flex items-center gap-1.5 mb-4"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <FiClock size={12} />
                  {new Date(p.created_at).toLocaleDateString()} at{" "}
                  {new Date(p.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                <div
                  className="flex justify-between items-center pt-4 mt-auto"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    {p.status === "ready" && !isExpired && (
                      <>
                        <span
                          className="text-xs font-medium flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                          style={{ color: "var(--accent-blue)" }}
                        >
                          <FiGlobe size={14} /> Open
                        </span>
                        <button
                          onClick={(e) => handleDownload(p.id, p.name, e)}
                          className="text-xs font-medium flex items-center gap-1.5 transition-all hover:-translate-y-0.5"
                          style={{ color: "var(--accent)" }}
                        >
                          <FiDownload size={14} /> Download
                        </button>
                      </>
                    )}
                    {isFailed && (
                      <button
                        onClick={(e) => handleRetry(p.id, e)}
                        disabled={isRetrying}
                        className="text-xs font-medium flex items-center gap-1.5 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        style={{ color: "var(--accent)" }}
                      >
                        <FiRefreshCw
                          size={14}
                          className={isRetrying ? "animate-spin" : ""}
                        />
                        {isRetrying ? "Retrying..." : "Retry Build"}
                      </button>
                    )}
                    {(isExpired || (p.status !== "ready" && !isFailed)) && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {isExpired
                          ? "Preview expired"
                          : p.status === "building"
                            ? "Building..."
                            : "Processing..."}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-2 rounded-md transition-all hover:bg-red-500/10 hover:-translate-y-0.5 group z-10 relative"
                    style={{ color: "var(--text-tertiary)" }}
                    title="Delete project"
                  >
                    <FiTrash2
                      size={16}
                      className="transition-colors group-hover:text-red-500"
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
