import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import ProjectCard from "../components/ProjectCard";
import { createProject, listProjects, type ProjectSummary } from "../services/projectsAPI";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  thumbnail?: string;
}

interface Generation {
  id: string;
  image: string;
  style: string;
  date: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function summaryToProject(s: ProjectSummary): Project {
  return {
    id: s.project_id,
    title: s.project_name,
    description: s.project_description ?? undefined,
    createdDate: formatDate(s.project_creation_time),
    updatedDate: formatDate(s.project_last_updated),
    thumbnail: s.latest_output_image ?? undefined,
  };
}

function summaryToFakeGenerations(s: ProjectSummary): Generation[] {
  // We don't fetch every generation for the listing — we synthesize a minimal
  // array so the card can render the count badge, thumbnail, and the
  // shared-style tag (when the backend says all generations share one style).
  if (s.generation_count <= 0) return [];
  const placeholder: Generation = {
    id: `${s.project_id}-latest`,
    image: s.latest_output_image ?? "",
    style: s.shared_style ?? "",
    date: s.project_last_updated,
  };
  const others: Generation[] = Array.from({ length: Math.max(0, s.generation_count - 1) }, (_, i) => ({
    id: `${s.project_id}-${i}`,
    image: "",
    style: s.shared_style ?? "",
    date: s.project_last_updated,
  }));
  return [placeholder, ...others];
}

function Projects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [summaries, setSummaries] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listProjects();
        if (!cancelled) setSummaries(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load projects");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const projects = useMemo(() => summaries.map(summaryToProject), [summaries]);
  const generationsByProject = useMemo(() => {
    const map: Record<string, Generation[]> = {};
    summaries.forEach((s) => {
      map[s.project_id] = summaryToFakeGenerations(s);
    });
    return map;
  }, [summaries]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? projects.filter((p) => p.title.toLowerCase().includes(q))
      : projects;
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updatedDate).getTime();
      const dateB = new Date(b.updatedDate).getTime();
      return dateB - dateA;
    });
  }, [projects, searchQuery]);

  const handleCreateProject = async () => {
    const name = projectName.trim();
    if (!name) return;
    try {
      const created = await createProject({
        project_name: name,
        project_description: projectDescription.trim() || undefined,
      });
      setSummaries((prev) => [created, ...prev]);
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setProjectName("");
    setProjectDescription("");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const hasProjects = !isLoading && projects.length > 0;

  return (
    <Layout hideFooter>
      <style>{`
        .projects-page {
          width: 100%;
          min-height: 100vh;
          background-color: var(--color-bg-base);
          color: var(--color-text-primary);
        }
        .projects-page__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 64px;
        }
        .projects-page__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .projects-page__title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: var(--color-text-primary);
        }
        .projects-page__controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: flex-end;
          min-width: 0;
        }
        .projects-page__search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          flex: 1;
          max-width: 360px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .projects-page__search:focus-within {
          border-color: var(--color-brand-primary);
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        .projects-page__search svg {
          width: 16px;
          height: 16px;
          color: var(--color-text-tertiary);
          flex-shrink: 0;
        }
        .projects-page__search input {
          border: none;
          outline: none;
          background-color: transparent;
          background-image: none;
          -webkit-appearance: none;
          appearance: none;
          flex: 1;
          font-size: 14px;
          color: var(--color-text-primary);
          font-family: inherit;
          min-width: 0;
        }
        .projects-page__search input::placeholder {
          color: var(--color-text-tertiary);
          opacity: 1;
        }
        .projects-page__search input:-webkit-autofill,
        .projects-page__search input:-webkit-autofill:hover,
        .projects-page__search input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--color-text-primary);
          -webkit-box-shadow: 0 0 0 1000px var(--color-bg-surface) inset;
          caret-color: var(--color-text-primary);
          transition: background-color 9999s ease-out, color 9999s ease-out;
        }
        .projects-page__new {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          background-color: var(--color-brand-primary);
          color: var(--color-text-inverse);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .projects-page__new:hover {
          background-color: var(--color-brand-dark);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .projects-page__new:active {
          transform: translateY(0);
        }
        .projects-page__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .projects-page__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .projects-page__grid {
            grid-template-columns: 1fr;
          }
          .projects-page__header {
            flex-direction: column;
            align-items: stretch;
          }
          .projects-page__controls {
            justify-content: stretch;
          }
          .projects-page__search {
            max-width: none;
          }
        }
        .projects-page__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          background-color: var(--color-bg-surface);
          border: 1px dashed var(--color-border-subtle);
          border-radius: 16px;
        }
        .projects-page__empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: var(--color-bg-elevated);
          color: var(--color-text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .projects-page__empty-icon svg {
          width: 38px;
          height: 38px;
        }
        .projects-page__empty-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px;
          color: var(--color-text-primary);
        }
        .projects-page__empty-subtext {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0 0 24px;
          max-width: 360px;
          line-height: 1.5;
        }
        .projects-modal__overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        .projects-modal {
          background-color: var(--color-bg-surface);
          border: 1px solid var(--color-border-subtle);
          border-radius: 14px;
          box-shadow: var(--shadow-lg);
          padding: 28px;
          max-width: 440px;
          width: 92%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .projects-modal__title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }
        .projects-modal__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .projects-modal__label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .projects-modal__input,
        .projects-modal__textarea {
          padding: 11px 14px;
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          color: var(--color-text-primary);
          background-color: var(--color-bg-base);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .projects-modal__input:focus,
        .projects-modal__textarea:focus {
          border-color: var(--color-brand-primary);
          box-shadow: 0 0 0 3px var(--color-focus-ring);
        }
        .projects-modal__textarea {
          min-height: 80px;
          resize: vertical;
        }
        .projects-modal__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 4px;
        }
        .projects-modal__btn {
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .projects-modal__btn--cancel {
          background-color: transparent;
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-subtle);
        }
        .projects-modal__btn--cancel:hover {
          background-color: var(--color-bg-elevated);
        }
        .projects-modal__btn--primary {
          background-color: var(--color-brand-primary);
          color: var(--color-text-inverse);
          border: none;
        }
        .projects-modal__btn--primary:hover {
          background-color: var(--color-brand-dark);
        }
        .projects-modal__btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="projects-page">
        <div className="projects-page__inner">
          <header className="projects-page__header">
            <h1 className="projects-page__title">My Projects</h1>
            <div className="projects-page__controls">
              <div className="projects-page__search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  placeholder="Search your projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search projects"
                />
              </div>
              <button
                className="projects-page__new"
                onClick={() => setShowCreateModal(true)}
                aria-label="Create new project"
              >
                <span aria-hidden="true">+</span>
                New Project
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="projects-page__empty">
              <p className="projects-page__empty-subtext">Loading projects…</p>
            </div>
          ) : hasProjects ? (
            filteredProjects.length > 0 ? (
              <div className="projects-page__grid">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    generations={generationsByProject[project.id] ?? []}
                    onClick={handleProjectClick}
                  />
                ))}
              </div>
            ) : (
              <div className="projects-page__empty">
                <div className="projects-page__empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>
                <h2 className="projects-page__empty-title">No matches</h2>
                <p className="projects-page__empty-subtext">
                  No projects match "{searchQuery}". Try a different search.
                </p>
              </div>
            )
          ) : (
            <div className="projects-page__empty">
              <div className="projects-page__empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12 12 4l9 8" />
                  <path d="M5 10v10h14V10" />
                  <path d="M10 20v-6h4v6" />
                </svg>
              </div>
              <h2 className="projects-page__empty-title">No projects yet</h2>
              <p className="projects-page__empty-subtext">
                Create a project to start organizing your room redesigns.
              </p>
              <button
                className="projects-page__new"
                onClick={() => setShowCreateModal(true)}
              >
                <span aria-hidden="true">+</span>
                New Project
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="projects-modal__overlay" onClick={closeModal}>
          <div className="projects-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="projects-modal__title">New Project</h2>

            <div className="projects-modal__field">
              <label className="projects-modal__label" htmlFor="project-name">Name</label>
              <input
                id="project-name"
                type="text"
                className="projects-modal__input"
                placeholder="e.g. Living room refresh"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                autoFocus
              />
            </div>

            <div className="projects-modal__field">
              <label className="projects-modal__label" htmlFor="project-description">
                Description <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(optional)</span>
              </label>
              <textarea
                id="project-description"
                className="projects-modal__textarea"
                placeholder="What is this project about?"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div className="projects-modal__actions">
              <button className="projects-modal__btn projects-modal__btn--cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="projects-modal__btn projects-modal__btn--primary"
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Projects;
