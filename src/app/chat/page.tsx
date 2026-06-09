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
    <main>
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
  const [isSelectingComponent, setIsSelectingComponent] = useState(false);
  const [targetedComponent, setTargetedComponent] = useState<{tag: string, text: string, selector: string, html: string} | null>(null);

  const toggleSelectionMode = () => {
    setIsSelectingComponent((prev) => {
      const next = !prev;
      const iframe = document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage({ type: "TOGGLE_SELECTION_MODE", value: next }, "*");
      }
      return next;
    });
  };

  const projectId = project?._id;
  const storedCode = project?.currentCode ?? "";
  const activeCode = generatedCode || storedCode;
  const hasCopiedActiveCode = Boolean(activeCode) && copiedCode === activeCode;
  const previewHtml = useMemo(() => {
    const base = activeCode || defaultCode;
    if (!base.includes('</body>')) return base;
    const injection = `
    <script>
      let isSelecting = false;
      let hoveredEl = null;
      let oldOutline = '';

      window.addEventListener('message', (e) => {
        if (e.data?.type === 'TOGGLE_SELECTION_MODE') {
          isSelecting = e.data.value;
          document.body.style.cursor = isSelecting ? 'crosshair' : 'default';
          if (!isSelecting && hoveredEl) {
            hoveredEl.style.outline = oldOutline;
            hoveredEl = null;
          }
        }
      });

      document.addEventListener('mouseover', (e) => {
        if (!isSelecting) return;
        e.stopPropagation();
        oldOutline = e.target.style.outline;
        hoveredEl = e.target;
        e.target.style.outline = '2px solid #7C3AED';
        e.target.style.outlineOffset = '-2px';
        e.target.style.cursor = 'crosshair';
      }, true);

      document.addEventListener('mouseout', (e) => {
        if (!isSelecting) return;
        e.stopPropagation();
        if (hoveredEl === e.target) {
          e.target.style.outline = oldOutline || '';
          hoveredEl = null;
        }
      }, true);

      document.addEventListener('click', (e) => {
        if (!isSelecting) {
          const anchor = e.target.closest('a');
          if (anchor && anchor.href) e.preventDefault();
          const btn = e.target.closest('button');
          if (btn) e.preventDefault();
          return;
        }
        e.preventDefault();
        e.stopPropagation();

        if (hoveredEl) {
          hoveredEl.style.outline = oldOutline || '';
          hoveredEl = null;
        }

        const path = getElementSelector(e.target);
        const text = (e.target.innerText || '').substring(0, 30).trim();
        const tag = e.target.tagName.toLowerCase();
        const html = e.target.outerHTML;

        window.parent.postMessage({ type: 'ELEMENT_CLICKED', selector: path, text, tag, html }, '*');
      }, true);

      function getElementSelector(el) {
         if (el.id) return '#' + el.id;
         if (el.tagName === 'BODY') return 'body';
         let path = [];
         while (el.nodeType === Node.ELEMENT_NODE) {
           let selector = el.nodeName.toLowerCase();
           if (el.id) {
             selector += '#' + el.id;
             path.unshift(selector);
             break;
           } else {
             let sib = el, nth = 1;
             while (sib = sib.previousElementSibling) {
               if (sib.nodeName.toLowerCase() === selector) nth++;
             }
             if (nth !== 1) selector += ":nth-of-type("+nth+")";
           }
           path.unshift(selector);
           el = el.parentNode;
         }
         return path.join(" > ");
      }
    </script>
    `;
    return base.replace('</body>', injection + '</body>');
  }, [activeCode]);
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

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "ELEMENT_CLICKED") {
        const { tag, text, selector, html } = e.data;
        setTargetedComponent({ tag, text, selector, html });
        setIsSelectingComponent(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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
        setGeneratedCode(output);
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
      }
    };
  };

  const handleSend = async (text?: string) => {
    const rawInput = (text ?? input).trim();
    if (!rawInput || isWorking || !projectId) return;

    let displayContent = rawInput;
    let backendPrompt = rawInput;
    let opts = {};

    if (targetedComponent) {
      displayContent = `[Target: <${targetedComponent.tag}>] ${rawInput}`;
      backendPrompt = `Please modify the element matching the CSS selector: \`${targetedComponent.selector}\` (${targetedComponent.tag}).\n\nInstruction: ${rawInput}\n\nCRITICAL: You must return the ENTIRE updated HTML document, including all unmodified parts. Do not just return the modified element.`;
      opts = {};
      setTargetedComponent(null);
    }

    setInput("");
    setError("");

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
            {targetedComponent && (
              <div className="targeted-badge">
                <span className="targeted-text">
                  Targeting: <strong>&lt;{targetedComponent.tag}&gt;</strong> {targetedComponent.text ? `"${targetedComponent.text}"` : ""}
                </span>
                <button className="clear-target-btn" onClick={() => setTargetedComponent(null)}>✕</button>
              </div>
            )}
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
                <button className={`visual-btn ${isSelectingComponent ? "active" : ""}`} onClick={toggleSelectionMode}>
                  {isSelectingComponent ? "Selecting..." : "Select Component"}
                </button>
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
          </div>
          <div className="chat-header-right">
            <button className="header-btn publish" onClick={downloadCode}>Download HTML</button>
          </div>
        </header>
        <div className="preview-content">
          {viewMode === "preview" ? (
            <iframe
              title="Generated project preview"
              className="preview-frame"
              srcDoc={previewHtml}
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts"
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
        .preview-content { flex: 1; padding: 20px; min-height: 0; }
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
        .targeted-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(167,139,250,0.3);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 12px;
        }
        .targeted-text {
          font-size: 13px;
          color: #e2d4fd;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .targeted-text strong {
          color: #fff;
        }
        .clear-target-btn {
          background: none;
          border: none;
          color: #a78bfa;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }
        .clear-target-btn:hover {
          color: #fff;
        }
        button:focus-visible,
        textarea:focus-visible {
          outline: 3px solid rgba(167,139,250,0.42);
          outline-offset: 2px;
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
