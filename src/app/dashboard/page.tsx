"use client";

import { FormEvent, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  ChartNoAxesCombined,
  ChevronDown,
  ExternalLink,
  FolderKanban,
  Home,
  Landmark,
  LayoutGrid,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Pencil,
  PenTool,
  Phone,
  Plane,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  Users,
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

const getProjectVisual = (project: Project) => {
  const nameMatch = project.name.toLowerCase();
  
  // 1. Try to match from the project name
  let matched = projectVisuals.find((visual) =>
    visual.keywords.some((keyword) => nameMatch.includes(keyword)),
  );

  // 2. If no name match, try to detect topic from the actual generated code content
  if (!matched && project.currentCode) {
    const codeMatch = project.currentCode.toLowerCase();
    matched = projectVisuals.find((visual) =>
      visual.keywords.some((keyword) => codeMatch.includes(keyword)),
    );
  }

  if (matched) return matched;

  // Fallback if no topic can be detected
  const hash = Array.from(nameMatch).reduce((total, char) => total + char.charCodeAt(0), 0);
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeMenuProjectId, setActiveMenuProjectId] = useState<string | null>(null);
  const [projectPendingDelete, setProjectPendingDelete] = useState<Project | null>(null);
  const [promptQuery, setPromptQuery] = useState("");

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

  const handlePromptSubmit = async () => {
    const prompt = promptQuery.trim();
    if (!prompt || isSaving) return;

    setError("");
    try {
      const name = prompt.split(" ").slice(0, 4).join(" ") || "New Project";
      const project = await createProject.mutateAsync({ name });
      sessionStorage.setItem("initialPrompt", prompt);
      router.push(`/chat?id=${project._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project from prompt");
    }
  };

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
    <div className="dashboard-root" style={{ '--sidebar-width': isSidebarExpanded ? '220px' : '88px' } as React.CSSProperties}>
      <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}>
        <div 
          className="brand-mark" 
          style={{ cursor: "pointer" }} 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          title="Toggle Sidebar"
        >
          {isSidebarExpanded ? "Zorviq" : "Z"}
        </div>
        <nav className="sidebar-nav">
          <Link href="/" className="sidebar-link">
            <button className="nav-btn" title="Home" aria-label="Home">
              <Home size={20} />
              <span>Home</span>
            </button>
          </Link>
          <div className="sidebar-link">
            <button className="nav-btn" title="Search" aria-label="Search">
              <Search size={20} />
              <span>Search</span>
            </button>
          </div>
          <div className="sidebar-link">
            <button className="nav-btn active" title="Projects" aria-label="Projects">
              <FolderKanban size={20} />
              <span>Projects</span>
            </button>
          </div>
          <div className="sidebar-link">
            <button className="nav-btn" title="Templates" aria-label="Templates">
              <LayoutGrid size={20} />
              <span>Templates</span>
            </button>
          </div>
          <div className="sidebar-link">
            <button className="nav-btn" title="Favorites" aria-label="Favorites">
              <Star size={20} />
              <span>Favorites</span>
            </button>
          </div>
        </nav>
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
          <div /> {/* Spacer */}
          <div className="topbar-right">
            <button className="bell-btn"><Bell size={18} /></button>
            <button
              className="user-pill"
              onClick={() => setIsProfileOpen((open) => !open)}
            >
              <div className="avatar-small">{initials(displayName)}</div>
              <span>{firstName}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <section className="welcome-section">
          <h2>Welcome Back {firstName}</h2>
          <div className="welcome-actions">
            <button className="pill-action"><Search size={14} /> Search</button>
            <button className="pill-action"><MessageSquare size={14} /> Ask</button>
            <button className="pill-action primary" onClick={openCreateModal}><Plus size={14} /> Create</button>
          </div>
          <div className="search-bar-wrapper">
            <button className="search-plus" type="button"><Plus size={18} /></button>
            <input 
              className="main-search" 
              placeholder="What do you want to build?" 
              value={promptQuery}
              onChange={(e) => setPromptQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePromptSubmit();
              }}
            />
            <button className="search-send" type="button" onClick={handlePromptSubmit} disabled={isSaving}>
              <Send size={16} />
            </button>
          </div>
        </section>

        {(error || queryError) && <p className="error-text" style={{textAlign: "center"}}>{error || queryError}</p>}

        <section className="bento-grid">
          <div className="projects-container">
            <div className="projects-tabs">
              <div className="tabs-left">
                <button className="tab-btn active">My projects</button>
              </div>
            </div>
            
            <div className="projects-masonry">
              {projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-mark"><Plus size={24} /></div>
                  <h3>No projects found</h3>
                  <p>Create a named project first, then use chat prompts inside that project.</p>
                  <button className="primary-btn" onClick={openCreateModal}>
                    <Plus size={16} /> Create Project
                  </button>
                </div>
              ) : (
                projects.map((project, i) => {
                  const visual = getProjectVisual(project);
                  const VisualIcon = visual.Icon;

                  return (
                    <article key={project._id} className="project-card medium-card">
                    <div className="project-preview-wrap" onClick={() => router.push(`/chat?id=${project._id}`)} role="button" tabIndex={0}>
                      <div className={`project-preview ${visual.previewClass}`}>
                        <div className="preview-grid" aria-hidden="true" />
                        <div className="project-tags">
                          <span className="visual-label">{visual.label}</span>
                        </div>
                        <div className="project-icon-shell">
                          <VisualIcon size={38} strokeWidth={1.8} />
                        </div>
                        <div className="project-bottom-tags">
                          {visual.keywords.slice(0, 3).map(kw => <span key={kw}>{kw}</span>)}
                        </div>
                      </div>
                    </div>
                    <div className="project-copy">
                      <div className="project-copy-left" onClick={() => router.push(`/chat?id=${project._id}`)} role="button" tabIndex={0}>
                        <h3>{project.name}</h3>
                        <p>{project.currentCode ? "Generated website" : "Draft project"} · {relativeTime(project.updatedAt)}</p>
                      </div>
                      <div className="project-menu-wrap" data-project-menu>
                        <button
                          className="project-menu-trigger"
                          type="button"
                          aria-label={`Open actions for ${project.name}`}
                          aria-haspopup="menu"
                          aria-expanded={activeMenuProjectId === project._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuProjectId((current) =>
                              current === project._id ? null : project._id,
                            )
                          }}
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
              })
            )}
            </div>
          </div>

          <aside className="bento-stats">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Projects</h3>
                <span className="view-all">View All</span>
              </div>
              <div className="stat-body">
                <div className="stat-icon"><FolderKanban size={20} /></div>
                <div className="stat-value">
                  <strong>{stats.total}</strong>
                  <span>Active Projects</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card">
               <div className="stat-header">
                <h3>Generated</h3>
              </div>
              <div className="stat-body">
                <div className="stat-icon"><ShieldCheck size={20} /></div>
                <div className="stat-value">
                  <strong>{stats.generated}</strong>
                  <span>Websites</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
               <div className="stat-header">
                <h3>Drafts</h3>
              </div>
              <div className="stat-body">
                <div className="stat-icon"><Pencil size={20} /></div>
                <div className="stat-value">
                  <strong>{stats.drafts}</strong>
                  <span>In progress</span>
                </div>
              </div>
            </div>
          </aside>
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
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.1), transparent 70%),
            #060608;
          color: #f4f4f5;
          display: flex;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .sidebar {
          width: var(--sidebar-width, 88px);
          background: transparent;
          position: fixed;
          inset: 0 auto 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
          overflow: hidden;
        }
        .sidebar.expanded {
          align-items: stretch;
          padding: 24px 20px;
          background: #060608;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .brand-mark {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          background: #111116;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          margin: 0 auto;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s;
          user-select: none;
        }
        .sidebar.expanded .brand-mark {
          width: 100%;
          border-radius: 12px;
          font-size: 18px;
          letter-spacing: 0.05em;
        }
        .sidebar-nav {
          flex: 1;
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .sidebar.expanded .sidebar-nav {
          align-items: stretch;
        }
        .sidebar-link {
          text-decoration: none;
          display: block;
          width: 100%;
        }
        .nav-btn {
          background: transparent;
          border: none;
          color: #8b8b99;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          transition: color 0.2s, background 0.2s;
          width: 100%;
          white-space: nowrap;
          padding: 12px 10px;
          border-radius: 12px;
        }
        .sidebar.expanded .nav-btn {
          flex-direction: row;
          justify-content: flex-start;
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 12px;
          gap: 16px;
        }
        .nav-btn span {
          display: none;
        }
        .sidebar.expanded .nav-btn span {
          display: inline-block;
        }
        .nav-btn:hover, .nav-btn.active {
          color: #fff;
        }
        .nav-btn.active {
          background: rgba(255,255,255,0.05);
        }

        .main {
          margin-left: var(--sidebar-width, 88px);
          width: calc(100% - var(--sidebar-width, 88px));
          padding: 24px 40px 40px;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .topbar {
          display: flex;
          justify-content: space-between;
          padding-bottom: 20px;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .bell-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 6px 14px 6px 6px;
          border-radius: 999px;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }
        .avatar-small {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #eab308;
          color: #000;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 11px;
        }
        
        .welcome-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 30px 0 50px;
        }
        .welcome-section h2 {
          font-size: 36px;
          letter-spacing: -0.04em;
          font-weight: 600;
          color: #fff;
          margin: 0 0 16px;
        }
        .welcome-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
        }
        .pill-action {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .pill-action.primary {
          background: rgba(255,255,255,0.15);
        }
        
        .search-bar-wrapper {
          width: 100%;
          max-width: 600px;
          background: #fdfdfd;
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 8px 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .search-plus {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f1f5;
          color: #555;
          border: none;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .main-search {
          flex: 1;
          border: none;
          background: transparent;
          color: #000;
          padding: 0 16px;
          font-size: 15px;
          outline: none;
        }
        .main-search::placeholder {
          color: #888;
        }
        .search-send {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #000;
          color: #fff;
          border: none;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        
        .bento-grid {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          width: 100%;
        }
        
        .projects-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: #101014;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .projects-tabs {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 16px;
        }

        .tabs-left {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #8b8b99;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .browse-all {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          padding: 8px;
        }
        
        .projects-masonry {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        
        .project-card {
          background: #15151a;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.05);
          transition: transform 0.2s, border-color 0.2s;
        }
        .project-card:hover {
          border-color: rgba(196,181,253,0.5);
          transform: translateY(-2px);
        }
        @media (max-width: 1200px) {
          .projects-masonry {
             grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }
        @media (max-width: 900px) {
          .bento-grid { flex-direction: column; }
          .bento-stats { width: 100% !important; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        }
        
        .project-preview-wrap {
          cursor: pointer;
        }
        .project-preview {
          height: 240px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          background-size: cover;
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
        .medium-card .project-preview {
          height: 220px;
        }
        .project-tags {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
        }
        .visual-label {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .view-all {
          background: #fff;
          color: #000;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .project-bottom-tags {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }
        .project-bottom-tags span {
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 500;
          color: #fff;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
        }
        .project-icon-shell {
          color: #fff;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(196,181,253,0.4);
          box-shadow: 0 18px 50px rgba(0,0,0,0.28);
          backdrop-filter: blur(12px);
          border-radius: 22px;
          width: 80px;
          height: 80px;
          display: grid;
          place-items: center;
        }
        
        .project-copy {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #111116;
        }
        .project-copy-left {
          flex: 1;
          cursor: pointer;
        }
        .project-copy h3 {
          font-size: 20px;
          color: #fff;
          margin: 0 0 4px;
        }
        .project-copy p {
          color: #888;
          font-size: 13px;
          margin: 0;
        }
        
        .project-menu-wrap {
          position: relative;
        }
        .project-menu-trigger {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        
        .bento-stats {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex-shrink: 0;
        }
        .stat-card {
          background: #101014;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.24);
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .stat-header h3 {
          font-size: 16px;
          color: #fff;
          margin: 0;
        }
        .stat-body {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          display: grid;
          place-items: center;
          color: #fff;
        }
        .stat-value {
          display: flex;
          flex-direction: column;
        }
        .stat-value strong {
          font-size: 32px;
          font-weight: 500;
          color: #fff;
          line-height: 1;
        }
        .stat-value span {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
        
        /* Modal and Profile Styles */
        .profile-panel {
          position: absolute;
          top: 84px;
          right: 40px;
          z-index: 30;
          width: min(340px, calc(100vw - 108px));
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 16px;
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
          color: #000;
          font-weight: 800;
          background: #eab308;
          box-shadow: 0 0 24px rgba(234,179,8,0.26);
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
        .profile-summary { margin-bottom: 16px; }
        .profile-summary h2 { font-size: 22px; color: #fff; letter-spacing: -0.03em; margin-bottom: 8px; }
        .profile-summary span { display: inline-flex; align-items: center; gap: 7px; color: #c9c9d4; font-size: 13px; }
        .profile-details { display: grid; gap: 10px; margin-bottom: 16px; }
        .profile-details > div {
          display: flex; align-items: flex-start; gap: 10px; padding: 11px;
          border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
          background: rgba(255,255,255,0.065); color: #c4b5fd;
        }
        .profile-details span { display: grid; gap: 2px; color: #c4c4cf; font-size: 12px; }
        .profile-details strong { color: #f4f4f5; font-size: 13px; font-weight: 700; word-break: break-word; }
        .profile-logout {
          width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          border: 1px solid rgba(248,113,113,0.28); border-radius: 8px;
          background: rgba(239,68,68,0.12); color: #fecaca; padding: 10px 12px;
          cursor: pointer; font-weight: 800;
        }
        .profile-logout:hover { background: rgba(239,68,68,0.18); color: #fff; }
        
        .empty-state {
          min-height: 320px;
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #f4f4f5;
          text-align: center;
          padding: 24px;
          background: rgba(255,255,255,0.03);
          grid-column: span 2;
        }
        .empty-state p { color: #888; max-width: 420px; line-height: 1.5; }
        .empty-mark {
          width: 44px; height: 44px; border-radius: 8px; display: grid; place-items: center;
          background: rgba(124,58,237,0.18); color: #c4b5fd; border: 1px solid rgba(167,139,250,0.28);
        }
        .primary-btn {
          border: 1px solid rgba(255,255,255,0.14); border-radius: 8px; background: #7C3AED; color: #fff;
          padding: 12px 18px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center;
          justify-content: center; gap: 8px; box-shadow: 0 0 28px rgba(124,58,237,0.32);
        }
        
        .project-menu {
          position: absolute; right: 0; bottom: calc(100% + 8px); z-index: 5;
          width: 150px; padding: 6px; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
          background: rgba(16,16,20,0.98); box-shadow: 0 18px 48px rgba(0,0,0,0.48); backdrop-filter: blur(16px);
        }
        .project-menu button {
          width: 100%; justify-content: flex-start; border: none; background: transparent;
          color: #fff; padding: 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px;
        }
        .project-menu button:hover { background: rgba(255,255,255,0.1); }
        .project-menu .danger { color: #f87171; }
        .project-menu .danger:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }

        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: grid; place-items: center; padding: 20px; z-index: 100;
        }
        .modal {
          width: min(440px, 100%); border: 1px solid rgba(255,255,255,0.18); border-radius: 12px;
          background: #101014; padding: 22px; box-shadow: 0 24px 80px rgba(0,0,0,0.55);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { margin: 0; color: #fff; }
        .modal-header button {
          width: 30px; height: 30px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09); color: #f4f4f5; cursor: pointer;
        }
        label { display: grid; gap: 8px; color: #d4d4d8; font-size: 13px; }
        input {
          width: 100%; border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
          background: #111116; color: #fff; padding: 12px 13px; font-size: 14px; outline: none;
        }
        input:focus { border-color: rgba(124,58,237,0.7); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
        .modal-actions button {
          border: 1px solid rgba(255,255,255,0.2); border-radius: 7px; background: rgba(255,255,255,0.09);
          color: #f4f4f5; padding: 9px 16px; cursor: pointer; font-weight: 650;
        }
        .modal-actions .primary-btn { border: 0; background: #7c3aed; color: #fff; }
        
        .delete-modal { display: grid; gap: 16px; }
        .delete-icon {
          width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; color: #fecaca;
          border: 1px solid rgba(248,113,113,0.28); background: rgba(239,68,68,0.12);
        }
        .delete-copy h2 { color: #fff; font-size: 24px; letter-spacing: -0.03em; margin: 0 0 8px; }
        .delete-copy p { color: #c4c4cf; line-height: 1.55; margin: 0; }
        .delete-copy strong { color: #fff; font-weight: 800; }
        .confirm-delete-btn { color: #fecaca !important; border-color: rgba(248,113,113,0.3) !important; background: rgba(239,68,68,0.14) !important; }

        .error-text { color: #f87171; font-size: 13px; }
        .eyebrow { color: #b9b3cf; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px; }
      `}</style>
    </div>
  );
}
