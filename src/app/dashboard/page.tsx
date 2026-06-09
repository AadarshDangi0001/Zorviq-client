"use client";

import { FormEvent, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ExternalLink,
  FolderKanban,
  Home,
  Landmark,
  LogOut,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plane,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserRound,
  type LucideProps,
} from "lucide-react";
import { authStore, Project } from "@/lib/api";
import { useLogout } from "@/react-query-config/mutations/use-auth-mutations";
import {
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
} from "@/react-query-config/mutations/use-project-mutations";
import { useCurrentUser } from "@/react-query-config/queries/use-auth-queries";
import { useProjects } from "@/react-query-config/queries/use-project-queries";
import Loader from "@/components/Loader";

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

type ProjectVisual = {
  label: string;
  previewClass: string;
  Icon: ComponentType<LucideProps>;
  keywords: string[];
};

const projectVisuals: ProjectVisual[] = [
  {
    label: "Commerce",
    previewClass: "bg-[radial-gradient(ellipse_70%_60%_at_50%_24%,rgba(var(--brand-primary-rgb),0.30),transparent_70%),var(--app-surface)]",
    Icon: ShoppingBag,
    keywords: ["shop", "store", "commerce", "ecommerce", "e-commerce", "cart", "retail", "product"],
  },
  {
    label: "Finance",
    previewClass: "bg-[radial-gradient(ellipse_70%_60%_at_50%_24%,rgba(var(--brand-primary-rgb),0.26),transparent_70%),var(--app-surface)]",
    Icon: Landmark,
    keywords: ["finance", "fintech", "bank", "payment", "invoice", "stock", "crypto", "wallet"],
  },
  {
    label: "Travel",
    previewClass: "bg-[radial-gradient(ellipse_70%_60%_at_50%_24%,rgba(var(--brand-accent-rgb),0.24),transparent_70%),var(--app-surface)]",
    Icon: Plane,
    keywords: ["travel", "trip", "hotel", "tour", "booking", "flight", "adventure", "destination"],
  },
  {
    label: "Operations",
    previewClass: "bg-[radial-gradient(ellipse_70%_60%_at_50%_24%,rgba(var(--brand-accent-rgb),0.20),transparent_70%),var(--app-surface)]",
    Icon: FolderKanban,
    keywords: ["dashboard", "admin", "crm", "analytics", "tool", "internal", "saas", "management"],
  },
  {
    label: "Brand",
    previewClass: "bg-[radial-gradient(ellipse_70%_60%_at_50%_24%,rgba(var(--brand-primary-rgb),0.22),transparent_70%),var(--app-surface)]",
    Icon: BriefcaseBusiness,
    keywords: ["portfolio", "agency", "landing", "brand", "marketing", "personal", "company", "startup"],
  },
];

const getProjectVisual = (name: string) => {
  const normalized = name.toLowerCase();
  const matched = projectVisuals.find((visual) =>
    visual.keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (matched) return matched;

  const hash = Array.from(normalized).reduce((total, char) => total + char.charCodeAt(0), 0);
  return projectVisuals[hash % projectVisuals.length];
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isError: isUserError, isLoading: isUserLoading } = useCurrentUser();
  const {
    data: projects = [],
    error: projectsError,
    isLoading: areProjectsLoading,
  } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const logout = useLogout();
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);

  const isLoading = isUserLoading || areProjectsLoading;
  const isSaving = createProject.isPending || updateProject.isPending;
  const isDeleting = deleteProject.isPending;
  const profile = user ?? authStore.getUser();
  const displayName = profile?.fullname || "Builder";
  const firstName = displayName.split(" ")[0] || "Builder";
  const profileEmail = profile?.email || "No email available";
  const profileContact = profile?.contact || "No contact added";
  const queryError =
    projectsError instanceof Error ? projectsError.message : undefined;

  const stats = useMemo(
    () => ({
      total: projects.length,
      generated: projects.filter((project) => Boolean(project.currentCode)).length,
      drafts: projects.filter((project) => !project.currentCode).length,
    }),
    [projects],
  );

  useEffect(() => {
    if (!isUserError) return;
    authStore.clear();
    router.replace("/login");
  }, [isUserError, router]);

  useEffect(() => {
    if (!activeMenuProjectId) return;

    const closeProjectMenu = (event: PointerEvent) => {
      if ((event.target as HTMLElement | null)?.closest("[data-project-menu]")) return;
      setActiveMenuProjectId(null);
    };

    document.addEventListener("pointerdown", closeProjectMenu);
    return () => document.removeEventListener("pointerdown", closeProjectMenu);
  }, [activeMenuProjectId]);

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
    try {
      if (modalMode === "create") {
        const project = await createProject.mutateAsync({ name });
        resetModal();
        router.push(`/chat?id=${project._id}`);
        return;
      }

      if (modalMode === "edit" && activeProject) {
        await updateProject.mutateAsync({
          id: activeProject._id,
          payload: { name },
        });
        resetModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save project");
    }
  };

  const requestDelete = (project: Project) => {
    setError("");
    setActiveMenuProjectId(null);
    setProjectPendingDelete(project);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setError("");
    setProjectPendingDelete(null);
  };

  const confirmDeleteProject = async () => {
    if (!projectPendingDelete) return;

    setError("");
    try {
      await deleteProject.mutateAsync(projectPendingDelete._id);
      setProjectPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete project");
    }
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout.mutateAsync();
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <aside className="sidebar">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="brand-mark" style={{ cursor: "pointer" }}>Z</div>
        </Link>
        <nav className="sidebar-nav">
          <Link href="/" style={{ textDecoration: "none" }}>
            <button className="nav-btn" title="Home" aria-label="Home">
              <Home size={18} />
            </button>
          </Link>
          <button className="nav-btn active" title="Projects" aria-label="Projects">
            <FolderKanban size={18} />
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button
            className={isProfileOpen ? "avatar profile-btn active" : "avatar profile-btn"}
            title="Profile"
            aria-label="Open profile"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((open) => !open)}
          >
            {initials(displayName)}
          </button>
          <button className="nav-btn logout-btn" title="Logout" aria-label="Logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {isProfileOpen && (
        <aside className="profile-panel" aria-label="Profile details">
          <div className="profile-panel-header">
            <div className="profile-avatar">{initials(displayName)}</div>
            <button type="button" onClick={() => setIsProfileOpen(false)} aria-label="Close profile">
              X
            </button>
          </div>
          <div className="profile-summary">
            <p className="eyebrow">Profile</p>
            <h2>{displayName}</h2>
            <span>
              <UserRound size={14} /> Zorviq workspace member
            </span>
          </div>
          <div className="profile-details">
            <div>
              <Mail size={16} />
              <span>
                Email
                <strong>{profileEmail}</strong>
              </span>
            </div>
            <div>
              <Phone size={16} />
              <span>
                Contact
                <strong>{profileContact}</strong>
              </span>
            </div>
            <div>
              <ShieldCheck size={16} />
              <span>
                Status
                <strong>{profile?.verified ? "Verified account" : "Verification pending"}</strong>
              </span>
            </div>
          </div>
          <button className="profile-logout" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Log out
          </button>
        </aside>
      )}

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Projects</h1>
          </div>
          <button className="primary-btn" onClick={openCreateModal}>
            <Plus size={16} /> Create Project
          </button>
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

        {(error || queryError) && <p className="error-text">{error || queryError}</p>}

        <section className="projects-section">
          <div className="section-header">
            <h2>My projects</h2>
            <span>{projects.length} total</span>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-mark"><Plus size={24} /></div>
              <h3>No projects yet</h3>
              <p>Create a named project first, then use chat prompts inside that project.</p>
              <button className="primary-btn" onClick={openCreateModal}>
                <Plus size={16} /> Create Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => {
                const visual = getProjectVisual(project.name);
                const VisualIcon = visual.Icon;

                return (
                  <article key={project._id} className="project-card">
                    <button className="project-open" onClick={() => router.push(`/chat?id=${project._id}`)}>
                      <div className={`project-preview ${visual.previewClass}`}>
                        <div className="preview-grid" aria-hidden="true" />
                        <div className="project-icon-shell">
                          <VisualIcon size={44} strokeWidth={1.8} />
                        </div>
                        <div className="project-visual-copy">
                          <span>{visual.label}</span>
                          <strong>{project.currentCode ? "Ready preview" : "Draft canvas"}</strong>
                        </div>
                      </div>
                      <div className="project-copy">
                        <h3>{project.name}</h3>
                        <p>{project.currentCode ? "Generated website" : "Draft project"} · {relativeTime(project.updatedAt)}</p>
                      </div>
                    </button>
                    <div className="project-actions">
                      <button onClick={() => router.push(`/chat?id=${project._id}`)}>
                        <ExternalLink size={14} /> Open
                      </button>
                      <div className="project-menu-wrap" data-project-menu>
                        <button
                          className="project-menu-trigger"
                          type="button"
                          aria-label={`Open actions for ${project.name}`}
                          aria-haspopup="menu"
                          aria-expanded={activeMenuProjectId === project._id}
                          onClick={() =>
                            setActiveMenuProjectId((current) =>
                              current === project._id ? null : project._id,
                            )
                          }
                        >
                          <MoreVertical size={17} />
                        </button>
                        {activeMenuProjectId === project._id && (
                          <div className="project-menu" role="menu" aria-label={`${project.name} actions`}>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setActiveMenuProjectId(null);
                                openEditModal(project);
                              }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              className="danger"
                              type="button"
                              role="menuitem"
                              onClick={() => requestDelete(project)}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
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

      {projectPendingDelete && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeDeleteModal}>
          <div
            className="modal delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="delete-icon">
              <Trash2 size={20} />
            </div>
            <div className="delete-copy">
              <p className="eyebrow">Confirm delete</p>
              <h2 id="delete-project-title">Delete this project?</h2>
              <p>
                You are about to permanently delete{" "}
                <strong>{projectPendingDelete.name}</strong>. This action cannot be undone.
              </p>
            </div>
            {error && <p className="error-text delete-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" onClick={closeDeleteModal} disabled={isDeleting}>
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                type="button"
                onClick={confirmDeleteProject}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .dashboard-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 60% 40% at 18% 0%, rgba(124,58,237,0.12), transparent 70%),
            #060608;
          color: #f4f4f5;
          display: flex;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .sidebar {
          width: 76px;
          background: rgba(12,12,16,0.98);
          border-right: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(18px);
          position: fixed;
          inset: 0 auto 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 18px 0;
        }
        .brand-mark, .avatar {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          background: #7C3AED;
          box-shadow: 0 0 28px rgba(124,58,237,0.34);
        }
        .sidebar-nav {
          flex: 1;
          margin-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sidebar-bottom { display: flex; flex-direction: column; gap: 14px; align-items: center; }
        .nav-btn {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          background: rgba(255,255,255,0.045);
          color: #d7d7dd;
          cursor: pointer;
          font-weight: 700;
          display: grid;
          place-items: center;
        }
        .nav-btn:hover, .nav-btn.active {
          background: rgba(124,58,237,0.18);
          color: #fff;
          border-color: rgba(167,139,250,0.38);
        }
        .logout-btn:hover {
          color: #fecaca;
          border-color: rgba(248,113,113,0.28);
          background: rgba(239,68,68,0.12);
        }
        .avatar {
          border-radius: 50%;
          font-size: 12px;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.16);
        }
        .profile-btn {
          cursor: pointer;
          padding: 0;
        }
        .profile-btn.active {
          outline: 3px solid rgba(124,58,237,0.24);
          border-color: rgba(255,255,255,0.34);
        }
        .profile-panel {
          position: fixed;
          left: 84px;
          bottom: 24px;
          z-index: 30;
          width: min(340px, calc(100vw - 108px));
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 8px;
          padding: 18px;
          background:
            radial-gradient(ellipse 80% 45% at 50% 0%, rgba(124,58,237,0.08), transparent 72%),
            rgba(12,12,16,0.98);
          box-shadow: 0 28px 90px rgba(0,0,0,0.46);
          backdrop-filter: blur(20px);
        }
        .profile-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        .profile-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 800;
          background: #7C3AED;
          box-shadow: 0 0 24px rgba(124,58,237,0.26);
        }
        .profile-panel-header button {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09);
          color: #f4f4f5;
          cursor: pointer;
          font-weight: 800;
        }
        .profile-summary {
          margin-bottom: 16px;
        }
        .profile-summary h2 {
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .profile-summary span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #c9c9d4;
          font-size: 13px;
        }
        .profile-details {
          display: grid;
          gap: 10px;
          margin-bottom: 16px;
        }
        .profile-details > div {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          background: rgba(255,255,255,0.065);
          color: #c4b5fd;
        }
        .profile-details span {
          display: grid;
          gap: 2px;
          color: #c4c4cf;
          font-size: 12px;
        }
        .profile-details strong {
          color: #f4f4f5;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
        }
        .profile-logout {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(248,113,113,0.28);
          border-radius: 8px;
          background: rgba(239,68,68,0.12);
          color: #fecaca;
          padding: 10px 12px;
          cursor: pointer;
          font-weight: 800;
        }
        .profile-logout:hover {
          background: rgba(239,68,68,0.18);
          color: #fff;
        }
        .main {
          margin-left: 76px;
          width: calc(100% - 76px);
          padding: 34px;
        }
        .topbar, .section-header, .project-actions, .modal-header, .modal-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        h1, h2, h3, p { margin: 0; }
        h1 { font-size: 40px; letter-spacing: -0.03em; color: #fff; }
        .eyebrow {
          color: #b9b3cf;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .primary-btn {
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 8px;
          background: #7C3AED;
          color: #fff;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 0 28px rgba(124,58,237,0.32);
        }
        .primary-btn:hover {
          background: #8B5CF6;
          box-shadow: 0 0 36px rgba(124,58,237,0.42);
        }
        .primary-btn:disabled { opacity: 0.55; cursor: default; }
        .welcome-panel {
          margin: 28px 0;
          padding: 26px;
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 8px;
          background:
            radial-gradient(ellipse 70% 60% at 12% 0%, rgba(124,58,237,0.16), transparent 72%),
            #101014;
          box-shadow: 0 24px 70px rgba(0,0,0,0.28);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .welcome-panel h2 {
          font-size: clamp(22px, 3vw, 34px);
          max-width: 720px;
          letter-spacing: -0.03em;
        }
        .stats { display: grid; grid-template-columns: repeat(3, 92px); gap: 10px; }
        .stats div {
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          padding: 16px;
          background: rgba(255,255,255,0.075);
        }
        .stats strong { display: block; font-size: 28px; color: #fff; line-height: 1; margin-bottom: 8px; }
        .stats span { color: #c4c4cf; font-size: 13px; }
        .error-text {
          color: #f87171;
          font-size: 13px;
          margin: 0 0 16px;
        }
        .projects-section {
          border-top: 1px solid rgba(255,255,255,0.11);
          padding-top: 24px;
        }
        .section-header { margin-bottom: 20px; }
        .section-header h2 { color: #f4f4f5; font-size: 20px; font-weight: 750; }
        .section-header span { color: #b7b7c2; font-size: 14px; }
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(292px, 1fr));
          gap: 18px;
        }
        .project-card {
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          background: #101014;
          overflow: hidden;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.24);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
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
        .project-card:hover {
          border-color: rgba(196,181,253,0.72);
          box-shadow: 0 28px 80px rgba(0,0,0,0.38), 0 0 0 1px rgba(124,58,237,0.28);
          transform: translateY(-3px);
        }
        .project-preview {
          height: 168px;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          color: #fff;
          isolation: isolate;
        }
        .preview-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.28;
          mask-image: linear-gradient(to bottom, #000, transparent 82%);
          z-index: -1;
        }
        .project-icon-shell {
          width: 78px;
          height: 78px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(196,181,253,0.4);
          box-shadow: 0 18px 50px rgba(0,0,0,0.28);
          backdrop-filter: blur(12px);
        }
        .project-visual-copy {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .project-visual-copy span {
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.28);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .project-visual-copy strong {
          font-size: 13px;
          color: rgba(255,255,255,0.92);
        }
        .project-copy { padding: 18px 18px 16px; }
        .project-copy h3 {
          font-size: 18px;
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .project-copy p {
          color: #c4c4cf;
          font-size: 13px;
          margin-top: 6px;
        }
        .project-actions {
          border-top: 1px solid rgba(255,255,255,0.14);
          padding: 12px 14px;
          justify-content: space-between;
          position: relative;
        }
        .project-actions button,
        .modal-actions button,
        .project-menu button {
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 7px;
          background: rgba(255,255,255,0.09);
          color: #f4f4f5;
          padding: 9px 12px;
          min-height: 40px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 650;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .project-actions button:hover,
        .modal-actions button:hover,
        .project-menu button:hover {
          background: rgba(124,58,237,0.18);
          border-color: rgba(167,139,250,0.42);
        }
        .project-actions > button {
          min-width: 96px;
        }
        .project-menu-wrap {
          position: relative;
          margin-left: auto;
        }
        .project-menu-trigger {
          width: 42px;
          padding-inline: 0;
        }
        .project-menu {
          position: absolute;
          right: 0;
          bottom: calc(100% + 8px);
          z-index: 5;
          width: min(150px, calc(100vw - 48px));
          padding: 6px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          background: rgba(16,16,20,0.98);
          box-shadow: 0 18px 48px rgba(0,0,0,0.48);
          backdrop-filter: blur(16px);
        }
        .project-menu button {
          width: 100%;
          justify-content: flex-start;
          border-color: transparent;
          background: transparent;
        }
        .modal-actions .primary-btn {
          border: 0;
          background: #7c3aed;
          color: #fff;
          font-weight: 700;
        }
        .project-actions .danger { color: #fecaca; }
        .project-actions .danger:hover,
        .project-menu .danger:hover,
        .confirm-delete-btn:hover {
          color: #fff !important;
          background: rgba(239,68,68,0.2) !important;
          border-color: rgba(248,113,113,0.38) !important;
        }
        .empty-state {
          min-height: 320px;
          border: 1px dashed rgba(255,255,255,0.3);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #f4f4f5;
          text-align: center;
          padding: 24px;
          background: rgba(255,255,255,0.06);
        }
        .empty-state p { color: #c4c4cf; max-width: 420px; line-height: 1.5; }
        .empty-mark {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: rgba(124,58,237,0.18);
          color: #c4b5fd;
          border: 1px solid rgba(167,139,250,0.28);
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
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          background: #101014;
          padding: 22px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.55);
        }
        .delete-modal {
          display: grid;
          gap: 16px;
        }
        .delete-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #fecaca;
          border: 1px solid rgba(248,113,113,0.28);
          background: rgba(239,68,68,0.12);
        }
        .delete-copy h2 {
          color: #fff;
          font-size: 24px;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .delete-copy p:last-child {
          color: #c4c4cf;
          line-height: 1.55;
        }
        .delete-copy strong {
          color: #fff;
          font-weight: 800;
        }
        .delete-error {
          margin: 0;
        }
        .confirm-delete-btn {
          color: #fecaca !important;
          border-color: rgba(248,113,113,0.3) !important;
          background: rgba(239,68,68,0.14) !important;
        }
        .project-actions button:disabled,
        .modal-actions button:disabled {
          cursor: default;
          opacity: 0.55;
        }
        .modal-header { margin-bottom: 20px; }
        .modal-header button {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09);
          color: #f4f4f5;
          cursor: pointer;
        }
        label {
          display: grid;
          gap: 8px;
          color: #d4d4d8;
          font-size: 13px;
        }
        input {
          width: 100%;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          background: #111116;
          color: #fff;
          padding: 12px 13px;
          font-size: 14px;
          outline: none;
        }
        input:focus { border-color: rgba(124,58,237,0.7); }
        button:focus-visible,
        input:focus-visible,
        .project-open:focus-visible {
          outline: 3px solid rgba(167,139,250,0.42);
          outline-offset: 2px;
        }
        .modal-actions { margin-top: 20px; justify-content: flex-end; }
        @media (max-width: 760px) {
          .sidebar { display: none; }
          .profile-panel { display: none; }
          .main { margin-left: 0; width: 100%; padding: 20px; }
          .topbar, .welcome-panel { align-items: flex-start; flex-direction: column; }
          .stats { width: 100%; grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
