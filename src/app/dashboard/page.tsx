"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialProjects = [
  { id: "1", title: "Your Civic Companion", subtitle: "Full-stack civic app", time: "2h ago", color: "#7C3AED" },
  { id: "2", title: "Civic Insight", subtitle: "Report & analytics dashboard", time: "5h ago", color: "#8B5CF6" },
  { id: "3", title: "Cost Explorer", subtitle: "FinOps dashboard", time: "1d ago", color: "#A78BFA" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState(initialProjects);

  const handleEdit = (id: string) => {
    const newTitle = window.prompt("Enter new project title:");
    if (newTitle && newTitle.trim()) {
      setProjects(projects.map(p => p.id === id ? { ...p, title: newTitle.trim() } : p));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    // Store the prompt to use in /chat
    sessionStorage.setItem("initialPrompt", prompt);
    router.push("/chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✦</div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-btn active" title="Home">⌂</button>
          <button className="nav-btn" title="Search">⌕</button>
          <button className="nav-btn" title="Compass">◎</button>
          <button className="nav-btn" title="Grid">⊞</button>
          <button className="nav-btn" title="Star">✦</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">K</div>
          <button className="nav-btn" title="Mail">✉</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">Ready to build, Kanishq?</h1>

          <div className="prompt-card">
            <textarea
              className="prompt-input"
              placeholder="Ask to generate something..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <div className="prompt-actions">
              <button className="icon-btn">+</button>
              <div className="prompt-right">
                <span className="plan-badge">Plan ▾</span>
                <button className="icon-btn">🎤</button>
                <button
                  className="send-btn"
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="projects-section">
          <div className="tabs">
            {["My projects", "Recently viewed", "Shared with me", "Templates"].map((t) => (
              <button key={t} className={`tab ${t === "My projects" ? "active" : ""}`}>
                {t}
              </button>
            ))}
            <span className="browse-all">Browse all →</span>
          </div>

          <div className="projects-grid">
            <div
              className="project-card create-new-card"
              onClick={() => router.push("/chat")}
            >
              <div className="create-new-content">
                <div className="plus-icon">+</div>
                <div>Create New Project</div>
              </div>
            </div>

            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => router.push(`/chat?id=${project.id}`)}
              >
                <div className="project-preview" style={{ background: `linear-gradient(135deg, ${project.color}22, ${project.color}44)` }}>
                  <div className="preview-mock">
                    <div className="mock-bar" />
                    <div className="mock-line" />
                    <div className="mock-line short" />
                  </div>
                </div>
                <div className="project-info">
                  <div className="project-avatar" style={{ background: project.color }}>K</div>
                  <div className="project-text">
                    <div className="project-title">{project.title}</div>
                    <div className="project-sub">{project.subtitle} · {project.time}</div>
                  </div>
                  <div className="project-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(project.id); }} className="action-btn" title="Edit">✎</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="action-btn delete" title="Delete">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: #060606;
          color: #fff;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Sidebar */
        .sidebar {
          width: 60px;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 10;
        }
        .sidebar-logo { margin-bottom: 24px; }
        .logo-icon { font-size: 22px; color: #A78BFA; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .sidebar-bottom { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .nav-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #888;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .nav-btn:hover, .nav-btn.active { background: #1e1e1e; color: #fff; }
        .avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          cursor: pointer;
        }

        /* Main */
        .main {
          margin-left: 60px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Hero */
        .hero {
          min-height: 52vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px 40px;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.15) 0%, rgba(109,40,217,0.05) 45%, transparent 70%),
                      linear-gradient(180deg, rgba(6,6,6,0.5) 0%, #060606 100%);
        }
        .hero-title {
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 700;
          text-align: center;
          margin-bottom: 32px;
          letter-spacing: -0.5px;
        }

        /* Prompt card */
        .prompt-card {
          width: 100%;
          max-width: 660px;
          background: rgba(10,10,10,0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 16px 16px 12px;
          box-shadow: 0 8px 40px #0008;
        }
        .prompt-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #ccc;
          font-size: 15px;
          resize: none;
          min-height: 52px;
          line-height: 1.5;
        }
        .prompt-input::placeholder { color: #555; }
        .prompt-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }
        .prompt-right { display: flex; align-items: center; gap: 8px; }
        .plan-badge {
          font-size: 13px;
          color: #A78BFA;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          background: rgba(124,58,237,0.15);
        }
        .icon-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #888;
          font-size: 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .icon-btn:hover { background: #222; color: #fff; }
        .send-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .send-btn:disabled { opacity: 0.4; cursor: default; }

        /* Projects */
        .projects-section {
          background: transparent;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 24px 32px 40px;
          flex: 1;
        }
        .tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .tab {
          padding: 6px 16px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab:hover { color: #fff; background: #1e1e1e; }
        .tab.active { background: #1e1e1e; color: #fff; border-color: #2a2a2a; }
        .browse-all {
          margin-left: auto;
          font-size: 13px;
          color: #888;
          cursor: pointer;
        }
        .browse-all:hover { color: #fff; }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .project-card {
          background: #0A0A0A;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
        }
        .project-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.1); }
        .project-preview {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .preview-mock {
          width: 100%;
          max-width: 200px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mock-bar {
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.15);
          width: 60%;
        }
        .mock-line {
          height: 5px;
          border-radius: 3px;
          background: rgba(255,255,255,0.08);
          width: 100%;
        }
        .mock-line.short { width: 70%; }
        .project-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-top: 1px solid #1e1e1e;
        }
        .project-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .project-text { flex: 1; min-width: 0; }
        .project-title { font-size: 14px; font-weight: 600; color: #e5e5e5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .project-sub { font-size: 12px; color: #666; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .project-actions {
          display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
        }
        .project-card:hover .project-actions { opacity: 1; }
        .action-btn {
          background: transparent; border: none; color: #888; font-size: 14px; cursor: pointer; padding: 4px; border-radius: 4px;
        }
        .action-btn:hover { background: #222; color: #fff; }
        .action-btn.delete:hover { color: #f87171; }

        .create-new-card {
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: 1px dashed rgba(255,255,255,0.15);
          height: 100%; min-height: 240px;
        }
        .create-new-card:hover { background: rgba(255,255,255,0.02); border-color: rgba(124,58,237,0.4); }
        .create-new-content { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #888; font-size: 14px; }
        .plus-icon { width: 40px; height: 40px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #A78BFA; transition: transform 0.2s; }
        .create-new-card:hover .plus-icon { transform: scale(1.1); background: #222; }
      `}</style>
    </div>
  );
}