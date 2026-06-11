import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import GenerationCard, {
  generationCardStyles,
} from "../components/GenerationCard";
import BeforeAfterViewer from "../components/BeforeAfterViewer";
import {
  fetchHistory,
  deleteHistoryItem,
  renameHistoryItem,
  type HistoryItem,
} from "../services/historyAPI";
import {
  assignGeneration,
  listProjects,
  type ProjectSummary,
} from "../services/projectsAPI";
import { toast } from "react-toastify";

// History file_keys look like "industrial_bedroom_001" — render those in
// monospace muted style. Once the user renames to a real label, drop it.
const AUTO_NAME_RE = /^[a-z0-9]+_[a-z0-9_]+_\d+$/i;

// How many history items to fetch per page.
const PAGE_SIZE = 50;

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "");
}

async function downloadImage(url: string, baseName: string): Promise<void> {
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

function History() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedRoom, setSelectedRoom] = useState("All Rooms");
  const [timeFilter, setTimeFilter] = useState("All time");

  // Keep in sync with the styles offered on the Generate page.
  const styles = [
    "All Styles",
    "Minimalist",
    "Modern",
    "Scandinavian",
    "Industrial",
    "Bohemian",
    "Spa",
  ];
  // Keep in sync with the room dropdown on the Generate page (custom "Other"
  // rooms are free text and can't be enumerated here).
  const rooms = [
    "All Rooms",
    "Bedroom",
    "Living Room",
    "Kitchen",
    "Bathroom",
  ];
  const timeFilterOptions = [
    "All time",
    "Last 24 hours",
    "Last week",
    "Last month",
  ];
  // Lookback windows in milliseconds; null = show everything.
  const PERIOD_MS: Record<string, number | null> = {
    "All time": null,
    "Last 24 hours": 24 * 60 * 60 * 1000,
    "Last week": 7 * 24 * 60 * 60 * 1000,
    "Last month": 30 * 24 * 60 * 60 * 1000,
  };

  const [historyCards, setHistoryCards] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Pagination: pages of PAGE_SIZE, appended via the "Load more" button.
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // The card whose before/after viewer is open (null = closed).
  const [viewerCard, setViewerCard] = useState<HistoryItem | null>(null);

  // The card being added to a project (null = picker closed).
  const [assignCard, setAssignCard] = useState<HistoryItem | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  // Project id of an in-flight assignment, to disable its row.
  const [assigningTo, setAssigningTo] = useState<string | null>(null);

  // Load the project list the first time the picker opens.
  const openAssignPicker = async (card: HistoryItem) => {
    setAssignCard(card);
    if (projects !== null) return;
    setIsLoadingProjects(true);
    try {
      setProjects(await listProjects());
    } catch (e) {
      console.error("Failed to load projects:", e);
      toast.error("Could not load your projects");
      setAssignCard(null);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleAssign = async (projectId: string, projectName: string) => {
    if (!assignCard || assignCard.project_id === projectId) return;
    const previousProjectId = assignCard.project_id;
    setAssigningTo(projectId);
    try {
      await assignGeneration(assignCard.id, { project_id: projectId });
      toast.success(`Added "${assignCard.title}" to ${projectName}`);
      // Remember the new home so the picker shows "Added" next time.
      setHistoryCards((prev) =>
        prev.map((c) =>
          c.id === assignCard.id ? { ...c, project_id: projectId } : c,
        ),
      );
      // Keep generation counts fresh for the next time the picker opens.
      setProjects((prev) =>
        prev?.map((p) => {
          if (p.project_id === projectId)
            return { ...p, generation_count: p.generation_count + 1 };
          if (p.project_id === previousProjectId)
            return { ...p, generation_count: Math.max(0, p.generation_count - 1) };
          return p;
        }) ?? null,
      );
      setAssignCard(null);
    } catch (e) {
      console.error("Failed to assign generation:", e);
      toast.error(
        `Failed to add to project: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    } finally {
      setAssigningTo(null);
    }
  };

  // Close the project picker on Escape.
  useEffect(() => {
    if (!assignCard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAssignCard(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assignCard]);

  // The "before" (input) image lives alongside the output under /storage/input/.
  const beforeImageFor = (card: HistoryItem) =>
    card.image.replace("/storage/output/", "/storage/input/");

  const handleDelete = async (id: string, fileKey: string) => {
    // Deleting removes the DB record and both image files — make sure the
    // user meant it (same guard the Projects page has).
    if (!window.confirm("Delete this generation? This permanently removes the image."))
      return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteHistoryItem(fileKey);
      setHistoryCards((prev) => prev.filter((card) => card.id !== id));
    } catch (e) {
      console.error("Failed to delete:", e);
      toast.error(
        `Failed to delete: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Same flow as the Projects page: open Generate pre-loaded with this
  // image as the upload source and the room type pre-selected.
  const handleRegenerate = (card: HistoryItem) => {
    navigate("/generate", {
      state: {
        regenerateFrom: {
          image: card.image,
          roomType: card.room,
        },
      },
    });
  };

  const handleDownload = async (card: HistoryItem) => {
    try {
      await downloadImage(card.image, card.title);
    } catch (e) {
      console.error("Download failed:", e);
      toast.error("Could not download image");
    }
  };

  const handleRename = async (id: string, oldName: string, newName: string) => {
    // The name becomes a filename on disk, so strip anything unsafe up front
    // (the backend rejects unsafe names too).
    const safeName = sanitizeFilename(newName.trim());
    if (!safeName) {
      toast.error("Name must contain letters or numbers");
      return;
    }

    if (safeName === oldName) {
      return; // No change
    }

    try {
      await renameHistoryItem(oldName, safeName);

      const backendBase =
        import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

      // Update the card in the list with cache-busting query parameter
      setHistoryCards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                title: safeName,
                image: `${backendBase}/storage/output/${safeName}.png?t=${Date.now()}`,
              }
            : card,
        ),
      );
    } catch (e) {
      console.error("Failed to rename:", e);
      toast.error(
        `Failed to rename: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };
  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHistory({
          style: selectedStyle,
          room: selectedRoom,
          sort: "newest",
          limit: PAGE_SIZE,
          offset: 0,
        });
        setHistoryCards(data);
        // A full page means there may be older items beyond it.
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        console.error(e);
        setHistoryCards([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedStyle, selectedRoom]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const data = await fetchHistory({
        style: selectedStyle,
        room: selectedRoom,
        sort: "newest",
        limit: PAGE_SIZE,
        offset: historyCards.length,
      });
      setHistoryCards((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load older generations");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const periodMs = PERIOD_MS[timeFilter];
  const periodCutoff = periodMs !== null ? Date.now() - periodMs : null;

  const filteredCards = historyCards.filter((card) => {
    // Time-period filter (client-side, based on when the item was created).
    if (periodCutoff !== null) {
      const ts = Date.parse(card.created_at ?? card.date);
      if (Number.isNaN(ts) || ts < periodCutoff) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(q) ||
      card.style.toLowerCase().includes(q) ||
      (card.room?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <Layout hideFooter>
      <style>{generationCardStyles}</style>
      <div style={containerStyle} className="history-container">
        {/* Header Section */}
        <div style={headerStyle}>
          <div style={titleSectionStyle}>
            <h1 style={titleStyle} className="history-title">
              Generation History
            </h1>
          </div>

          {/* Search and Filters Toolbar */}
          <div style={toolbarStyle} className="history-toolbar">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search your previous redesigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
              className="history-search-input"
            />

            {/* Filter Dropdowns */}
            <div style={dropdownsContainerStyle} className="history-dropdowns">
              {/* Style Dropdown */}
              <div style={dropdownWrapperStyle}>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  style={dropdownStyle}
                  className="history-dropdown"
                >
                  {styles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Dropdown */}
              <div style={dropdownWrapperStyle}>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  style={dropdownStyle}
                  className="history-dropdown"
                >
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Period Filter Dropdown */}
              <div style={dropdownWrapperStyle}>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={dropdownStyle}
                  className="history-dropdown"
                >
                  {timeFilterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={contentAreaStyle}>
          <div style={cardsGridStyle}>
            {isLoading ? (
              <div style={{ padding: 16 }}>Loading...</div>
            ) : (
              filteredCards.map((card) => (
                <GenerationCard
                  key={card.id}
                  image={card.image}
                  name={card.title}
                  isAutoName={AUTO_NAME_RE.test(card.title)}
                  styleLabel={card.style}
                  date={card.date}
                  onImageClick={() => setViewerCard(card)}
                  onRename={(newName) => {
                    if (newName) handleRename(card.id, card.title, newName);
                  }}
                  actions={
                    <>
                      <button
                        className="gen-card__icon-btn"
                        onClick={() => handleRegenerate(card)}
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
                        onClick={() => openAssignPicker(card)}
                        aria-label="Add to project"
                        title="Add to project"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <path d="M12 11v6" />
                          <path d="M9 14h6" />
                        </svg>
                      </button>
                      <button
                        className="gen-card__icon-btn"
                        onClick={() => handleDownload(card)}
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
                        disabled={deletingIds.has(card.id)}
                        onClick={() => handleDelete(card.id, card.title)}
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
                    </>
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Older generations beyond the first page */}
        {!isLoading && hasMore && (
          <div style={loadMoreWrapStyle}>
            <button
              type="button"
              className="history-load-more"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {/* Before / After Viewer */}
      {viewerCard && (
        <BeforeAfterViewer
          beforeSrc={beforeImageFor(viewerCard)}
          afterSrc={viewerCard.image}
          title={viewerCard.title}
          subtitle={`${viewerCard.style}${viewerCard.room ? ` · ${viewerCard.room}` : ""} · ${viewerCard.date}`}
          onClose={() => setViewerCard(null)}
        />
      )}

      {/* Add-to-project picker */}
      {assignCard && (
        <div
          className="hist-assign__overlay"
          onClick={() => setAssignCard(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Add to project"
        >
          <div className="hist-assign" onClick={(e) => e.stopPropagation()}>
            <div className="hist-assign__header">
              <div>
                <h2 className="hist-assign__title">Add to project</h2>
                <span className="hist-assign__subtitle">{assignCard.title}</span>
              </div>
              <button
                type="button"
                className="hist-assign__close"
                onClick={() => setAssignCard(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {isLoadingProjects ? (
              <p className="hist-assign__empty">Loading projects…</p>
            ) : !projects || projects.length === 0 ? (
              <div className="hist-assign__empty">
                <p>You don't have any projects yet.</p>
                <button
                  type="button"
                  className="hist-assign__create-btn"
                  onClick={() => navigate("/projects")}
                >
                  Go to Projects
                </button>
              </div>
            ) : (
              <ul className="hist-assign__list">
                {projects.map((p, i) => {
                  const isCurrent = assignCard.project_id === p.project_id;
                  const isBusy = assigningTo === p.project_id;
                  return (
                    <li
                      key={p.project_id}
                      className="hist-assign__row"
                      style={{ animationDelay: `${Math.min(i * 35, 240)}ms` }}
                    >
                      <button
                        type="button"
                        className={`hist-assign__item${isCurrent ? " hist-assign__item--current" : ""}`}
                        disabled={isCurrent || assigningTo !== null}
                        onClick={() => handleAssign(p.project_id, p.project_name)}
                      >
                        <span className="hist-assign__thumb">
                          {p.thumbnail_image_path || p.latest_output_image ? (
                            <img
                              src={p.thumbnail_image_path ?? p.latest_output_image ?? ""}
                              alt=""
                            />
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            </svg>
                          )}
                        </span>
                        <span className="hist-assign__info">
                          <span className="hist-assign__name">{p.project_name}</span>
                          <span className="hist-assign__count">
                            {p.generation_count}{" "}
                            {p.generation_count === 1 ? "generation" : "generations"}
                          </span>
                        </span>
                        {isCurrent ? (
                          <span className="hist-assign__added" aria-label="Already in this project">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Added
                          </span>
                        ) : isBusy ? (
                          <span className="hist-assign__busy">Adding…</span>
                        ) : (
                          <span className="hist-assign__arrow" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes hist-assign-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hist-assign-modal-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hist-assign-row-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hist-assign__overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          backdrop-filter: blur(6px) saturate(1.1);
          animation: hist-assign-overlay-in 0.2s ease both;
        }
        .hist-assign {
          background-color: var(--color-bg-surface, #ffffff);
          border: 1px solid var(--color-border-subtle, #e8e8e8);
          border-radius: 16px;
          box-shadow: 0 24px 72px rgba(0, 0, 0, 0.32);
          width: 100%;
          max-width: 400px;
          max-height: 78vh;
          overflow-y: auto;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: hist-assign-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hist-assign__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .hist-assign__title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 2px;
          color: var(--color-text-primary, #1a1a1a);
          letter-spacing: -0.2px;
        }
        .hist-assign__subtitle {
          font-size: 12px;
          color: var(--color-text-tertiary, #999999);
          word-break: break-word;
        }
        .hist-assign__close {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background-color: transparent;
          color: var(--color-text-secondary, #888888);
          font-size: 13px;
          cursor: pointer;
          line-height: 1;
          transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .hist-assign__close:hover {
          background-color: var(--color-bg-elevated, #f5f5f5);
          color: var(--color-text-primary, #1a1a1a);
          transform: rotate(90deg);
        }
        .hist-assign__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hist-assign__row {
          animation: hist-assign-row-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .hist-assign__item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 11px;
          background-color: transparent;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.16s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hist-assign__item:hover:not(:disabled) {
          background-color: var(--color-bg-elevated, #f6f6f6);
          transform: translateX(3px);
        }
        .hist-assign__item:active:not(:disabled) {
          transform: translateX(3px) scale(0.99);
        }
        .hist-assign__item:disabled {
          cursor: default;
        }
        .hist-assign__item--current {
          opacity: 0.75;
        }
        .hist-assign__thumb {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          overflow: hidden;
          background-color: var(--color-bg-elevated, #f0f0f0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary, #bbbbbb);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .hist-assign__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hist-assign__item:hover:not(:disabled) .hist-assign__thumb img {
          transform: scale(1.08);
        }
        .hist-assign__thumb svg {
          width: 18px;
          height: 18px;
        }
        .hist-assign__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .hist-assign__name {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-text-primary, #1a1a1a);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hist-assign__count {
          font-size: 11.5px;
          color: var(--color-text-tertiary, #999999);
        }
        .hist-assign__arrow {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          color: var(--color-brand-primary, #2563eb);
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hist-assign__item:hover:not(:disabled) .hist-assign__arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .hist-assign__arrow svg {
          width: 16px;
          height: 16px;
        }
        .hist-assign__added {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 999px;
          color: var(--color-brand-primary, #2563eb);
          background-color: var(--color-brand-soft, rgba(37, 99, 235, 0.1));
        }
        .hist-assign__added svg {
          width: 11px;
          height: 11px;
        }
        .hist-assign__busy {
          flex-shrink: 0;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-secondary, #888888);
        }
        .hist-assign__empty {
          text-align: center;
          font-size: 13px;
          color: var(--color-text-secondary, #888888);
          padding: 14px 0;
          margin: 0;
        }
        .hist-assign__empty p {
          margin: 0 0 12px;
        }
        .hist-assign__create-btn {
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          border: none;
          border-radius: 8px;
          background-color: var(--color-brand-primary, #2563eb);
          color: var(--color-text-inverse, #ffffff);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .hist-assign__create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
        }

        .history-load-more {
          padding: 10px 26px;
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          border: 1px solid var(--color-border-subtle, #e0e0e0);
          border-radius: 999px;
          background-color: var(--color-bg-surface, #ffffff);
          color: var(--color-text-primary, #1a1a1a);
          cursor: pointer;
          transition: background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }
        .history-load-more:hover:not(:disabled) {
          background-color: var(--color-bg-elevated, #f5f5f5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .history-load-more:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>

      <style>{`
        [data-theme="dark"] {
          background-color: #383838ff !important;
        }
        
        [data-theme="dark"] .history-title {
          color: #ffffff !important;
        }
        
        [data-theme="dark"] .history-search-input {
          background-color: #383838ff !important;
          color: #fff !important;
          border-color: #555 !important;
        }
        
        [data-theme="dark"] .history-search-input::placeholder {
          color: #888 !important;
        }
        
        [data-theme="dark"] .history-dropdown {
          background-color: #383838ff !important;
          color: #fff !important;
          border-color: #555 !important;
        }

        [data-theme="dark"] .history-dropdown option {
          background-color: #2a2a2aff !important;
          color: #fff !important;
        }
        
        [data-theme="dark"] .history-dropdown option:checked {
          background-color: #3a3a3aff !important;
          color: #fff !important;
        }

        /* ── Responsive toolbar ── */
        @media (max-width: 768px) {
          .history-container    { padding: 24px 20px !important; }
          .history-toolbar      { flex-direction: column !important; align-items: stretch !important; }
          .history-search-input { min-width: 0 !important; width: 100% !important; }
          .history-dropdowns    { width: 100% !important; flex-direction: row !important; flex-wrap: nowrap !important; }
          .history-dropdown     { flex: 1 !important; min-width: 0 !important; }
        }

        @media (max-width: 487px) {
          .history-container    { padding: 28px 24px 48px !important; }
          .history-title        { font-size: 22px !important; }
          .history-dropdown     { font-size: 12px !important; padding: 10px 6px !important; padding-right: 20px !important; background-position: right 4px center !important; }
        }

        @media (max-width: 360px) {
          .history-container    { padding: 20px 14px 40px !important; }
          .history-dropdowns    { gap: 6px !important; }
          .history-dropdown     { font-size: 11px !important; padding: 9px 4px !important; padding-right: 16px !important; }
        }
      `}</style>
    </Layout>
  );
}

const containerStyle: React.CSSProperties = {
  padding: "32px 40px",
  maxWidth: "1250px",
  margin: "0 auto",
  width: "100%",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  marginBottom: "32px",
};

const titleSectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "600",
  margin: "0",
  color: "#1a1a1a",
  letterSpacing: "-0.5px",
};

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const searchInputStyle: React.CSSProperties = {
  flex: "1",
  minWidth: "200px",
  padding: "10px 16px",
  fontSize: "13px",
  border: "1px solid #e0e0e0",
  borderRadius: "7px",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  transition: "all 0.2s ease",
};

const dropdownsContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const dropdownWrapperStyle: React.CSSProperties = {
  position: "relative",
};

const dropdownStyle: React.CSSProperties = {
  padding: "10px 16px",
  fontSize: "13px",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#1a1a1a",
  cursor: "pointer",
  transition: "all 0.2s ease",
  appearance: "none",
  paddingRight: "32px",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231a1a1a' d='M0 0l6 8 6-8z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
};

const contentAreaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  minHeight: "400px",
  backgroundColor: "transparent",
  borderRadius: "12px",
  border: "none",
};

const loadMoreWrapStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginTop: "24px",
};

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  // Match the Projects gen-card density so the cards look identical.
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "14px",
  width: "100%",
};

export default History;
