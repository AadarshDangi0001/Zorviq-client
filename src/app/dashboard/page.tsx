"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApiUser,
  Project,
  authStore,
  createProject,
  deleteProject,
  getMe,
  listProjects,
  logoutUser,
  updateProject,
} from "@/lib/api";

const relativeTime = (date?: string) => {
  if (!date) return "recently";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "Z";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");

  const displayName = user?.fullname || authStore.getUser()?.fullname || "Builder";
  const firstName = displayName.split(" ")[0] || "Builder";

  const stats = useMemo(
    () => ({
      total: projects.length,
      generated: projects.filter((project) => Boolean(project.currentCode)).length,
      drafts: projects.filter((project) => !project.currentCode).length,
    }),
    [projects],
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [profile, projectList] = await Promise.all([getMe(), listProjects()]);
        if (!alive) return;
        setUser(profile);
        setProjects(projectList);
      } catch {
        authStore.clear();
        router.replace("/login");
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  const openCreateModal = () => {
    setError("");
    setActiveProject(null);
    setProjectName("");
    setModalMode("create");
  };

  const openEditModal = (project: Project) => {
    setError("");
    setActiveProject(project);
    setProjectName(project.name);
    setModalMode("edit");
  };

  const closeModal = () => {
    if (isSaving) return;
    setModalMode(null);
    setActiveProject(null);
    setProjectName("");
  };

  const resetModal = () => {
    setModalMode(null);
    setActiveProject(null);
    setProjectName("");
  };

  const handleSaveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = projectName.trim();
    if (name.length < 3) {
      setError("Project name must be at least 3 characters.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      if (modalMode === "create") {
        const project = await createProject(name);
        setProjects((items) => [project, ...items]);
        resetModal();
        router.push(`/chat?id=${project._id}`);
        return;
      }

      if (modalMode === "edit" && activeProject) {
        const updated = await updateProject(activeProject._id, { name });
        setProjects((items) => items.map((item) => (item._id === updated._id ? updated : item)));
        resetModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    setError("");
    try {
      await deleteProject(project._id);
      setProjects((items) => items.filter((item) => item._id !== project._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        Loading dashboard...
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            background: #060606;
            color: #888;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, sans-serif;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <div className="brand-mark">Z</div>
        <nav className="sidebar-nav">
          <button className="nav-btn active" title="Projects">P</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar" title={displayName}>{initials(displayName)}</div>
          <button className="nav-btn" title="Logout" onClick={handleLogout}>Q</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Projects</h1>
          </div>
          <button className="primary-btn" onClick={openCreateModal}>Create Project</button>
        </header>

        <section className="welcome-panel">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{firstName}, choose a project or start a new one.</h2>
          </div>
          <div className="stats">
            <div><strong>{stats.total}</strong><span>Total</span></div>
            <div><strong>{stats.generated}</strong><span>Generated</span></div>
            <div><strong>{stats.drafts}</strong><span>Drafts</span></div>
          </div>
        </section>

        {error && <p className="error-text">{error}</p>}

        <section className="projects-section">
          <div className="section-header">
            <h2>My projects</h2>
            <span>{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-mark">+</div>
              <h3>No projects yet</h3>
              <p>Create a named project first, then use chat prompts inside that project.</p>
              <button className="primary-btn" onClick={openCreateModal}>Create Project</button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article key={project._id} className="project-card">
                  <button className="project-open" onClick={() => router.push(`/chat?id=${project._id}`)}>
                    <div className="project-preview">
                      <div className="preview-window">
                        <span />
                        <span />
                        <span className="short" />
                      </div>
                    </div>
                    <div className="project-copy">
                      <h3>{project.name}</h3>
                      <p>{project.currentCode ? "Generated website" : "Draft project"} · {relativeTime(project.updatedAt)}</p>
                    </div>
                  </button>
                  <div className="project-actions">
                    <button onClick={() => router.push(`/chat?id=${project._id}`)}>Open</button>
                    <button onClick={() => openEditModal(project)}>Update</button>
                    <button className="danger" onClick={() => handleDelete(project)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalMode && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <form className="modal" onSubmit={handleSaveProject} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "create" ? "Create project" : "Update project"}</h2>
              <button type="button" onClick={closeModal} aria-label="Close">x</button>
            </div>
            <label>
              Project name
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Landing page redesign"
                autoFocus
                maxLength={100}
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeModal}>Cancel</button>
              <button className="primary-btn" disabled={isSaving || projectName.trim().length < 3}>
                {isSaving ? "Saving..." : modalMode === "create" ? "Create and Open" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .dashboard-root {
          min-height: 100vh;
          background: #070707;
          color: #f4f4f5;
          display: flex;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .sidebar {
          width: 68px;
          background: #0d0d0f;
          border-right: 1px solid rgba(255,255,255,0.08);
          position: fixed;
          inset: 0 auto 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 0;
        }
        .brand-mark, .avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }
        .sidebar-nav { flex: 1; margin-top: 28px; }
        .sidebar-bottom { display: flex; flex-direction: column; gap: 14px; align-items: center; }
        .nav-btn {
          width: 38px;
          height: 38px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: #8b8b93;
          cursor: pointer;
          font-weight: 700;
        }
        .nav-btn:hover, .nav-btn.active { background: #1a1a1d; color: #fff; border-color: #25252a; }
        .avatar { border-radius: 50%; font-size: 12px; }
        .main {
          margin-left: 68px;
          width: calc(100% - 68px);
          padding: 32px;
        }
        .topbar, .section-header, .project-actions, .modal-header, .modal-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        h1, h2, h3, p { margin: 0; }
        h1 { font-size: 34px; }
        .eyebrow {
          color: #8b8b93;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .primary-btn {
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: #fff;
          padding: 10px 16px;
          font-weight: 700;
          cursor: pointer;
        }
        .primary-btn:disabled { opacity: 0.55; cursor: default; }
        .welcome-panel {
          margin: 28px 0;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(124,58,237,0.16), rgba(37,99,235,0.08)), #0d0d0f;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .welcome-panel h2 { font-size: clamp(22px, 3vw, 34px); max-width: 720px; }
        .stats { display: grid; grid-template-columns: repeat(3, 92px); gap: 10px; }
        .stats div {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 12px;
          background: rgba(0,0,0,0.22);
        }
        .stats strong { display: block; font-size: 24px; }
        .stats span { color: #9ca3af; font-size: 12px; }
        .error-text {
          color: #f87171;
          font-size: 13px;
          margin: 0 0 16px;
        }
        .projects-section {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 24px;
        }
        .section-header { margin-bottom: 18px; }
        .section-header span { color: #8b8b93; font-size: 13px; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .project-card {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: #0d0d0f;
          overflow: hidden;
        }
        .project-open {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: 0;
          color: inherit;
          cursor: pointer;
          padding: 0;
        }
        .project-card:hover { border-color: rgba(124,58,237,0.45); }
        .project-preview {
          height: 156px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.18));
        }
        .preview-window {
          width: 72%;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .preview-window span {
          display: block;
          height: 8px;
          border-radius: 8px;
          background: rgba(255,255,255,0.22);
        }
        .preview-window .short { width: 64%; }
        .project-copy { padding: 14px 16px; }
        .project-copy h3 {
          font-size: 15px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-copy p {
          color: #8b8b93;
          font-size: 12px;
          margin-top: 5px;
        }
        .project-actions {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 10px;
          justify-content: flex-start;
        }
        .project-actions button, .modal-actions button {
          border: 1px solid #2a2a31;
          border-radius: 7px;
          background: #141418;
          color: #d4d4d8;
          padding: 7px 10px;
          cursor: pointer;
        }
        .modal-actions .primary-btn {
          border: 0;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: #fff;
          font-weight: 700;
        }
        .project-actions .danger { color: #fca5a5; }
        .empty-state {
          min-height: 320px;
          border: 1px dashed rgba(255,255,255,0.16);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #d4d4d8;
          text-align: center;
          padding: 24px;
        }
        .empty-state p { color: #8b8b93; max-width: 420px; line-height: 1.5; }
        .empty-mark {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: #17171b;
          color: #a78bfa;
          font-size: 24px;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.72);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 20;
        }
        .modal {
          width: min(440px, 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: #0d0d0f;
          padding: 22px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.55);
        }
        .modal-header { margin-bottom: 20px; }
        .modal-header button {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: 1px solid #2a2a31;
          background: #141418;
          color: #d4d4d8;
          cursor: pointer;
        }
        label {
          display: grid;
          gap: 8px;
          color: #a1a1aa;
          font-size: 13px;
        }
        input {
          width: 100%;
          border: 1px solid #2a2a31;
          border-radius: 8px;
          background: #151519;
          color: #fff;
          padding: 12px 13px;
          font-size: 14px;
          outline: none;
        }
        input:focus { border-color: rgba(124,58,237,0.7); }
        .modal-actions { margin-top: 20px; justify-content: flex-end; }
        @media (max-width: 760px) {
          .sidebar { display: none; }
          .main { margin-left: 0; width: 100%; padding: 20px; }
          .topbar, .welcome-panel { align-items: flex-start; flex-direction: column; }
          .stats { width: 100%; grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
