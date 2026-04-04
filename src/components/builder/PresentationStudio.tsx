"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DigItnLogo } from "@/components/ui/DigItnLogo";
import toast from "react-hot-toast";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import pptxgen from "pptxgenjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Create a blob URL from HTML string.
 * Blob URLs create a separate origin so the iframe does NOT inherit
 * the parent page's CSP — allowing CDN scripts/styles to load freely.
 */
function htmlToBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html" });
  return URL.createObjectURL(blob);
}

interface PresentationStudioProps {
  projectId: string;
  projectName: string;
  initialStatus: string;
  totalSlides: number;
  presentationJson?: Record<string, unknown> | null;
}

interface Palette {
  bg?: string;
  accent1?: string;
  accent2?: string;
  accent3?: string;
  text?: string;
  name?: string;
}

interface SelectedElement {
  tagName: string;
  text: string;
  fontSize: string;
  color: string;
  backgroundColor: string;
  fontWeight: string;
  textAlign: string;
  id: string;
  className: string;
  selector: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function PresentationStudio({
  projectId,
  projectName,
  initialStatus,
  totalSlides: initialTotalSlides,
  presentationJson,
}: PresentationStudioProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(initialTotalSlides || 0);
  const [currentPhase, setCurrentPhase] = useState<string | null>(
    initialStatus === "building" ? "building" : null
  );
  const [slidePreviewHtml, setSlidePreviewHtml] = useState("");
  const [slideBlurred, setSlideBlurred] = useState(true);
  const [palette, setPalette] = useState<Palette>(
    (presentationJson?.palette as Palette) || {}
  );
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(initialStatus === "ready");
  const [planContent, setPlanContent] = useState("");
  const [showPlan, setShowPlan] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [slideBlobUrl, setSlideBlobUrl] = useState("");
  const [previewBlobUrl, setPreviewBlobUrl] = useState("");

  // ── Element Inspector state ──
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [showInspector, setShowInspector] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // ── Chat state ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  /** Tracks what the AI is doing right now */
  const [aiActivity, setAiActivity] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ── Palette Suggestion State ──
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [isSuggestingPalettes, setIsSuggestingPalettes] = useState(false);
  const [suggestedPalettes, setSuggestedPalettes] = useState<Palette[] | null>(null);
  const [paletteError, setPaletteError] = useState<string | null>(null);

  const handleSuggestPalettes = async () => {
    setShowPaletteModal(true);
    setIsSuggestingPalettes(true);
    setPaletteError(null);
    setSuggestedPalettes(null);

    try {
      const res = await fetch("/api/builder/suggest-palettes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) throw new Error("Failed to suggest palettes");
      const data = await res.json();
      setSuggestedPalettes(data.palettes);
    } catch (err: any) {
      setPaletteError(err.message || "An error occurred");
    } finally {
      setIsSuggestingPalettes(false);
    }
  };

  const handleSelectPalette = async (newPalette: Palette) => {
    setPalette(newPalette);
    setShowPaletteModal(false);

    // Update the iframe immediately by modifying the current HTML and reloading it
    let newHtml = previewHtml;
    const cssVars: Record<string, string | undefined> = {
      "--bg": newPalette.bg,
      "--bg2": (newPalette as any).bg2,
      "--surface": (newPalette as any).surface,
      "--accent1": newPalette.accent1,
      "--accent2": newPalette.accent2,
      "--accent3": newPalette.accent3,
      "--t1": newPalette.text,
      "--t2": (newPalette as any).text2
    };

    for (const [key, value] of Object.entries(cssVars)) {
      if (value) {
        const regex = new RegExp(`${key}:\\s*[^;]+;`, "g");
        newHtml = newHtml.replace(regex, `${key}: ${value};`);
      }
    }

    // Fallback if some variables weren't present in HTML, we could inject a style tag
    if (newHtml === previewHtml) {
      const injectedStyles = `<style id="palette-override">:root { ${Object.entries(cssVars).filter(([_,v])=>v).map(([k,v])=>`${k}: ${v};`).join(' ')} }</style>`;
      if (newHtml.includes("</head>")) {
        newHtml = newHtml.replace("</head>", injectedStyles + "</head>");
      }
    }

    loadPresentation(newHtml);

    // Attempt to notify AI Chat about the palette update to save it
    try {
      await fetch(`/api/builder/chat/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Please update the color palette to: ${JSON.stringify(newPalette)}. Just output JSON.` }],
          mode: "chat"
        })
      });
    } catch (e) {
      console.error("Failed to save palette to backend", e);
    }
  };

  // ── Load Chat History from Database ──
  useEffect(() => {
    // Only fetch chat history if the project has already completed its initial build
    if (initialStatus === "building" || initialStatus === "analyzing") return;

    fetch(`/api/projects/${projectId}/terminal`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chat history");
        return res.json();
      })
      .then((events) => {
        if (Array.isArray(events)) {
          // Map backend terminal events (where event_type === "message") into the chat UI
          const history = events
            .filter((evt) => evt.event_type === "message")
            .map((evt) => ({
              role: evt.role as "user" | "assistant",
              content: evt.content || "",
            }));
          
          if (history.length > 0) {
            setChatMessages(history);
          }
        }
      })
      .catch((err) => {
        console.error("Could not load chat history from database:", err);
      });
  }, [projectId, initialStatus]);

  // Revoke old blob URLs when they change to prevent memory leaks
  const updateSlideBlobUrl = useCallback((html: string) => {
    setSlideBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return html ? htmlToBlobUrl(html) : "";
    });
  }, []);

  const updatePreviewBlobUrl = useCallback((html: string) => {
    setPreviewBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return html ? htmlToBlobUrl(html) : "";
    });
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (slideBlobUrl) URL.revokeObjectURL(slideBlobUrl);
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listen for postMessage from iframe (element selection) ──
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "element-selected") {
        setSelectedElement(e.data.element);
        setEditingField(null);
      } else if (e.data?.type === "element-deselected") {
        setSelectedElement(null);
        setEditingField(null);
      } else if (e.data?.type === "html-response") {
        const html = e.data.html;
        fetch(`/api/projects/${projectId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: "index.html", content: html }),
        })
          .then((res) => {
            if (res.ok) toast.success("Presentation saved successfully");
            else toast.error("Failed to save presentation");
          })
          .catch(() => toast.error("Network error while saving"));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ── Prevent accidental refresh during chat edits ──
  useEffect(() => {
    if (!chatSending) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [chatSending]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ── Inject element-selection script into completed presentation HTML ──
  const injectInspectorScript = useCallback((html: string): string => {
    const inspectorScript = `
<script id="digitn-inspector-script">
(function() {
  let currentHighlight = null;
  let currentOutline = null;

  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const el = e.target;
    if (el === document.body || el === document.documentElement) return;
    
    if (currentHighlight) {
      currentHighlight.style.outline = currentOutline || '';
    }
    
    currentHighlight = el;
    currentOutline = el.style.outline;
    el.style.outline = '2px solid #d97757';
    el.style.outlineOffset = '2px';
    
    function getSelector(node) {
      if (node.id) return '#' + node.id;
      if (node === document.body) return 'body';
      const parent = node.parentNode;
      if (!parent) return '';
      const children = Array.from(parent.children);
      const index = children.indexOf(node);
      return getSelector(parent) + ' > ' + node.tagName.toLowerCase() + ':nth-child(' + (index + 1) + ')';
    }
    
    const computed = window.getComputedStyle(el);
    
    window.parent.postMessage({
      type: 'element-selected',
      element: {
        tagName: el.tagName.toLowerCase(),
        text: el.innerText ? el.innerText.substring(0, 200) : '',
        fontSize: computed.fontSize,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        id: el.id || '',
        className: el.className || '',
        selector: getSelector(el),
      }
    }, '*');
  }, true);

  window.addEventListener('message', function(e) {
    if (e.data?.type === 'apply-style') {
      const { selector, property, value } = e.data;
      try {
        const el = document.querySelector(selector);
        if (el) el.style[property] = value;
      } catch(err) {}
    } else if (e.data?.type === 'apply-text') {
      const { selector, text } = e.data;
      try {
        const el = document.querySelector(selector);
        if (el) el.innerText = text;
      } catch(err) {}
    } else if (e.data?.type === 'remove-element') {
      const { selector } = e.data;
      try {
        const el = document.querySelector(selector);
        if (el) el.remove();
        window.parent.postMessage({ type: 'element-deselected' }, '*');
      } catch(err) {}
    } else if (e.data?.type === 'deselect') {
      if (currentHighlight) {
        currentHighlight.style.outline = currentOutline || '';
        currentHighlight = null;
      }
      window.parent.postMessage({ type: 'element-deselected' }, '*');
    } else if (e.data?.type === 'request-html') {
      if (currentHighlight) {
        currentHighlight.style.outline = currentOutline || '';
      }
      // Return HTML without the injected script
      let raw = document.documentElement.outerHTML;
      raw = raw.replace(/<script id="digitn-inspector-script">[\\s\\S]*?<\\/script>/, '');
      window.parent.postMessage({ type: 'html-response', html: '<!DOCTYPE html>\\n' + raw }, '*');
      if (currentHighlight) {
        currentHighlight.style.outline = '2px solid #d97757';
      }
    }
  });
})();
</script>`;
    if (html.includes("</body>")) {
      return html.replace("</body>", inspectorScript + "</body>");
    }
    return html + inspectorScript;
  }, []);

  /** Load HTML into the editable (inspector) blob URL */
  const loadPresentation = useCallback((rawHtml: string) => {
    setPreviewHtml(rawHtml);
    updatePreviewBlobUrl(injectInspectorScript(rawHtml));
  }, [updatePreviewBlobUrl, injectInspectorScript]);

  // For already-built presentations, load the final HTML
  useEffect(() => {
    if (initialStatus === "ready") {
      fetch(`/api/projects/${projectId}/files`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const files = data?.files;
          if (files && files["index.html"]) {
            loadPresentation(files["index.html"]);
          }
        })
        .catch(() => {});
    }
  }, [initialStatus, projectId, loadPresentation]);

  // SSE connection for live build streaming
  useEffect(() => {
    if (initialStatus !== "building" && initialStatus !== "analyzing") return;

    const evtSource = new EventSource(`/api/builder/stream/${projectId}`);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "palette") {
          setPalette(data.palette);
          setStatusMessages((prev) => [
            ...prev,
            `Selected palette: "${data.palette.name || "Custom"}"`,
          ]);
        } else if (data.type === "slide_start") {
          setCurrentSlide(data.index);
          setTotalSlides(data.total);
          setSlideBlurred(true);
          setStatusMessages((prev) => [
            ...prev,
            `Creating slide ${data.index + 1} of ${data.total} (${data.layout})...`,
          ]);
        } else if (data.type === "slide_complete") {
          setSlideBlurred(false);
          setTimeout(() => setSlideBlurred(true), 800);
        } else if (data.type === "file_content") {
          if (data.path === "preview.html") {
            setSlidePreviewHtml(data.content);
            updateSlideBlobUrl(data.content);
          }
        } else if (data.type === "phase") {
          setCurrentPhase(data.phase);
        } else if (data.type === "plan_start") {
          setCurrentPhase("planning");
          // Note: "Planning presentation structure..." message comes via system_status
        } else if (data.type === "plan_chunk") {
          setPlanContent((prev) => prev + data.text);
        } else if (data.type === "plan_end") {
          // Note: "Plan created..." message comes via system_status right after this
        } else if (data.type === "system_status") {
          if (data.text?.trim()) {
            setStatusMessages((prev) => [...prev, data.text.trim()]);
          }
        } else if (data.type === "status") {
          // Ignore content_chunk in PresentationStudio logs — we only want clean system events
          if (data.status === "ready") {
            setStatus("ready");
            setCurrentPhase(null);
            setSlideBlurred(false);
            evtSource.close();
            fetch(`/api/projects/${projectId}/files`)
              .then((res) => (res.ok ? res.json() : null))
              .then((filesData) => {
                const files = filesData?.files;
                if (files && files["index.html"]) {
                  loadPresentation(files["index.html"]);
                }
                setIsComplete(true);
              })
              .catch(() => {
                setIsComplete(true);
              });
          } else if (data.status === "failed") {
            setStatus("failed");
            setCurrentPhase(null);
            evtSource.close();
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development")
          console.error("SSE parse error:", err);
      }
    };

    let errorCount = 0;
    let lastErrorTime = 0;
    evtSource.onerror = () => {
      const now = Date.now();
      if (now - lastErrorTime > 5000) errorCount = 0;
      lastErrorTime = now;
      errorCount++;
      if (errorCount >= 8) {
        evtSource.close();
        setStatus("failed");
        toast.error("Connection to build server lost.");
      }
    };

    return () => evtSource.close();
  }, [projectId, initialStatus, updateSlideBlobUrl, loadPresentation]);

  const handleDownloadHtml = () => {
    if (!previewHtml) {
      toast.error("Presentation not ready yet");
      return;
    }
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "presentation"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const captureSlidesImages = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.width = "1920px";
      iframe.style.height = "1080px";
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px"; // off-screen but visible to renderer
      iframe.style.left = "-9999px";
      iframe.style.border = "none";
      // DO NOT use visibility: hidden or display: none, html2canvas will ignore it
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        document.body.removeChild(iframe);
        return reject(new Error("Failed to create iframe"));
      }

      // Inject style overrides to ensure animations don't interfere with the snapshot
      const htmlWithOverrides = previewHtml.replace(
        '</head>',
        '<style>* { transition: none !important; animation: none !important; transform: none !important; opacity: 1 !important; } .slide-wrap { display: none !important; height: 1080px !important; width: 1920px !important; } .slide-wrap.active { display: flex !important; }</style></head>'
      );

      doc.open();
      doc.write(htmlWithOverrides);
      doc.close();

      setTimeout(async () => {
        try {
          const slideWraps = doc.querySelectorAll('.slide-wrap');
          const images: string[] = [];

          for (let i = 0; i < slideWraps.length; i++) {
            const slide = slideWraps[i] as HTMLElement;

            // Activate only this slide
            slideWraps.forEach(s => {
              (s as HTMLElement).classList.remove('active');
            });
            slide.classList.add('active');

            // Give it a tiny tick to apply styles
            await new Promise(r => setTimeout(r, 50));

            const canvas = await html2canvas(slide, {
              scale: 1, // 1x is 1920x1080, sufficient for standard PPTX/PDF
              useCORS: true,
              logging: false,
              backgroundColor: palette.bg || "#08090f",
            });

            images.push(canvas.toDataURL("image/jpeg", 0.95));
          }

          document.body.removeChild(iframe);
          resolve(images);
        } catch (e) {
          document.body.removeChild(iframe);
          reject(e);
        }
      }, 1500); // Allow fonts and external assets to load
    });
  };

  const handleDownloadPdf = async () => {
    if (!previewHtml) {
      toast.error("Presentation not ready yet");
      return;
    }

    try {
      toast.loading("Capturing slides for PDF...", { id: "pdf" });
      const images = await captureSlidesImages();

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080]
      });

      images.forEach((imgData, index) => {
        if (index > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);
      });

      const fileName = `${projectName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "presentation"}.pdf`;
      pdf.save(fileName);
      toast.success("PDF downloaded successfully", { id: "pdf" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  const handleDownloadPptx = async () => {
    if (!previewHtml) {
      toast.error("Presentation not ready yet");
      return;
    }

    try {
      toast.loading("Capturing slides for PPTX...", { id: "pptx" });
      const images = await captureSlidesImages();

      const pres = new pptxgen();
      pres.layout = "LAYOUT_16x9";

      images.forEach((imgData) => {
        const slide = pres.addSlide();
        slide.addImage({ data: imgData, x: 0, y: 0, w: "100%", h: "100%" });
      });

      const fileName = `${projectName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "presentation"}.pptx`;
      await pres.writeFile({ fileName });
      toast.success("PPTX downloaded successfully", { id: "pptx" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PPTX", { id: "pptx" });
    }
  };

  /** Fullscreen opens clean presentation (no inspector) in a new tab */
  const handleFullscreen = () => {
    if (!previewHtml) {
      toast.error("Presentation not ready yet");
      return;
    }
    const cleanUrl = htmlToBlobUrl(previewHtml);
    window.open(cleanUrl, "_blank");
  };

  const handleRetry = async () => {
    try {
      const response = await fetch("/api/builder/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Retry failed");
      toast.success("Fresh build started!");
      router.push(`/app/builder/studio/${data.newProjectId}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    }
  };

  // ── Element Inspector actions ──
  const sendToIframe = useCallback((message: Record<string, unknown>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, "*");
    }
  }, []);

  const applyStyle = useCallback((property: string, value: string) => {
    if (!selectedElement) return;
    sendToIframe({
      type: "apply-style",
      selector: selectedElement.selector,
      property,
      value,
    });
    const keyMap: Record<string, keyof SelectedElement> = {
      fontSize: "fontSize",
      color: "color",
      backgroundColor: "backgroundColor",
      fontWeight: "fontWeight",
      textAlign: "textAlign",
    };
    const key = keyMap[property] || property;
    setSelectedElement((prev) => prev ? { ...prev, [key]: value } : null);
  }, [selectedElement, sendToIframe]);

  const applyText = useCallback((text: string) => {
    if (!selectedElement) return;
    sendToIframe({
      type: "apply-text",
      selector: selectedElement.selector,
      text,
    });
    setSelectedElement((prev) => prev ? { ...prev, text } : null);
  }, [selectedElement, sendToIframe]);

  const removeElement = useCallback(() => {
    if (!selectedElement) return;
    sendToIframe({
      type: "remove-element",
      selector: selectedElement.selector,
    });
    setSelectedElement(null);
  }, [selectedElement, sendToIframe]);

  const deselectElement = useCallback(() => {
    sendToIframe({ type: "deselect" });
    setSelectedElement(null);
    setEditingField(null);
  }, [sendToIframe]);

  const handleSave = useCallback(() => {
    sendToIframe({ type: 'request-html' });
  }, [sendToIframe]);

  // ── Chat with AI ──
  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatSending) return;

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: msg }]);
    setChatSending(true);
    setStatus("editing");
    setAiActivity("Understanding your request...");

    try {
      const response = await fetch(`/api/builder/chat/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantMsg = "";
      let gotFileUpdate = false;
      let buffer = "";

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setAiActivity("Editing presentation...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "content_chunk" || data.type === "chunk" || data.type === "content") {
                assistantMsg += data.text || data.content || "";
                setChatMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantMsg,
                  };
                  return updated;
                });
              } else if (data.type === "file_content" && data.path === "index.html") {
                setAiActivity("Applying changes...");
                loadPresentation(data.content);
                gotFileUpdate = true;
              } else if (data.type === "status" && data.status === "ready") {
                gotFileUpdate = true;
              } else if (data.type === "system_status" || data.type === "info") {
                if (data.text || data.message) {
                  setAiActivity((data.text || data.message).trim());
                }
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }

      // Always reload from server after AI finishes — ensures we have the latest
      if (gotFileUpdate || assistantMsg) {
        setAiActivity("Refreshing preview...");
        try {
          const filesRes = await fetch(`/api/projects/${projectId}/files`);
          if (filesRes.ok) {
            const filesData = await filesRes.json();
            const files = filesData?.files;
            if (files && files["index.html"]) {
              loadPresentation(files["index.html"]);
            }
          }
        } catch {
          // keep whatever we have
        }
      }
    } catch (err: unknown) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong"}`,
        },
      ]);
    } finally {
      setChatSending(false);
      setStatus("ready");
      setAiActivity(null);
    }
  };

  const progressPercent =
    totalSlides > 0 ? Math.round(((currentSlide + 1) / totalSlides) * 100) : 0;

  const buildingPhaseLabel =
    status === "failed"
      ? "Failed to generate presentation"
      : currentPhase === "building" && currentSlide > 0
        ? `Creating slide ${currentSlide + 1} of ${totalSlides}...`
        : statusMessages.length > 0
          ? statusMessages[statusMessages.length - 1]
          : "Preparing your presentation...";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-t-xl border border-b-0"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: "var(--text-primary)" }}>
            <DigItnLogo size={22} />
          </div>
          <span
            className="font-medium text-sm truncate max-w-[200px]"
            style={{ color: "var(--text-primary)" }}
          >
            {projectName}
          </span>
          {totalSlides > 0 && !isComplete && (
            <span
              className="text-xs px-2 py-0.5 rounded-md font-mono"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Slide {currentSlide + 1} / {totalSlides}
            </span>
          )}
          <span
            className="px-2 py-1 rounded-md text-[10px] uppercase font-semibold tracking-wide"
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
            {status === "building" ? "Creating..." : status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isComplete && (
            <>
              <button
                onClick={() => setShowInspector(!showInspector)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all hover:border-[var(--accent)]"
                style={{
                  color: showInspector ? "var(--accent)" : "var(--text-secondary)",
                  backgroundColor: showInspector ? "var(--accent-subtle)" : "var(--bg-primary)",
                  borderColor: showInspector ? "var(--accent-subtle-border)" : "var(--border)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all hover:border-[var(--accent)]"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
                Present
              </button>
              {showInspector && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all hover:brightness-90"
                  style={{
                    color: "#fff",
                    backgroundColor: "var(--accent)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save Edits
                </button>
              )}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md transition-all hover:opacity-90 outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[160px] rounded-lg p-1 shadow-lg animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 z-50 border"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      onClick={handleDownloadHtml}
                      className="text-sm px-3 py-2 outline-none cursor-pointer rounded-md flex items-center gap-2 transition-colors data-[highlighted]:bg-[var(--bg-secondary)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      HTML (Interactive)
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={handleDownloadPdf}
                      className="text-sm px-3 py-2 outline-none cursor-pointer rounded-md flex items-center gap-2 transition-colors data-[highlighted]:bg-[var(--bg-secondary)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <path d="M9 15v-6h3.5a2 2 0 0 1 0 4h-3.5" />
                      </svg>
                      PDF Document
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onClick={handleDownloadPptx}
                      className="text-sm px-3 py-2 outline-none cursor-pointer rounded-md flex items-center gap-2 transition-colors data-[highlighted]:bg-[var(--bg-secondary)]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      PowerPoint (PPTX)
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          )}
          {status === "failed" && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-md"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex rounded-b-xl border border-t-0 overflow-hidden min-h-0"
        style={{ borderColor: "var(--border)" }}
      >
        {/* ── Left: Element Inspector Panel ── */}
        {isComplete && showInspector && (
          <div
            className="w-[260px] flex-shrink-0 flex flex-col border-r overflow-hidden"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Inspector Header */}
            <div
              className="px-3 py-2.5 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Inspector
              </span>
              {selectedElement && (
                <button
                  onClick={deselectElement}
                  className="text-[10px] px-2 py-0.5 rounded transition-colors hover:bg-[var(--bg-primary)]"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Deselect
                </button>
              )}
            </div>

            {selectedElement ? (
              <div className="flex-1 overflow-y-auto min-h-0">
                {/* Element tag */}
                <div className="px-3 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
                      style={{
                        backgroundColor: "var(--accent-subtle)",
                        color: "var(--accent)",
                      }}
                    >
                      &lt;{selectedElement.tagName}&gt;
                    </span>
                    {selectedElement.id && (
                      <span
                        className="text-[10px] font-mono truncate"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        #{selectedElement.id}
                      </span>
                    )}
                  </div>
                  {selectedElement.text && (
                    <p
                      className="text-[11px] mt-1.5 line-clamp-2 leading-snug"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {selectedElement.text}
                    </p>
                  )}
                </div>

                {/* ── Editable Properties ── */}
                <div className="px-3 py-2.5 space-y-2.5">
                  <p
                    className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Properties
                  </p>

                  {/* Text Content */}
                  {selectedElement.text && (
                    <div>
                      <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Text
                      </label>
                      {editingField === "text" ? (
                        <div className="flex gap-1">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 text-[11px] px-2 py-1.5 rounded border resize-none outline-none focus:border-[var(--accent)]"
                            style={{
                              backgroundColor: "var(--bg-primary)",
                              borderColor: "var(--border)",
                              color: "var(--text-primary)",
                            }}
                            rows={2}
                            autoFocus
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => { applyText(editValue); setEditingField(null); }}
                              className="text-[10px] px-1.5 py-1 rounded"
                              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setEditingField(null)}
                              className="text-[10px] px-1.5 py-1 rounded border"
                              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingField("text"); setEditValue(selectedElement.text); }}
                          className="w-full text-left text-[11px] px-2 py-1.5 rounded border transition-colors hover:border-[var(--accent)]"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <span className="line-clamp-2">{selectedElement.text}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Font Size */}
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Size
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const current = parseInt(selectedElement.fontSize) || 16;
                          applyStyle("fontSize", `${Math.max(8, current - 2)}px`);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded border text-sm font-bold transition-colors hover:border-[var(--accent)]"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        -
                      </button>
                      <span
                        className="text-[11px] font-mono flex-1 text-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedElement.fontSize}
                      </span>
                      <button
                        onClick={() => {
                          const current = parseInt(selectedElement.fontSize) || 16;
                          applyStyle("fontSize", `${current + 2}px`);
                        }}
                        className="w-10 h-10 flex items-center justify-center rounded border text-sm font-bold transition-colors hover:border-[var(--accent)]"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Colors Row */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Color
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={rgbToHex(selectedElement.color)}
                          onChange={(e) => applyStyle("color", e.target.value)}
                          className="w-6 h-6 rounded border cursor-pointer p-0"
                          style={{ borderColor: "var(--border)" }}
                        />
                        <span className="text-[9px] font-mono truncate" style={{ color: "var(--text-tertiary)" }}>
                          {rgbToHex(selectedElement.color)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Background
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={rgbToHex(selectedElement.backgroundColor)}
                          onChange={(e) => applyStyle("backgroundColor", e.target.value)}
                          className="w-6 h-6 rounded border cursor-pointer p-0"
                          style={{ borderColor: "var(--border)" }}
                        />
                        <span className="text-[9px] font-mono truncate" style={{ color: "var(--text-tertiary)" }}>
                          {rgbToHex(selectedElement.backgroundColor)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Weight
                    </label>
                    <div className="flex gap-0.5">
                      {["300", "400", "600", "700", "900"].map((w) => (
                        <button
                          key={w}
                          onClick={() => applyStyle("fontWeight", w)}
                          className="flex-1 text-[9px] py-1 rounded transition-colors"
                          style={{
                            backgroundColor: selectedElement.fontWeight === w ? "var(--accent)" : "var(--bg-primary)",
                            color: selectedElement.fontWeight === w ? "#fff" : "var(--text-secondary)",
                            fontWeight: w,
                          }}
                        >
                          {w === "300" ? "Lt" : w === "400" ? "Rg" : w === "600" ? "Md" : w === "700" ? "Bd" : "Bk"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Align */}
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-tertiary)" }}>
                      Align
                    </label>
                    <div className="flex gap-0.5">
                      {[
                        { value: "left", icon: "M3 6h18M3 12h12M3 18h16" },
                        { value: "center", icon: "M3 6h18M6 12h12M4 18h16" },
                        { value: "right", icon: "M3 6h18M9 12h12M5 18h16" },
                      ].map(({ value, icon }) => (
                        <button
                          key={value}
                          onClick={() => applyStyle("textAlign", value)}
                          className="flex-1 flex items-center justify-center py-1 rounded transition-colors"
                          style={{
                            backgroundColor: selectedElement.textAlign === value ? "var(--accent)" : "var(--bg-primary)",
                            color: selectedElement.textAlign === value ? "#fff" : "var(--text-secondary)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d={icon} />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Remove Element */}
                <div className="px-3 py-2.5 border-t mt-auto flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={removeElement}
                    className="w-full text-[11px] py-1.5 rounded border transition-colors hover:bg-[var(--status-failed-bg)]"
                    style={{
                      borderColor: "var(--status-failed)",
                      color: "var(--status-failed)",
                      backgroundColor: "transparent",
                    }}
                  >
                    Remove Element
                  </button>
                </div>
              </div>
            ) : (
              /* No element selected */
              <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-subtle)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                </div>
                <p
                  className="text-[11px] text-center leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Click any element in the presentation to edit it
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Center: Slide Preview ── */}
        <div
          className="flex-1 relative overflow-hidden min-w-0"
          style={{ backgroundColor: palette.bg || "#08090f" }}
        >
          {isComplete && previewBlobUrl ? (
            <div className="relative w-full h-full">
              <iframe
                ref={iframeRef}
                src={previewBlobUrl}
                className="w-full h-full border-0"
                style={{
                  filter: chatSending ? "blur(16px) saturate(0.7)" : "none",
                  transition: "filter 0.6s ease",
                  transform: chatSending ? "scale(1.05)" : "none",
                }}
                title="Presentation Preview"
              />
              {chatSending && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pointer-events-none">
                    <div className="relative" style={{ width: 120, height: 120 }}>
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${palette.accent1 || "#d97757"}22 0%, transparent 70%)`,
                          transform: "scale(1.5)",
                        }}
                      />
                      <svg width="120" height="120" viewBox="0 0 120 120" className="absolute inset-0">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      </svg>
                      <svg
                        width="120" height="120" viewBox="0 0 120 120"
                        className="absolute inset-0"
                        style={{ animation: "spin 4s linear infinite" }}
                      >
                        <defs>
                          <linearGradient id="edit-progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={palette.accent1 || "#d97757"} stopOpacity="1" />
                            <stop offset="100%" stopColor={palette.accent1 || "#d97757"} stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        <circle cx="60" cy="60" r="52" fill="none" stroke="url(#edit-progress-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="326" strokeDashoffset="100" />
                      </svg>
                      <svg
                        width="120" height="120" viewBox="0 0 120 120"
                        className="absolute inset-0"
                        style={{ animation: "spin 6s linear infinite reverse" }}
                      >
                        <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="200" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                          <span style={{ color: palette.accent1 || "#d97757" }}>/</span>
                          <span style={{ color: "rgba(255,255,255,0.95)" }}>D</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
                        {aiActivity || "Editing presentation..."}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: palette.accent1 || "#d97757",
                            animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : slideBlobUrl ? (
            /* ── Building: blurred slide preview with /D logo overlay ── */
            <div className="relative w-full h-full">
              <iframe
                src={slideBlobUrl}
                className="w-full h-full border-0"
                style={{
                  filter: slideBlurred ? "blur(16px) saturate(0.7)" : "none",
                  transition: "filter 0.6s ease, transform 0.6s ease",
                  transform: slideBlurred ? "scale(1.05)" : "scale(1)",
                }}
                title="Slide Preview"
              />
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ 
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  opacity: slideBlurred ? 1 : 0,
                  pointerEvents: "none"
                }}
              />
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 pointer-events-none transition-opacity duration-500"
                style={{ opacity: slideBlurred ? 1 : 0 }}
              >
                <div className="relative" style={{ width: 120, height: 120 }}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${palette.accent1 || "#d97757"}22 0%, transparent 70%)`,
                      transform: "scale(1.5)",
                    }}
                  />
                  <svg width="120" height="120" viewBox="0 0 120 120" className="absolute inset-0">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  </svg>
                  <svg
                    width="120" height="120" viewBox="0 0 120 120"
                    className="absolute inset-0"
                    style={{ animation: "spin 4s linear infinite" }}
                  >
                    <defs>
                      <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={palette.accent1 || "#d97757"} stopOpacity="1" />
                        <stop offset="100%" stopColor={palette.accent1 || "#d97757"} stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#progress-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="326" strokeDashoffset="200" />
                  </svg>
                  <svg
                    width="120" height="120" viewBox="0 0 120 120"
                    className="absolute inset-0"
                    style={{ animation: "spin 6s linear infinite reverse" }}
                  >
                    <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="200" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                      <span style={{ color: palette.accent1 || "#d97757" }}>/</span>
                      <span style={{ color: "rgba(255,255,255,0.95)" }}>D</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {buildingPhaseLabel}
                  </span>
                  {totalSlides > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progressPercent}%`, backgroundColor: palette.accent1 || "#d97757" }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {progressPercent}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: palette.accent1 || "#d97757",
                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Waiting state ── */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: "#08090f" }}>
              {/* Fake blurred background to look like the edit/building mode */}
              <div 
                className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full" 
                style={{ filter: "blur(80px)", background: "radial-gradient(circle, rgba(217,119,87,0.15) 0%, transparent 70%)" }} 
              />
              <div 
                className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full" 
                style={{ filter: "blur(80px)", background: "radial-gradient(circle, rgba(217,119,87,0.1) 0%, transparent 70%)" }} 
              />
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
              />
              <div className="relative z-10" style={{ width: 120, height: 120 }}>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${palette.accent1 || "#d97757"}22 0%, transparent 70%)`,
                    transform: "scale(1.5)",
                  }}
                />
                <svg width="120" height="120" viewBox="0 0 120 120" className="absolute inset-0">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                </svg>
                <svg
                  width="120" height="120" viewBox="0 0 120 120"
                  className="absolute inset-0"
                  style={{ animation: "spin 4s linear infinite" }}
                >
                  <defs>
                    <linearGradient id="wait-progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={palette.accent1 || "#d97757"} stopOpacity="1" />
                      <stop offset="100%" stopColor={palette.accent1 || "#d97757"} stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#wait-progress-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="326" strokeDashoffset="100" />
                </svg>
                <svg
                  width="120" height="120" viewBox="0 0 120 120"
                  className="absolute inset-0"
                  style={{ animation: "spin 6s linear infinite reverse" }}
                >
                  <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="200" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    <span style={{ color: palette.accent1 || "#d97757" }}>/</span>
                    <span style={{ color: "rgba(255,255,255,0.95)" }}>D</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 z-10">
                <span className="text-sm font-medium tracking-wide" style={{ color: status === "failed" ? "var(--status-failed)" : "rgba(255,255,255,0.9)" }}>
                  {status === "failed"
                    ? "Failed to generate presentation"
                    : currentPhase === "planning"
                      ? "Planning presentation structure..."
                      : currentPhase === "building" && totalSlides > 0
                        ? `Creating slide ${currentSlide + 1} of ${totalSlides}...`
                        : "Preparing your presentation..."}
                </span>
              </div>
              <div className="flex gap-1.5 z-10">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: palette.accent1 || "#d97757",
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        {/* During build: status panel. When complete: AI chat panel */}
        {!isComplete ? (
          /* Build Status Panel */
          <div
            className="w-[300px] flex-shrink-0 flex flex-col border-l overflow-hidden"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                {["planning", "building", "reviewing"].map((phase) => (
                  <div key={phase} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          currentPhase === phase
                            ? "var(--accent)"
                            : currentPhase &&
                                ["planning", "building", "reviewing"].indexOf(phase) <
                                ["planning", "building", "reviewing"].indexOf(currentPhase)
                              ? "var(--status-ready)"
                              : "var(--border)",
                      }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-wider font-medium"
                      style={{ color: currentPhase === phase ? "var(--accent)" : "var(--text-tertiary)" }}
                    >
                      {phase}
                    </span>
                    {phase !== "reviewing" && (
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>&rarr;</span>
                    )}
                  </div>
                ))}
              </div>
              {totalSlides > 0 && (
                <div className="w-full">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: "var(--text-tertiary)" }}>Progress</span>
                    <span style={{ color: "var(--accent)" }}>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%`, backgroundColor: "var(--accent)" }} />
                  </div>
                </div>
              )}
            </div>
            {planContent && (
              <button
                onClick={() => setShowPlan(!showPlan)}
                className="px-4 py-2 text-xs text-left border-b transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                {showPlan ? "\u25BE Hide Plan" : "\u25B8 View Slide Plan"}
              </button>
            )}
            {showPlan && planContent && (
              <div
                className="px-4 py-3 text-xs border-b overflow-y-auto max-h-[200px] whitespace-pre-wrap font-mono"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", lineHeight: 1.6 }}
              >
                {planContent}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              {statusMessages.map((msg, i) => (
                <div key={i} className="text-xs flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: i === statusMessages.length - 1 ? "var(--accent)" : "var(--text-tertiary)" }}
                  />
                  <span style={{ lineHeight: 1.5 }}>{msg}</span>
                </div>
              ))}
            </div>
            {palette.accent1 && (
              <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Color Palette
                  </p>
                  <button
                    onClick={handleSuggestPalettes}
                    className="text-[10px] font-medium px-2 py-0.5 rounded border transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Suggest
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {[palette.bg, palette.accent1, palette.accent2, palette.accent3, palette.text].filter(Boolean).map((color, i) => (
                    <div key={i} className="w-6 h-6 rounded-md border" style={{ backgroundColor: color, borderColor: "var(--border)" }} title={color} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── AI Chat Panel (right side, when complete) ── */
          <div
            className="w-[320px] flex-shrink-0 flex flex-col border-l overflow-hidden"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Chat Header */}
            <div
              className="px-4 py-2.5 border-b flex items-center justify-between flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ lineHeight: 1 }}>
                  <span style={{ color: "var(--accent)" }}>/</span>
                  <span style={{ color: "var(--text-primary)" }}>D</span>
                </span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  AI Editor
                </span>
              </div>
              {aiActivity && (
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: "var(--accent)",
                          animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--accent)" }}>
                    {aiActivity}
                  </span>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0"
            >
              {chatMessages.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--accent-subtle)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-[11px] text-center leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    Tell DIGITN AI what to change in your presentation
                  </p>
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    {[
                      "Change the title font to something bolder",
                      "Make the color scheme more professional",
                      "Add a summary slide at the end",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => { setChatInput(suggestion); }}
                        className="w-full text-left text-[10px] px-3 py-2 rounded-lg border transition-colors hover:border-[var(--accent)]"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                          backgroundColor: "var(--bg-primary)",
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    {msg.role === "assistant" ? (
                      <span className="flex-shrink-0 mt-0.5 text-xs font-bold" style={{ lineHeight: 1 }}>
                        <span style={{ color: "var(--accent)" }}>/</span>
                        <span style={{ color: "var(--text-primary)" }}>D</span>
                      </span>
                    ) : (
                      <span
                        className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold"
                        style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      >
                        U
                      </span>
                    )}
                    <p
                      className="text-[11px] leading-relaxed flex-1 min-w-0"
                      style={{
                        color: msg.role === "assistant" ? "var(--text-primary)" : "var(--text-secondary)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content ? (
                        msg.content
                      ) : chatSending ? (
                        <span className="inline-flex gap-1 items-center">
                          {[0, 1, 2].map((j) => (
                            <span
                              key={j}
                              className="w-1 h-1 rounded-full inline-block"
                              style={{
                                backgroundColor: "var(--text-tertiary)",
                                animation: `pulse 1.4s ease-in-out ${j * 0.2}s infinite`,
                              }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span style={{ fontStyle: "italic", opacity: 0.7 }}>No changes were made.</span>
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div
              className="px-3 py-3 border-t flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center rounded-lg border overflow-hidden transition-colors focus-within:border-[var(--accent)]"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  placeholder={chatSending ? "AI is editing..." : "Ask AI to edit..."}
                  disabled={chatSending}
                  className="flex-1 px-3 py-2 text-[11px] bg-transparent outline-none placeholder:text-[var(--text-tertiary)]"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatSending}
                  className="px-2.5 py-2 transition-colors flex-shrink-0 disabled:opacity-30"
                  style={{ color: "var(--accent)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Color Palette (Under Chat) */}
            {palette.accent1 && (
              <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-primary)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Color Palette
                  </p>
                  <button
                    onClick={handleSuggestPalettes}
                    className="text-[10px] font-medium px-2 py-0.5 rounded border transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    Suggest
                  </button>
                </div>
                <div className="flex gap-1.5">
                  {[palette.bg, palette.accent1, palette.accent2, palette.accent3, palette.text].filter(Boolean).map((color, i) => (
                    <div key={i} className="w-6 h-6 rounded-md border" style={{ backgroundColor: color, borderColor: "var(--border)" }} title={color} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Palette Suggestion Modal */}
      {showPaletteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-2xl border flex flex-col gap-4 relative"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif" style={{ color: "var(--text-primary)" }}>Alternative Palettes</h3>
              <button
                onClick={() => setShowPaletteModal(false)}
                className="p-1 rounded-md hover:bg-[var(--bg-secondary)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                ✕
              </button>
            </div>

            {isSuggestingPalettes ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>DIGITN AI is analyzing your topic...</p>
              </div>
            ) : paletteError ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <p className="text-sm" style={{ color: "var(--status-failed, #ef4444)" }}>{paletteError}</p>
                <button
                  onClick={handleSuggestPalettes}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                >
                  Try Again
                </button>
              </div>
            ) : suggestedPalettes ? (
              <div className="flex flex-col gap-3">
                {suggestedPalettes.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPalette(p)}
                    className="flex flex-col gap-2 p-3 rounded-lg border text-left transition-all hover:-translate-y-0.5 cursor-pointer"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border)" }}
                  >
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name || `Option ${i + 1}`}</span>
                    <div className="flex gap-2">
                      {[p.bg, p.accent1, p.accent2, p.accent3, p.text].filter(Boolean).map((color, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-md border shadow-sm" style={{ backgroundColor: color, borderColor: "rgba(0,0,0,0.1)" }} title={color} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Helper: convert rgb(r, g, b) to hex for color inputs ──
function rgbToHex(rgb: string): string {
  if (rgb.startsWith("#")) return rgb;
  const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return "#000000";
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}
