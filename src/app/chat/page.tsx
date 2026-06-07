"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  API_BASE_URL,
  Project,
  authStore,
  enqueueGeneration,
  getGenerationStatus,
  getProject,
  updateProject,
} from "@/lib/api";

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
    <Suspense fallback={<div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#060606", color: "#888" }}>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("id");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<EventSource | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [workingStatus, setWorkingStatus] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [error, setError] = useState("");

  const projectId = project?._id;
  const previewHtml = useMemo(() => generatedCode || defaultCode, [generatedCode]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        if (!queryProjectId) {
          router.replace("/dashboard");
          return;
        }

        const activeProject = await getProject(queryProjectId);
        if (!alive) return;

        setProject(activeProject);
        setGeneratedCode(activeProject.currentCode ?? "");
        setMessages([
          {
            id: "project-loaded",
            role: "assistant",
            content: activeProject.currentCode
              ? "Loaded the latest generated code for this project."
              : "Project is ready. Send a prompt to generate the first version.",
            time: now(),
          },
        ]);
      } catch {
        authStore.clear();
        router.replace("/login");
      }
    };

    load();
    return () => {
      alive = false;
      streamRef.current?.close();
    };
  }, [queryProjectId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWorking]);

  const finishGeneration = async (code: string, jobId: string) => {
    let finalCode = code;

    if (!finalCode.trim()) {
      const status = await getGenerationStatus(jobId);
      finalCode = status.output ?? "";
    }

    if (finalCode.trim()) {
      setGeneratedCode(finalCode);
      if (projectId) {
        const updated = await updateProject(projectId, { currentCode: finalCode });
        setProject(updated);
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
    const source = new EventSource(`${API_BASE_URL}/api/generate/stream/${jobId}`, {
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
        const status = await getGenerationStatus(jobId);
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
    const content = (text ?? input).trim();
    if (!content || isWorking || !projectId) return;
    setInput("");
    setError("");

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", content, time: now() },
    ]);
    setIsWorking(true);
    setWorkingStatus("Queueing generation");

    try {
      const result = await enqueueGeneration(projectId, content);
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
    const blob = new Blob([generatedCode || previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project?.name ?? "zorviq-project"}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          {messages.map((msg) => (
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
                <button className={`send-btn ${isWorking ? "stop" : ""}`} onClick={() => isWorking ? stopGeneration() : handleSend()}>
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
            <pre className="code-view">{generatedCode || "Generated code will appear here."}</pre>
          )}
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .chat-root { display: flex; height: 100vh; background: #060606; color: #e5e5e5; font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden; }
        .chat-panel { width: 400px; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05); background: #060606; flex-shrink: 0; }
        .chat-header, .preview-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: #0A0A0A; }
        .chat-header-title { font-size: 14px; font-weight: 600; color: #e5e5e5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; display: block; }
        .back-btn { font-size: 13px; color: #888; background: transparent; border: none; cursor: pointer; padding: 4px 0; white-space: nowrap; }
        .back-btn:hover { color: #fff; }
        .messages-area { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
        .message { display: flex; gap: 10px; align-items: flex-start; max-width: 720px; }
        .message.user { flex-direction: row-reverse; margin-left: auto; }
        .msg-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
        .assistant-avatar { background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #fff; font-weight: 800; }
        .msg-bubble, .working-bubble { background: rgba(10,10,10,0.96); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 10px 14px; max-width: 600px; }
        .message.user .msg-bubble { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); }
        .msg-content { font-size: 14px; color: #ddd; white-space: pre-wrap; font-family: inherit; line-height: 1.6; }
        .msg-time { display: block; font-size: 10px; color: #555; margin-top: 6px; text-align: right; }
        .working-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #e5e5e5; margin-bottom: 6px; }
        .working-dot { width: 8px; height: 8px; border-radius: 50%; background: #A78BFA; animation: pulse 1s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .working-status, .error-text { font-size: 12px; color: #888; }
        .error-text { color: #f87171; }
        .input-area { padding: 12px 16px 16px; background: #060606; border-top: 1px solid rgba(255,255,255,0.05); }
        .input-card { background: rgba(10,10,10,0.96); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 12px 14px 10px; }
        .chat-input { width: 100%; background: transparent; border: none; outline: none; color: #ccc; font-size: 14px; resize: none; line-height: 1.5; min-height: 40px; max-height: 120px; overflow-y: auto; font-family: inherit; }
        .chat-input::placeholder { color: #444; }
        .input-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .input-left, .input-right, .preview-tabs, .chat-header-right { display: flex; align-items: center; gap: 6px; }
        .visual-btn, .header-btn { padding: 5px 10px; border-radius: 7px; border: 1px solid #2a2a2a; background: transparent; color: #888; font-size: 12px; cursor: pointer; }
        .visual-btn:hover, .header-btn:hover { background: #1e1e1e; color: #fff; }
        .build-badge { font-size: 12px; color: #A78BFA; background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3); border-radius: 7px; padding: 4px 9px; }
        .send-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .send-btn.stop { background: #333; border: 1px solid #444; }
        .preview-panel { flex: 1; display: flex; flex-direction: column; background: #0A0A0A; overflow: hidden; }
        .header-btn.active { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.3); color: #A78BFA; }
        .header-btn.publish { background: linear-gradient(135deg, #7C3AED, #6D28D9); border: none; color: #fff; font-weight: 600; }
        .preview-content { flex: 1; padding: 18px; min-height: 0; }
        .preview-frame { width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: #fff; }
        .code-view { width: 100%; height: 100%; overflow: auto; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: #050505; color: #d7d7dd; padding: 18px; font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; }
        @media (max-width: 900px) {
          .chat-root { flex-direction: column; }
          .chat-panel { width: 100%; height: 45vh; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
          .preview-panel { min-height: 55vh; }
        }
      `}</style>
    </div>
  );
}
