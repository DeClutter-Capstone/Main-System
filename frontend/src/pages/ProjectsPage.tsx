import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { generationCardStyles } from "../components/GenerationCard";
import {
  assignGeneration,
  clearProjectThumbnail,
  createGroup as apiCreateGroup,
  deleteGeneration as apiDeleteGeneration,
  deleteGroup as apiDeleteGroup,
  deleteProject as apiDeleteProject,
  getProject,
  renameGroup as apiRenameGroup,
  updateGeneration,
  updateProject,
  uploadProjectThumbnail,
  type GenerationDTO,
  type GroupDTO,
  type ProjectDetail,
} from "../services/projectsAPI";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  thumbnail?: string;
  // Path to a user-uploaded thumbnail (null/undefined when using auto-fallback).
  customThumbnail?: string;
}

interface Generation {
  id: string;
  image: string;
  originalImage?: string;
  style: string;
  displayName?: string;
  fileKey?: string;
  roomType?: string;
  date: string;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
}

type Tab = "all" | "groups";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function detailToProject(d: ProjectDetail): Project {
  return {
    id: d.project_id,
    title: d.project_name,
    description: d.project_description ?? undefined,
    createdDate: formatDate(d.project_creation_time),
    updatedDate: formatDate(d.project_last_updated),
    customThumbnail: d.thumbnail_image_path ?? undefined,
  };
}

function dtoToGeneration(g: GenerationDTO): Generation {
  return {
    id: g.transformation_id,
    image: g.output_image_path ?? "",
    originalImage: g.input_image_path ?? undefined,
    style: g.style_name,
    displayName: g.display_name ?? undefined,
    fileKey: g.file_key ?? undefined,
    roomType: g.room_type,
    date: g.created_at,
    groupId: g.group_id ?? undefined,
  };
}

function autoName(gen: Generation): string {
  // Fallback when no custom display_name: same auto-name History uses
  // (e.g. "industrial_bedroom_001"), and finally the style name if even
  // that's missing on legacy rows.
  return gen.fileKey ?? gen.style;
}

function dtoToGroup(g: GroupDTO): Group {
  return { id: g.group_id, name: g.group_name };
}

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "");
}

async function downloadImage(url: string, baseName: string) {
  // `cache: "no-store"` forces a fresh CORS request so we don't get a
  // previously-cached opaque <img> response (which would have no CORS
  // headers and silently fail the .blob() call for some images).
  const res = await fetch(url, { mode: "cors", cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] || "png";
  const safe = sanitizeFilename(baseName) || "redesign";
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${safe}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

const ProjectsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | undefined>(undefined);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  // Thumbnail editing state for the modal:
  //   pendingFile  → a newly-picked File ready to upload on save
  //   removeCustom → user clicked "Use latest generation" to clear the existing upload
  //   previewUrl   → object URL of the pending file, for the modal preview
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null);
  const [removeCustomThumbnail, setRemoveCustomThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [renamingGenId, setRenamingGenId] = useState<string | null>(null);
  const [genDraftName, setGenDraftName] = useState("");
  const genNameInputRef = useRef<HTMLInputElement>(null);

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [renamingGroup, setRenamingGroup] = useState<{ id: string; name: string } | null>(null);
  const [groupMenuOpenFor, setGroupMenuOpenFor] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [cardMenuOpenFor, setCardMenuOpenFor] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!projectId) return;
    try {
      const detail = await getProject(projectId);
      setProject(detailToProject(detail));
      setGenerations(detail.generations.map(dtoToGeneration));
      setGroups(detail.groups.map(dtoToGroup));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load project");
    }
  }, [projectId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Close menus when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-root]")) {
        setCardMenuOpenFor(null);
        setGroupMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus the inline name input when entering edit mode
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Focus the generation rename input when it appears
  useEffect(() => {
    if (renamingGenId && genNameInputRef.current) {
      genNameInputRef.current.focus();
      genNameInputRef.current.select();
    }
  }, [renamingGenId]);

  const sortedGenerations = useMemo(
    () =>
      [...generations].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [generations],
  );

  const groupedView = useMemo(() => {
    const map: Record<string, Generation[]> = {};
    groups.forEach((g) => {
      map[g.id] = [];
    });
    sortedGenerations.forEach((gen) => {
      if (gen.groupId && map[gen.groupId]) {
        map[gen.groupId].push(gen);
      }
    });
    return map;
  }, [sortedGenerations, groups]);

  // ─── Project actions ──────────────────────────────────────
  const startInlineNameEdit = () => {
    if (!project) return;
    setDraftName(project.title);
    setIsEditingName(true);
  };

  const commitInlineNameEdit = async () => {
    if (!project) return;
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== project.title) {
      const previous = project;
      setProject({ ...project, title: trimmed });
      try {
        await updateProject(project.id, { project_name: trimmed });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to rename project");
        setProject(previous);
      }
    }
    setIsEditingName(false);
  };

  const cancelInlineNameEdit = () => {
    setIsEditingName(false);
    setDraftName("");
  };

  const resetThumbnailEditState = () => {
    if (editThumbnailPreview) URL.revokeObjectURL(editThumbnailPreview);
    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setRemoveCustomThumbnail(false);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const openEditModal = () => {
    if (!project) return;
    setEditName(project.title);
    setEditDescription(project.description ?? "");
    resetThumbnailEditState();
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetThumbnailEditState();
  };

  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    if (editThumbnailPreview) URL.revokeObjectURL(editThumbnailPreview);
    setEditThumbnailFile(file);
    setEditThumbnailPreview(URL.createObjectURL(file));
    setRemoveCustomThumbnail(false);
  };

  const handleRemoveThumbnail = () => {
    if (editThumbnailPreview) URL.revokeObjectURL(editThumbnailPreview);
    setEditThumbnailFile(null);
    setEditThumbnailPreview(null);
    setRemoveCustomThumbnail(true);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const saveEditModal = async () => {
    if (!project || !editName.trim()) return;
    try {
      await updateProject(project.id, {
        project_name: editName.trim(),
        project_description: editDescription.trim() || undefined,
      });
      // Thumbnail changes go through dedicated endpoints (multipart upload
      // or DELETE), not the JSON update route.
      if (editThumbnailFile) {
        await uploadProjectThumbnail(project.id, editThumbnailFile);
      } else if (removeCustomThumbnail && project.customThumbnail) {
        await clearProjectThumbnail(project.id);
      }
      closeEditModal();
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await apiDeleteProject(project.id);
      navigate("/projects");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const handleAddGeneration = () => {
    navigate("/generate", { state: { project } });
  };

  // ─── Generation actions ──────────────────────────────────
  const startGenRename = (gen: Generation) => {
    setRenamingGenId(gen.id);
    // Pre-fill with the current name (custom or auto) so the user can tweak
    // rather than re-type from scratch.
    setGenDraftName(gen.displayName ?? autoName(gen));
    setCardMenuOpenFor(null);
  };

  const cancelGenRename = () => {
    setRenamingGenId(null);
    setGenDraftName("");
  };

  const commitGenRename = async () => {
    if (!renamingGenId) return;
    const trimmed = genDraftName.trim();
    const target = generations.find((g) => g.id === renamingGenId);
    if (!target) {
      cancelGenRename();
      return;
    }
    const next = trimmed || undefined;
    if (next === (target.displayName ?? undefined)) {
      cancelGenRename();
      return;
    }
    const previous = generations;
    setGenerations(
      generations.map((g) =>
        g.id === renamingGenId ? { ...g, displayName: next } : g,
      ),
    );
    setRenamingGenId(null);
    setGenDraftName("");
    try {
      await updateGeneration(target.id, { display_name: trimmed || null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename generation");
      setGenerations(previous);
    }
  };

  const handleRegenerate = (gen: Generation) => {
    navigate("/generate", {
      state: {
        project,
        regenerateFrom: {
          image: gen.image,
          roomType: gen.roomType,
        },
      },
    });
  };

  const handleDeleteGeneration = async (genId: string) => {
    if (!projectId) return;
    if (!window.confirm("Delete this generation?")) return;
    const previous = generations;
    setGenerations(generations.filter((g) => g.id !== genId));
    try {
      await apiDeleteGeneration(genId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete generation");
      setGenerations(previous);
    }
  };

  const handleDownloadGeneration = async (gen: Generation) => {
    if (!gen.image) {
      toast.error("No image to download");
      return;
    }
    // Prefer the custom name, then the History-style auto-name, then the style.
    const baseName =
      gen.displayName?.trim() ||
      gen.fileKey ||
      `${gen.style.toLowerCase()}-${gen.id.slice(0, 8)}`;
    try {
      await downloadImage(gen.image, baseName);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Could not download image");
    }
  };

  const handleMoveToGroup = async (genId: string, groupId: string | undefined) => {
    if (!projectId) return;
    setCardMenuOpenFor(null);
    const previous = generations;
    setGenerations(generations.map((g) => (g.id === genId ? { ...g, groupId } : g)));
    try {
      await assignGeneration(genId, { project_id: projectId, group_id: groupId ?? null });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move generation");
      setGenerations(previous);
    }
  };

  // ─── Group actions ───────────────────────────────────────
  const handleCreateGroup = async (assignTo?: string) => {
    if (!projectId || !newGroupName.trim()) return;
    try {
      const newGroup = await apiCreateGroup(projectId, newGroupName.trim());
      const group: Group = { id: newGroup.group_id, name: newGroup.group_name };
      setGroups((prev) => [...prev, group]);
      setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
      if (assignTo) {
        setGenerations((prev) => prev.map((g) => (g.id === assignTo ? { ...g, groupId: group.id } : g)));
        try {
          await assignGeneration(assignTo, { project_id: projectId, group_id: group.id });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed to assign generation to new group");
        }
      }
      setNewGroupName("");
      setShowNewGroupModal(false);
      setCardMenuOpenFor(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  const handleRenameGroup = async () => {
    if (!projectId || !renamingGroup || !renamingGroup.name.trim()) return;
    const trimmed = renamingGroup.name.trim();
    const previous = groups;
    setGroups(groups.map((g) => (g.id === renamingGroup.id ? { ...g, name: trimmed } : g)));
    setRenamingGroup(null);
    try {
      await apiRenameGroup(projectId, renamingGroup.id, trimmed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rename group");
      setGroups(previous);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!projectId) return;
    if (!window.confirm("Delete this group? Generations will be kept but unassigned.")) return;
    const previousGroups = groups;
    const previousGens = generations;
    setGroups(groups.filter((g) => g.id !== groupId));
    setGenerations(generations.map((g) => (g.groupId === groupId ? { ...g, groupId: undefined } : g)));
    setGroupMenuOpenFor(null);
    try {
      await apiDeleteGroup(projectId, groupId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete group");
      setGroups(previousGroups);
      setGenerations(previousGens);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !(prev[groupId] ?? true) }));
  };

  // ─── Render helpers ──────────────────────────────────────
  const renderGenerationCard = (gen: Generation) => {
    const menuOpen = cardMenuOpenFor === gen.id;
    const isRenaming = renamingGenId === gen.id;
    const displayLabel = gen.displayName ?? autoName(gen);
    return (
      <article key={gen.id} className="gen-card">
        <div className="gen-card__image">
          <img src={gen.image} alt={`${displayLabel} redesign`} />
          <div className="gen-card__menu" data-menu-root>
            <button
              className="gen-card__menu-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setCardMenuOpenFor(menuOpen ? null : gen.id);
              }}
              aria-label="Card options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {menuOpen && (
              <div className="gen-card__menu-list" role="menu">
                <button
                  className="gen-card__menu-item"
                  onClick={() => startGenRename(gen)}
                >
                  Rename
                </button>
                <div className="gen-card__menu-divider" />
                <div className="gen-card__menu-label">Move to group</div>
                {groups.length === 0 && (
                  <div className="gen-card__menu-empty">No groups yet</div>
                )}
                {groups.map((g) => (
                  <button
                    key={g.id}
                    className="gen-card__menu-item"
                    onClick={() => handleMoveToGroup(gen.id, g.id)}
                    disabled={gen.groupId === g.id}
                  >
                    {gen.groupId === g.id ? "✓ " : ""}{g.name}
                  </button>
                ))}
                <div className="gen-card__menu-divider" />
                <button
                  className="gen-card__menu-item"
                  onClick={() => {
                    setCardMenuOpenFor(null);
                    setNewGroupName("");
                    setShowNewGroupModal(true);
                  }}
                >
                  + Create new group
                </button>
                {gen.groupId && (
                  <button
                    className="gen-card__menu-item"
                    onClick={() => handleMoveToGroup(gen.id, undefined)}
                  >
                    Remove from group
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="gen-card__body">
          {isRenaming ? (
            <input
              ref={genNameInputRef}
              className="gen-card__name-input"
              value={genDraftName}
              onChange={(e) => setGenDraftName(e.target.value)}
              onBlur={commitGenRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitGenRename();
                if (e.key === "Escape") cancelGenRename();
              }}
              placeholder="Name this generation…"
              aria-label="Generation name"
            />
          ) : (
            <button
              className="gen-card__name"
              onClick={() => startGenRename(gen)}
              title="Click to rename"
            >
              <span
                className={`gen-card__name-text${gen.displayName ? "" : " gen-card__name-text--auto"}`}
              >
                {displayLabel}
              </span>
              <svg className="gen-card__name-pencil" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          )}
          <div className="gen-card__meta">
            <span className="gen-card__style">{gen.style}</span>
            <span className="gen-card__date">{gen.date}</span>
          </div>
          <div className="gen-card__actions">
            <button
              className="gen-card__icon-btn"
              onClick={() => handleRegenerate(gen)}
              aria-label="Regenerate using this image"
              title="Regenerate"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-3-6.7" />
                <path d="M21 4v5h-5" />
              </svg>
            </button>
            <button
              className="gen-card__icon-btn"
              onClick={() => handleDownloadGeneration(gen)}
              aria-label="Download image"
              title="Download"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </button>
            <button
              className="gen-card__icon-btn gen-card__icon-btn--danger"
              onClick={() => handleDeleteGeneration(gen.id)}
              aria-label="Delete generation"
              title="Delete"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    );
  };

  // ─── Render ──────────────────────────────────────────────
  if (!project) {
    return (
      <Layout hideFooter>
        <div className="pp-page">
          <div className="pp-page__inner">
            <p className="pp-empty-text">Project not found.</p>
            <button className="pp-btn pp-btn--primary" onClick={() => navigate("/projects")}>
              Back to projects
            </button>
          </div>
        </div>
        <style>{baseStyles}</style>
        <style>{generationCardStyles}</style>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <style>{baseStyles}</style>
      <style>{generationCardStyles}</style>
      <div className="pp-page">
        <div className="pp-page__inner">
          {/* ─── Header ─── */}
          <header className="pp-header">
            <div className="pp-header__title-block">
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  className="pp-title-input"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitInlineNameEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitInlineNameEdit();
                    if (e.key === "Escape") cancelInlineNameEdit();
                  }}
                  aria-label="Project name"
                />
              ) : (
                <h1
                  className="pp-title"
                  onClick={startInlineNameEdit}
                  title="Click to rename"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startInlineNameEdit();
                  }}
                >
                  {project.title}
                </h1>
              )}
              <div className="pp-meta">
                <span>Created {project.createdDate}</span>
                <span className="pp-meta__dot">·</span>
                <span>Updated {project.updatedDate}</span>
                <span className="pp-meta__dot">·</span>
                <span>{generations.length} {generations.length === 1 ? "generation" : "generations"}</span>
              </div>
            </div>
            <div className="pp-header__actions">
              <button className="pp-btn pp-btn--primary" onClick={handleAddGeneration}>
                <span aria-hidden="true">+</span> Add Generation
              </button>
              <button className="pp-btn pp-btn--outline" onClick={openEditModal}>
                Edit Project
              </button>
              <button className="pp-btn pp-btn--danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            </div>
          </header>

          {/* ─── Tabs ─── */}
          <div className="pp-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "all"}
              className={`pp-tab ${activeTab === "all" ? "pp-tab--active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
              <span className="pp-tab__count">{generations.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "groups"}
              className={`pp-tab ${activeTab === "groups" ? "pp-tab--active" : ""}`}
              onClick={() => setActiveTab("groups")}
            >
              Groups
              <span className="pp-tab__count">{groups.length}</span>
            </button>
          </div>

          {/* ─── Tab content ─── */}
          {activeTab === "all" ? (
            sortedGenerations.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="1.5" />
                    <path d="m3 17 5-5 5 5 4-4 4 4" />
                  </svg>
                </div>
                <h3 className="pp-empty__title">No generations yet</h3>
                <p className="pp-empty__subtext">
                  Generate a redesign and assign it to this project to get started.
                </p>
                <button className="pp-btn pp-btn--primary" onClick={handleAddGeneration}>
                  <span aria-hidden="true">+</span> Add Generation
                </button>
              </div>
            ) : (
              <div className="pp-grid">
                {sortedGenerations.map(renderGenerationCard)}
              </div>
            )
          ) : (
            <div className="pp-groups">
              <div className="pp-groups__header">
                <span className="pp-groups__hint">
                  {groups.length === 0
                    ? "Create groups to organize related generations"
                    : "Click a group to expand or collapse"}
                </span>
                <button
                  className="pp-btn pp-btn--primary pp-btn--small"
                  onClick={() => {
                    setNewGroupName("");
                    setShowNewGroupModal(true);
                  }}
                >
                  <span aria-hidden="true">+</span> New Group
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="pp-empty">
                  <div className="pp-empty__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <h3 className="pp-empty__title">No groups yet</h3>
                  <p className="pp-empty__subtext">Use groups to organize generations by room, mood, or anything else.</p>
                </div>
              ) : (
                <div className="pp-groups__list">
                  {groups.map((group) => {
                    const groupGens = groupedView[group.id] ?? [];
                    const expanded = expandedGroups[group.id] ?? true;
                    const menuOpen = groupMenuOpenFor === group.id;
                    return (
                      <section key={group.id} className="pp-group">
                        <header className="pp-group__header">
                          <button
                            className="pp-group__toggle"
                            onClick={() => toggleGroupExpansion(group.id)}
                            aria-expanded={expanded}
                          >
                            <svg
                              className="pp-group__chevron"
                              style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                              <polyline points="9 6 15 12 9 18" />
                            </svg>
                            <span className="pp-group__name">{group.name}</span>
                            <span className="pp-group__count">{groupGens.length}</span>
                          </button>
                          <div className="pp-group__menu" data-menu-root>
                            <button
                              className="pp-group__kebab"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGroupMenuOpenFor(menuOpen ? null : group.id);
                              }}
                              aria-label="Group options"
                              aria-haspopup="menu"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </button>
                            {menuOpen && (
                              <div className="pp-group__menu-list" role="menu">
                                <button
                                  className="pp-group__menu-item"
                                  onClick={() => {
                                    setRenamingGroup({ id: group.id, name: group.name });
                                    setGroupMenuOpenFor(null);
                                  }}
                                >
                                  Rename
                                </button>
                                <button
                                  className="pp-group__menu-item pp-group__menu-item--danger"
                                  onClick={() => handleDeleteGroup(group.id)}
                                >
                                  Delete group
                                </button>
                              </div>
                            )}
                          </div>
                        </header>
                        {expanded && (
                          groupGens.length === 0 ? (
                            <div className="pp-group__empty">
                              No generations in this group yet. Use a generation's menu in the All tab to move it here.
                            </div>
                          ) : (
                            <div className="pp-grid pp-grid--in-group">
                              {groupGens.map(renderGenerationCard)}
                            </div>
                          )
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Edit Project Modal ─── */}
      {showEditModal && (
        <div className="pp-modal__overlay" onClick={() => setShowEditModal(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pp-modal__title">Edit Project</h2>
            <div className="pp-modal__field">
              <label className="pp-modal__label" htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                className="pp-modal__input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEditModal()}
              />
            </div>
            <div className="pp-modal__field">
              <label className="pp-modal__label" htmlFor="edit-desc">
                Description <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(optional)</span>
              </label>
              <textarea
                id="edit-desc"
                className="pp-modal__textarea"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            {(() => {
              // Decide which image to show in the preview:
              //  1. The pending pick (file the user just chose)
              //  2. Cleared → render the "Latest" placeholder
              //  3. The existing custom upload
              //  4. Default → "Latest" placeholder
              const showsCustom =
                editThumbnailPreview != null ||
                (!removeCustomThumbnail && project?.customThumbnail);
              const previewSrc =
                editThumbnailPreview ??
                (removeCustomThumbnail ? undefined : project?.customThumbnail);
              return (
                <div className="pp-modal__field">
                  <label className="pp-modal__label">
                    Thumbnail{" "}
                    <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>
                      (defaults to the latest generation)
                    </span>
                  </label>
                  <div className="pp-thumb-upload">
                    <div className="pp-thumb-upload__preview" aria-hidden="true">
                      {showsCustom && previewSrc ? (
                        <img src={previewSrc} alt="Thumbnail preview" />
                      ) : (
                        <div className="pp-thumb-upload__placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="12 6 12 12 16 14" />
                            <circle cx="12" cy="12" r="9" />
                          </svg>
                          <span>Latest</span>
                        </div>
                      )}
                    </div>
                    <div className="pp-thumb-upload__controls">
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="pp-btn pp-btn--outline pp-btn--small"
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        {showsCustom ? "Replace image" : "Upload image"}
                      </button>
                      {showsCustom && (
                        <button
                          type="button"
                          className="pp-btn pp-btn--danger pp-btn--small"
                          onClick={handleRemoveThumbnail}
                        >
                          Use latest generation
                        </button>
                      )}
                      <p className="pp-thumb-upload__hint">
                        PNG, JPG, or WebP. Up to 5&nbsp;MB.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pp-modal__actions">
              <button className="pp-btn pp-btn--outline" onClick={closeEditModal}>
                Cancel
              </button>
              <button
                className="pp-btn pp-btn--primary"
                onClick={saveEditModal}
                disabled={!editName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── New Group Modal ─── */}
      {showNewGroupModal && (
        <div className="pp-modal__overlay" onClick={() => setShowNewGroupModal(false)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pp-modal__title">New Group</h2>
            <div className="pp-modal__field">
              <label className="pp-modal__label" htmlFor="new-group">Group name</label>
              <input
                id="new-group"
                className="pp-modal__input"
                placeholder="e.g. Final picks"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                autoFocus
              />
            </div>
            <div className="pp-modal__actions">
              <button className="pp-btn pp-btn--outline" onClick={() => setShowNewGroupModal(false)}>
                Cancel
              </button>
              <button
                className="pp-btn pp-btn--primary"
                onClick={() => handleCreateGroup()}
                disabled={!newGroupName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rename Group Modal ─── */}
      {renamingGroup && (
        <div className="pp-modal__overlay" onClick={() => setRenamingGroup(null)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pp-modal__title">Rename Group</h2>
            <div className="pp-modal__field">
              <label className="pp-modal__label" htmlFor="rename-group">Group name</label>
              <input
                id="rename-group"
                className="pp-modal__input"
                value={renamingGroup.name}
                onChange={(e) => setRenamingGroup({ ...renamingGroup, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleRenameGroup()}
                autoFocus
              />
            </div>
            <div className="pp-modal__actions">
              <button className="pp-btn pp-btn--outline" onClick={() => setRenamingGroup(null)}>
                Cancel
              </button>
              <button
                className="pp-btn pp-btn--primary"
                onClick={handleRenameGroup}
                disabled={!renamingGroup.name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

const baseStyles = `
  .pp-page {
    width: 100%;
    min-height: 100vh;
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
  }
  .pp-page__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 32px 24px 80px;
  }

  /* Header */
  .pp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }
  .pp-header__title-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .pp-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.2;
    cursor: text;
    padding: 2px 4px;
    margin-left: -4px;
    border-radius: 6px;
    transition: background-color 0.15s ease;
    outline: none;
  }
  .pp-title:hover {
    background-color: var(--color-bg-elevated);
  }
  .pp-title:focus-visible {
    background-color: var(--color-bg-elevated);
    box-shadow: 0 0 0 3px var(--color-focus-ring);
  }
  .pp-title-input {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-text-primary);
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-brand-primary);
    border-radius: 6px;
    padding: 2px 6px;
    margin-left: -7px;
    font-family: inherit;
    outline: none;
    box-shadow: 0 0 0 3px var(--color-focus-ring);
    max-width: 600px;
    width: 100%;
  }
  .pp-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  .pp-meta__dot {
    color: var(--color-text-tertiary);
  }
  .pp-header__actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  /* Buttons */
  .pp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    line-height: 1;
  }
  .pp-btn--small {
    padding: 7px 12px;
    font-size: 13px;
  }
  .pp-btn--primary {
    background-color: var(--color-brand-primary);
    color: var(--color-text-inverse);
    border: 1px solid var(--color-brand-primary);
  }
  .pp-btn--primary:hover:not(:disabled) {
    background-color: var(--color-brand-dark);
    border-color: var(--color-brand-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  .pp-btn--primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .pp-btn--outline {
    background-color: transparent;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-subtle);
  }
  .pp-btn--outline:hover:not(:disabled) {
    background-color: var(--color-bg-elevated);
    border-color: var(--color-text-secondary);
  }
  .pp-btn--danger {
    background-color: transparent;
    color: var(--color-danger);
    border: 1px solid var(--color-border-subtle);
  }
  .pp-btn--danger:hover:not(:disabled) {
    background-color: var(--color-danger-soft);
    border-color: var(--color-danger);
  }

  /* Tabs */
  .pp-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    border-bottom: 1px solid var(--color-border-subtle);
    margin-bottom: 24px;
  }
  .pp-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .pp-tab:hover {
    color: var(--color-text-primary);
  }
  .pp-tab--active {
    color: var(--color-brand-primary);
    border-bottom-color: var(--color-brand-primary);
  }
  .pp-tab__count {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background-color: var(--color-bg-elevated);
    border-radius: 999px;
  }
  .pp-tab--active .pp-tab__count {
    color: var(--color-brand-primary);
    background-color: var(--color-brand-soft);
  }

  /* Grid */
  .pp-grid {
    display: grid;
    /* ~5 cards per row at full width — roughly 40% smaller than the old
       3-column layout. auto-fill lets it reflow gracefully on narrow viewports. */
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .pp-grid--in-group {
    margin-top: 12px;
  }
  @media (max-width: 640px) {
    .pp-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
    .pp-header {
      flex-direction: column;
    }
    .pp-header__actions {
      width: 100%;
      flex-wrap: wrap;
    }
  }

  /* Groups */
  .pp-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pp-groups__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pp-groups__hint {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
  .pp-groups__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .pp-group {
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: 12px;
    padding: 16px;
  }
  .pp-group__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    position: relative;
  }
  .pp-group__toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 4px;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    flex: 1;
    text-align: left;
    transition: background-color 0.15s ease;
  }
  .pp-group__toggle:hover {
    background-color: var(--color-bg-elevated);
  }
  .pp-group__chevron {
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
  .pp-group__name {
    flex: 1;
  }
  .pp-group__count {
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background-color: var(--color-bg-elevated);
    border-radius: 999px;
  }
  .pp-group__menu {
    position: relative;
  }
  .pp-group__kebab {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
  }
  .pp-group__kebab:hover {
    background-color: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }
  .pp-group__kebab svg {
    width: 16px;
    height: 16px;
  }
  .pp-group__menu-list {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 160px;
    padding: 6px;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .pp-group__menu-item {
    padding: 8px 10px;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background-color 0.1s ease;
  }
  .pp-group__menu-item:hover {
    background-color: var(--color-bg-elevated);
  }
  .pp-group__menu-item--danger {
    color: var(--color-danger);
  }
  .pp-group__menu-item--danger:hover {
    background-color: var(--color-danger-soft);
  }
  .pp-group__empty {
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: var(--color-text-tertiary);
    background-color: var(--color-bg-base);
    border: 1px dashed var(--color-border-subtle);
    border-radius: 10px;
    margin-top: 12px;
  }

  /* Empty state */
  .pp-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 64px 24px;
    background-color: var(--color-bg-surface);
    border: 1px dashed var(--color-border-subtle);
    border-radius: 16px;
  }
  .pp-empty__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background-color: var(--color-bg-elevated);
    color: var(--color-text-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
  }
  .pp-empty__icon svg {
    width: 32px;
    height: 32px;
  }
  .pp-empty__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 6px;
  }
  .pp-empty__subtext {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0 0 20px;
    max-width: 360px;
    line-height: 1.5;
  }
  .pp-empty-text {
    text-align: center;
    color: var(--color-text-secondary);
    margin: 32px 0 16px;
  }

  /* Modals */
  .pp-modal__overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }
  .pp-modal {
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-subtle);
    border-radius: 14px;
    box-shadow: var(--shadow-lg);
    padding: 28px;
    max-width: 440px;
    width: 92%;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .pp-modal__title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }
  .pp-modal__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .pp-modal__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  .pp-modal__input,
  .pp-modal__textarea {
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
  .pp-modal__input:focus,
  .pp-modal__textarea:focus {
    border-color: var(--color-brand-primary);
    box-shadow: 0 0 0 3px var(--color-focus-ring);
  }
  .pp-modal__textarea {
    min-height: 80px;
    resize: vertical;
  }
  .pp-modal__actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }

  /* Thumbnail upload (Edit Project modal) */
  .pp-thumb-upload {
    display: flex;
    gap: 16px;
    align-items: stretch;
  }
  .pp-thumb-upload__preview {
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    border-radius: 12px;
    border: 1px solid var(--color-border-subtle);
    background-color: var(--color-bg-elevated);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pp-thumb-upload__preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .pp-thumb-upload__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--color-text-secondary);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .pp-thumb-upload__placeholder svg {
    width: 22px;
    height: 22px;
  }
  .pp-thumb-upload__controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  }
  .pp-thumb-upload__hint {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--color-text-tertiary);
    line-height: 1.4;
  }
`;

export default ProjectsPage;
