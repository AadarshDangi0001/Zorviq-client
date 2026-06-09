"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { authStore } from "@/lib/api";
import { useUpdateProject } from "@/react-query-config/mutations/use-project-mutations";
import { useProject } from "@/react-query-config/queries/use-project-queries";
import { generationService } from "@/services/generation.service";
import Loader from "@/components/Loader";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
}

type ViewMode = "preview" | "code";

const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const defaultCode = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101014; color: white; font-family: Inter, system-ui, sans-serif; }
      main { max-width: 720px; padding: 48px; text-align: center; }
      h1 { font-size: clamp(32px, 7vw, 72px); margin: 0 0 16px; }
      p { color: #b8b8c7; font-size: 18px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main data-section-id="main">
      <h1>Your preview is ready</h1>
      <p>Generate or edit this project and Zorviq will render the latest code here.</p>
    </main>
  </body>
</html>`;

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }}>
          <Loader />
        </div>
      }
    >
      <ChatRoute />
    </Suspense>
  );
}

function ChatRoute() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("id");

  return <ChatContent key={queryProjectId ?? "missing-project"} queryProjectId={queryProjectId} />;
}

function ChatContent({ queryProjectId }: { queryProjectId: string | null }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<EventSource | null>(null);
  const {
    data: project,
    isError: isProjectError,
    isLoading: isProjectLoading,
  } = useProject(queryProjectId);
  const updateProject = useUpdateProject();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [workingStatus, setWorkingStatus] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [activeSectionEdit, setActiveSectionEdit] = useState<{
    sectionId: string;
    originalCode: string;
  } | null>(null);
  const [streamingSectionCode, setStreamingSectionCode] = useState("");
  const activeSectionEditRef = useRef<{ sectionId: string; originalCode: string } | null>(null);

  const applySectionEditClient = (currentCode: string, sectionId: string, newSectionHtml: string): string => {
    if (!currentCode) return newSectionHtml;
    const escapedId = sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const openTagPattern = new RegExp(
      `<([a-zA-Z][a-zA-Z0-9]*)([^>]*data-section-id=["']${escapedId}["'][^>]*)>`,
      's'
    );

    const match = openTagPattern.exec(currentCode);
    if (!match) {
      return currentCode;
    }

    const tagName = match[1];
    const startIndex = match.index;

    let depth = 0;
    let i = startIndex;
    const openPattern = new RegExp(`<${tagName}(\\s|>)`, 'gi');
    const closePattern = new RegExp(`</${tagName}>`, 'gi');

    openPattern.lastIndex = startIndex;
    closePattern.lastIndex = startIndex;

    let endIndex = -1;

    while (i < currentCode.length) {
      const nextOpen = openPattern.exec(currentCode);
      const nextClose = closePattern.exec(currentCode);

      if (!nextClose) break;

      if (nextOpen && nextOpen.index < nextClose.index) {
        depth++;
        i = nextOpen.index + 1;
        openPattern.lastIndex = i;
        closePattern.lastIndex = i;
      } else {
        if (depth === 1) {
          endIndex = nextClose.index + `</${tagName}>`.length;
          break;
        }
        depth--;
        i = nextClose.index + 1;
        openPattern.lastIndex = i;
        closePattern.lastIndex = i;
      }
    }

    if (endIndex === -1) {
      return currentCode;
    }

    return currentCode.slice(0, startIndex) + newSectionHtml + currentCode.slice(endIndex);
  };

  const projectId = project?._id;
  const storedCode = project?.currentCode ?? "";

  const activeCode = useMemo(() => {
    if (activeSectionEdit && streamingSectionCode) {
      return applySectionEditClient(
        activeSectionEdit.originalCode,
        activeSectionEdit.sectionId,
        streamingSectionCode
      );
    }
    return generatedCode || storedCode;
  }, [activeSectionEdit, streamingSectionCode, generatedCode, storedCode]);

  const hasCopiedActiveCode = Boolean(activeCode) && copiedCode === activeCode;
  const previewHtml = useMemo(() => {
    const base = activeCode || defaultCode;
    const script = `
    <script>
      (function() {
        let inspectActive = false;
        let inspectHoveredEl = null;

        window.addEventListener('message', (e) => {
          if (e.data?.type === 'SET_INSPECT_ACTIVE') {
            inspectActive = e.data.active;
            if (!inspectActive && inspectHoveredEl) {
              inspectHoveredEl.style.outline = "";
              inspectHoveredEl.style.outlineOffset = "";
              inspectHoveredEl.style.cursor = "";
              inspectHoveredEl = null;
            }
          }
        });

        document.addEventListener('mouseover', (e) => {
          if (inspectActive) {
            const section = e.target.closest("[data-section-id]");
            if (section) {
              if (inspectHoveredEl && inspectHoveredEl !== section) {
                inspectHoveredEl.style.outline = "";
                inspectHoveredEl.style.outlineOffset = "";
                inspectHoveredEl.style.cursor = "";
              }
              inspectHoveredEl = section;
              section.style.outline = "2px dashed #A78BFA";
              section.style.outlineOffset = "-2px";
              section.style.cursor = "pointer";
            }
          }
        }, true);

        document.addEventListener('mouseout', (e) => {
          if (inspectActive) {
            const section = e.target.closest("[data-section-id]");
            if (section && section === inspectHoveredEl) {
              section.style.outline = "";
              section.style.outlineOffset = "";
              section.style.cursor = "";
              inspectHoveredEl = null;
            }
          }
        }, true);

        document.addEventListener('click', (e) => {
          if (inspectActive) {
            e.preventDefault();
            e.stopPropagation();
            const section = e.target.closest("[data-section-id]");
            if (section) {
              section.style.outline = "";
              section.style.outlineOffset = "";
              section.style.cursor = "";
              inspectHoveredEl = null;
              const payload = {
                type: "SECTION_SELECTED",
                id: section.getAttribute("data-section-id"),
                html: section.outerHTML,
                tagName: section.tagName.toLowerCase()
              };
              if (typeof window.zorviqSelectSection === "function") {
                window.zorviqSelectSection(payload);
              } else {
                window.parent.postMessage(payload, "*");
              }
            }
          } else {
            const anchor = e.target.closest('a');
            if (anchor && anchor.href) e.preventDefault();
            const btn = e.target.closest('button');
            if (btn) e.preventDefault();
          }
        }, true);
        
        document.addEventListener('submit', (e) => {
          e.preventDefault();
        }, true);
      })();
    </script>
    `;

    const bodyIndex = base.toLowerCase().lastIndexOf("</body>");
    if (bodyIndex !== -1) {
      return base.slice(0, bodyIndex) + script + base.slice(bodyIndex);
    }
    const htmlIndex = base.toLowerCase().lastIndexOf("</html>");
    if (htmlIndex !== -1) {
      return base.slice(0, htmlIndex) + script + base.slice(htmlIndex);
    }
    return base + script;
  }, [activeCode]);

  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current || !containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const halfWidth = Math.abs(e.clientX - centerX);
    const newWidth = Math.min(rect.width - 48, Math.max(320, halfWidth * 2));
    setPreviewWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const [inspectActive, setInspectActive] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{
    id: string;
    html: string;
    tagName: string;
  } | null>(null);
  const [sectionPrompt, setSectionPrompt] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        (iframe.contentWindow as any).zorviqSelectSection = (data: any) => {
          setSelectedSection({
            id: data.id,
            html: data.html,
            tagName: data.tagName,
          });
          setInspectActive(false);
        };
      } catch (err) {
        console.warn("Could not set direct callback on iframe window", err);
      }
      iframe.contentWindow.postMessage({ type: "SET_INSPECT_ACTIVE", active: inspectActive }, "*");
    }
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (data && data.type === "SECTION_SELECTED") {
        setSelectedSection({
          id: data.id,
          html: data.html,
          tagName: data.tagName,
        });
        setInspectActive(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        (iframe.contentWindow as any).zorviqSelectSection = (data: any) => {
          setSelectedSection({
            id: data.id,
            html: data.html,
            tagName: data.tagName,
          });
          setInspectActive(false);
        };
      } catch (err) {
        console.warn("Could not set direct callback on iframe window in useEffect", err);
      }
      iframe.contentWindow.postMessage({ type: "SET_INSPECT_ACTIVE", active: inspectActive }, "*");
    }
  }, [inspectActive]);
  const visibleMessages = useMemo<Message[]>(() => {
    if (messages.length > 0) return messages;
    if (!project) return [];

    return [
      {
        id: "project-loaded",
        role: "assistant",
        content: storedCode
          ? "Loaded the latest generated code for this project."
          : "Project is ready. Send a prompt to generate the first version.",
        time: now(),
      },
    ];
  }, [messages, project, storedCode]);

  useEffect(() => {
    return () => {
      streamRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (queryProjectId) return;
    router.replace("/dashboard");
  }, [queryProjectId, router]);

  useEffect(() => {
    if (!isProjectError) return;
    authStore.clear();
    router.replace("/login");
  }, [isProjectError, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, isWorking]);

  const finishGeneration = async (code: string, jobId: string) => {
    let finalCode = code;

    if (!finalCode.trim()) {
      const status = await generationService.status(jobId);
      finalCode = status.output ?? "";
    }

    if (finalCode.trim()) {
      setGeneratedCode(finalCode);
      if (projectId) {
        await updateProject.mutateAsync({
          id: projectId,
          payload: { currentCode: finalCode },
        });
      }
    }

    activeSectionEditRef.current = null;
    setActiveSectionEdit(null);
    setStreamingSectionCode("");

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: finalCode.trim()
          ? "Generated the project. Use Watch Preview to inspect it or Watch Code to review the source."
          : "Generation finished, but no code was returned. Try another prompt.",
        time: now(),
      },
    ]);
    setIsWorking(false);
    setWorkingStatus("");
    setViewMode(finalCode.trim() ? "preview" : "code");
  };

  const streamGeneration = (jobId: string) => {
    let output = "";
    const source = new EventSource(generationService.streamUrl(jobId), {
      withCredentials: true,
    });
    streamRef.current = source;

    source.onmessage = async (event) => {
      const payload = JSON.parse(event.data) as {
        type: "token" | "done" | "error";
        data?: string;
        code?: string;
        message?: string;
      };

      if (payload.type === "token" && payload.data) {
        output += payload.data;
        if (activeSectionEditRef.current) {
          setStreamingSectionCode(output);
        } else {
          setGeneratedCode(output);
        }
        setWorkingStatus("Streaming generated code");
      }

      if (payload.type === "done") {
        source.close();
        await finishGeneration(payload.code ?? output, jobId);
      }

      if (payload.type === "error") {
        source.close();
        setError(payload.message ?? "Generation failed");
        setIsWorking(false);
        setWorkingStatus("");
        activeSectionEditRef.current = null;
        setActiveSectionEdit(null);
        setStreamingSectionCode("");
      }
    };

    source.onerror = async () => {
      source.close();
      try {
        setWorkingStatus("Checking generation status");
        const status = await generationService.status(jobId);
        if (status.status === "done") {
          await finishGeneration(status.output ?? output, jobId);
          return;
        }
        throw new Error("The generation stream disconnected before completion");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setIsWorking(false);
        setWorkingStatus("");
        activeSectionEditRef.current = null;
        setActiveSectionEdit(null);
        setStreamingSectionCode("");
      }
    };
  };

  const handleSend = async (text?: string) => {
    const rawInput = (text ?? input).trim();
    if (!rawInput || isWorking || !projectId) return;

    let displayContent = rawInput;
    let backendPrompt = rawInput;
    let opts = {};

    setInput("");
    setError("");

    activeSectionEditRef.current = null;
    setActiveSectionEdit(null);
    setStreamingSectionCode("");

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content: displayContent, time: now() },
    ]);
    setIsWorking(true);
    setWorkingStatus("Queueing generation");

    try {
      const result = await generationService.enqueue(projectId, backendPrompt, opts);
      if (result.status === "done" && result.code) {
        await finishGeneration(result.code, result.jobId);
        return;
      }

      setWorkingStatus(
        result.estimatedWaitSeconds
          ? `Queued. Estimated wait ${result.estimatedWaitSeconds}s`
          : "Queued. Waiting for generated code",
      );
      streamGeneration(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setIsWorking(false);
      setWorkingStatus("");
    }
  };

  const handleSendSectionEdit = async () => {
    if (!selectedSection || !sectionPrompt.trim() || isWorking || !projectId) return;
    const promptText = sectionPrompt.trim();
    const secId = selectedSection.id;
    const secHtml = selectedSection.html;

    setSelectedSection(null);
    setSectionPrompt("");
    setError("");

    const editCtx = { sectionId: secId, originalCode: activeCode };
    activeSectionEditRef.current = editCtx;
    setActiveSectionEdit(editCtx);
    setStreamingSectionCode("");

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: `[Section Edit: ${secId}] ${promptText}`,
        time: now(),
      },
    ]);
    setIsWorking(true);
    setWorkingStatus("Queueing section edit");

    try {
      const result = await generationService.enqueue(
        projectId,
        promptText,
        {
          isSectionEdit: true,
          sectionId: secId,
          sectionHtml: secHtml
        }
      );
      if (result.status === "done" && result.code) {
        await finishGeneration(result.code, result.jobId);
        return;
      }

      setWorkingStatus(
        result.estimatedWaitSeconds
          ? `Queued section edit. Estimated wait ${result.estimatedWaitSeconds}s`
          : "Queued section edit. Waiting for code",
      );
      streamGeneration(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Section edit failed");
      setIsWorking(false);
      setWorkingStatus("");
      activeSectionEditRef.current = null;
      setActiveSectionEdit(null);
      setStreamingSectionCode("");
    }
  };

  useEffect(() => {
    const initialPrompt = sessionStorage.getItem("initialPrompt");
    if (initialPrompt && projectId) {
      sessionStorage.removeItem("initialPrompt");
      window.setTimeout(() => {
        void handleSend(initialPrompt);
      }, 0);
    }
    // The initial dashboard prompt should run once when the project becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const stopGeneration = () => {
    streamRef.current?.close();
    setIsWorking(false);
    setWorkingStatus("");
  };

  const downloadCode = () => {
    const blob = new Blob([activeCode || previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project?.name ?? "zorviq-project"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    if (!activeCode.trim()) return;

    try {
      await navigator.clipboard.writeText(activeCode);
      setCopiedCode(activeCode);
      setError("");
    } catch {
      setError("Could not copy the code. Please try again.");
    }
  };

  if (isProjectLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="chat-root">
      <div className="chat-panel">
        <header className="chat-header">
          <div className="chat-header-left">
            <span className="chat-header-title">{project?.name ?? "Loading project..."}</span>
          </div>
          <button className="back-btn" onClick={() => router.push("/dashboard")}>Dashboard</button>
        </header>

        <div className="messages-area">
          {visibleMessages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              {msg.role === "assistant" && <div className="msg-avatar assistant-avatar">Z</div>}
              <div className="msg-bubble">
                <pre className="msg-content">{msg.content}</pre>
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isWorking && (
            <div className="message assistant">
              <div className="msg-avatar assistant-avatar">Z</div>
              <div className="working-bubble">
                <div className="working-header"><span className="working-dot" /> <span>Working...</span></div>
                <p className="working-status">{workingStatus}</p>
              </div>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-card">
            <textarea
              className="chat-input"
              placeholder="Generate or edit this website..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <div className="input-actions">
              <div className="input-left">
                <button className="visual-btn" onClick={() => setInput("Improve the visual design and spacing")}>Visual edits</button>
              </div>
              <div className="input-right">
                <span className="build-badge">Build</span>
                <button
                  className={`send-btn ${isWorking ? "stop" : ""}`}
                  aria-label={isWorking ? "Stop generation" : "Send prompt"}
                  title={isWorking ? "Stop generation" : "Send prompt"}
                  onClick={() => isWorking ? stopGeneration() : handleSend()}
                >
                  {isWorking ? "■" : "↑"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="preview-panel">
        <header className="preview-header">
          <div className="preview-tabs">
            <button className={`header-btn ${viewMode === "preview" ? "active" : ""}`} onClick={() => setViewMode("preview")}>Watch Preview</button>
            <button className={`header-btn ${viewMode === "code" ? "active" : ""}`} onClick={() => setViewMode("code")}>Watch Code</button>
            {viewMode === "preview" && (
              <button
                className={`header-btn edit-mode-btn ${inspectActive ? "active" : ""}`}
                onClick={() => setInspectActive(!inspectActive)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  borderColor: inspectActive ? "rgba(167, 139, 250, 0.6)" : "",
                  background: inspectActive ? "rgba(124, 58, 237, 0.2)" : "",
                }}
              >
                <span className={`inspect-dot ${inspectActive ? "active" : ""}`} />
                {inspectActive ? "Inspecting" : "Edit Section"}
              </button>
            )}
          </div>
          
          <div className="responsive-presets">
            <button 
              className={`preset-btn ${!previewWidth ? "active" : ""}`} 
              onClick={() => setPreviewWidth(null)}
              title="Full width (Desktop)"
            >
              Desktop
            </button>
            <button 
              className={`preset-btn ${previewWidth === 768 ? "active" : ""}`} 
              onClick={() => setPreviewWidth(768)}
              title="Tablet width (768px)"
            >
              Tablet
            </button>
            <button 
              className={`preset-btn ${previewWidth === 375 ? "active" : ""}`} 
              onClick={() => setPreviewWidth(375)}
              title="Mobile width (375px)"
            >
              Mobile
            </button>
          </div>

          <div className="chat-header-right">
            <button className="header-btn publish" onClick={downloadCode}>Download HTML</button>
          </div>
        </header>
        <div className="preview-content">
          <div
            ref={containerRef}
            className={`resizable-container ${isResizing ? "resizing" : ""}`}
            style={{ width: previewWidth ? `${previewWidth}px` : "100%" }}
          >
            {/* Symmetrical Left-Right Drag Handles */}
            <div 
              className={`resize-handle left ${isResizing ? "active" : ""}`} 
              onMouseDown={handleMouseDown}
              title="Drag to resize"
            />
            <div 
              className={`resize-handle right ${isResizing ? "active" : ""}`} 
              onMouseDown={handleMouseDown}
              title="Drag to resize"
            />

            {viewMode === "preview" ? (
              <iframe
                ref={iframeRef}
                onLoad={handleIframeLoad}
                title="Generated project preview"
                className="preview-frame"
                srcDoc={previewHtml}
                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts allow-same-origin"
                style={{ pointerEvents: isResizing ? "none" : "auto" }}
              />
            ) : (
              <div className="code-shell">
                <button
                  className="copy-code-btn"
                  type="button"
                  onClick={copyCode}
                  disabled={!activeCode.trim()}
                  aria-label="Copy current code"
                  title="Copy current code"
                >
                  {hasCopiedActiveCode ? <Check size={14} /> : <Copy size={14} />}
                  {hasCopiedActiveCode ? "Copied" : "Copy"}
                </button>
                <pre className="code-view">{activeCode || "Generated code will appear here."}</pre>
              </div>
            )}
          </div>
        </div>

        {selectedSection && (
          <div className="section-prompt-backdrop">
            <div className="section-prompt-card">
              <div className="card-header">
                <h3>Edit Section: <code className="section-badge">{selectedSection.id}</code></h3>
                <button 
                  className="close-btn" 
                  onClick={() => {
                    setSelectedSection(null);
                    setSectionPrompt("");
                  }}
                >
                  ✕
                </button>
              </div>
              
              <p className="card-desc">
                Describe the changes you want to apply specifically to this <code>&lt;{selectedSection.tagName}&gt;</code> section. Zorviq will modify only this part of the page.
              </p>

              <textarea
                className="prompt-textarea"
                placeholder="e.g., Change button background to purple, update text to 'Join Free'..."
                value={sectionPrompt}
                onChange={(e) => setSectionPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendSectionEdit();
                  }
                }}
                rows={3}
                autoFocus
              />

              <div className="card-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setSelectedSection(null);
                    setSectionPrompt("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="primary-btn" 
                  disabled={!sectionPrompt.trim() || isWorking}
                  onClick={handleSendSectionEdit}
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  Generate Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chat-root {
          display: flex;
          height: 100vh;
          background:
            radial-gradient(ellipse 60% 40% at 16% 0%, rgba(124,58,237,0.11), transparent 70%),
            #060608;
          color: #f4f4f5;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }
        .chat-panel {
          width: 440px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.14);
          background: rgba(10,10,14,0.98);
          flex-shrink: 0;
        }
        .chat-header, .preview-header {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.14);
          background: rgba(16,16,20,0.98);
        }
        .chat-header-title {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 260px;
          display: block;
        }
        .back-btn {
          min-height: 36px;
          font-size: 13px;
          color: #f4f4f5;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          cursor: pointer;
          padding: 8px 12px;
          white-space: nowrap;
          font-weight: 700;
        }
        .back-btn:hover { color: #fff; background: rgba(124,58,237,0.18); border-color: rgba(167,139,250,0.42); }
        .messages-area { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 18px; }
        .message { display: flex; gap: 10px; align-items: flex-start; max-width: 720px; }
        .message.user { flex-direction: row-reverse; margin-left: auto; }
        .msg-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .assistant-avatar { background: #7C3AED; color: #fff; font-weight: 800; box-shadow: 0 0 22px rgba(124,58,237,0.28); }
        .msg-bubble, .working-bubble {
          background: rgba(17,17,22,0.98);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 12px;
          padding: 12px 14px;
          max-width: 600px;
          box-shadow: 0 14px 34px rgba(0,0,0,0.22);
        }
        .message.user .msg-bubble { background: rgba(124,58,237,0.22); border-color: rgba(167,139,250,0.38); }
        .msg-content { font-size: 14px; color: #f1f1f4; white-space: pre-wrap; font-family: inherit; line-height: 1.65; }
        .msg-time { display: block; font-size: 11px; color: #a1a1aa; margin-top: 8px; text-align: right; }
        .working-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #f4f4f5; margin-bottom: 6px; }
        .working-dot { width: 8px; height: 8px; border-radius: 50%; background: #A78BFA; animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .working-status, .error-text { font-size: 13px; color: #c4c4cf; }
        .error-text { color: #f87171; }
        .input-area { padding: 14px 16px 18px; background: rgba(10,10,14,0.98); border-top: 1px solid rgba(255,255,255,0.14); }
        .input-card {
          background: rgba(17,17,22,0.98);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 18px 48px rgba(0,0,0,0.28);
        }
        .input-card:focus-within { border-color: rgba(167,139,250,0.58); box-shadow: 0 0 0 3px rgba(124,58,237,0.16), 0 18px 48px rgba(0,0,0,0.28); }
        .chat-input { width: 100%; background: transparent; border: none; outline: none; color: #fff; font-size: 15px; resize: none; line-height: 1.6; min-height: 48px; max-height: 140px; overflow-y: auto; font-family: inherit; }
        .chat-input::placeholder { color: #9ca3af; }
        .input-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; }
        .input-left, .input-right, .preview-tabs, .chat-header-right { display: flex; align-items: center; gap: 8px; }
        .visual-btn, .header-btn {
          min-height: 36px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #f4f4f5;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
        }
        .visual-btn:hover, .header-btn:hover { background: rgba(124,58,237,0.18); border-color: rgba(167,139,250,0.42); color: #fff; }
        .build-badge { font-size: 12px; color: #EDE9FE; background: rgba(124,58,237,0.22); border: 1px solid rgba(167,139,250,0.4); border-radius: 7px; padding: 6px 10px; font-weight: 800; }
        .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          background: #7C3AED;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          box-shadow: 0 0 24px rgba(124,58,237,0.34);
        }
        .send-btn:hover { background: #8B5CF6; }
        .send-btn.stop { background: #2a2a31; border: 1px solid rgba(255,255,255,0.22); box-shadow: none; }
        .preview-panel { flex: 1; display: flex; flex-direction: column; background: #0A0A0E; overflow: hidden; }
        .header-btn.active { background: rgba(124,58,237,0.24); border-color: rgba(167,139,250,0.48); color: #F5F3FF; }
        .header-btn.publish { background: #7C3AED; border-color: rgba(255,255,255,0.14); color: #fff; font-weight: 800; }
        .preview-content {
          flex: 1;
          padding: 20px 24px;
          min-height: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          background: #0A0A0E;
          overflow: visible;
        }
        .resizable-container {
          position: relative;
          width: 100%;
          max-width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .resizable-container.resizing {
          transition: none;
        }
        .resize-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 12px;
          cursor: ew-resize;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .resize-handle::after {
          content: "";
          width: 4px;
          height: 32px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 2px;
          transition: background 0.2s, transform 0.2s;
        }
        .resize-handle:hover::after,
        .resize-handle.active::after {
          background: #A78BFA;
          transform: scaleX(1.5);
          box-shadow: 0 0 8px rgba(167, 139, 250, 0.6);
        }
        .resize-handle.left {
          left: -16px;
        }
        .resize-handle.right {
          right: -16px;
        }
        .responsive-presets {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 3px;
        }
        .preset-btn {
          min-height: 28px;
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preset-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.06);
        }
        .preset-btn.active {
          background: rgba(124, 58, 237, 0.24);
          border: 1px solid rgba(167, 139, 250, 0.3);
          color: #fff;
        }
        .preview-frame { width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #fff; box-shadow: 0 18px 60px rgba(0,0,0,0.28); }
        .code-shell { position: relative; width: 100%; height: 100%; min-height: 0; }
        .copy-code-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(17,17,22,0.94);
          color: #f4f4f5;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 32px rgba(0,0,0,0.32);
          backdrop-filter: blur(14px);
        }
        .copy-code-btn:hover { background: rgba(124,58,237,0.22); border-color: rgba(167,139,250,0.46); color: #fff; }
        .copy-code-btn:disabled { cursor: default; opacity: 0.52; }
        .code-view { width: 100%; height: 100%; overflow: auto; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: #050505; color: #f1f1f4; padding: 58px 20px 20px; font: 13px/1.7 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; }
        button:focus-visible,
        textarea:focus-visible {
          outline: 3px solid rgba(167,139,250,0.42);
          outline-offset: 2px;
        }
        
        /* Inspect / edit section styles */
        .inspect-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ef4444;
          display: inline-block;
          transition: background 0.3s;
        }
        .inspect-dot.active {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: blink-dot 1.2s step-end infinite;
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .section-prompt-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
        }
        
        .section-prompt-card {
          width: 100%;
          max-width: 460px;
          background: #101014;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .section-badge {
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(167, 139, 250, 0.3);
          color: #C4B5FD;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          font-family: monospace;
        }
        
        .card-desc {
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.5;
          margin: 0;
        }
        
        .card-desc code {
          color: #c4b5fd;
        }
        
        .prompt-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          font-size: 14px;
          resize: none;
          outline: none;
          font-family: inherit;
        }
        
        .prompt-textarea:focus {
          border-color: #a78bfa;
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }
        
        .card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }
        
        .cancel-btn {
          min-height: 36px;
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s;
        }
        
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        @media (max-width: 900px) {
          .chat-root { flex-direction: column; }
          .chat-panel { width: 100%; height: 48vh; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.14); }
          .preview-panel { min-height: 55vh; }
          .chat-header-title { max-width: 52vw; }
          .input-actions { align-items: stretch; }
        }
      `}</style>
    </div>
  );
}
