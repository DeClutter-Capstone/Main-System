import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import GenerationCard, {
  generationCardStyles,
} from "../components/GenerationCard";
import {
  fetchHistory,
  deleteHistoryItem,
  renameHistoryItem,
  type HistoryItem,
} from "../services/historyAPI";

// History file_keys look like "industrial_bedroom_001" — render those in
// monospace muted style. Once the user renames to a real label, drop it.
const AUTO_NAME_RE = /^[a-z0-9]+_[a-z0-9_]+_\d+$/i;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute("data-theme") === "dark",
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedRoom, setSelectedRoom] = useState("All Rooms");
  const [sortBy, setSortBy] = useState("Newest");

  const styles = [
    "All Styles",
    "Modern",
    "Minimalist",
    "Industrial",
    "Scandinavian",
    "Bohemian",
    "Rustic",
  ];
  const rooms = [
    "All Rooms",
    "Bedroom",
    "Living Room",
    "Kitchen",
    "Bathroom",
    "Office",
  ];
  const sortOptions = ["Newest", "Oldest", "Most Popular", "A-Z"];

  const [historyCards, setHistoryCards] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string, fileKey: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await deleteHistoryItem(fileKey);
      setHistoryCards((prev) => prev.filter((card) => card.id !== id));
    } catch (e) {
      console.error("Failed to delete:", e);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDownload = async (card: HistoryItem) => {
    try {
      await downloadImage(card.image, card.title);
    } catch (e) {
      console.error("Download failed:", e);
      alert("Could not download image");
    }
  };

  const handleRename = async (id: string, oldName: string, newName: string) => {
    if (!newName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    if (newName === oldName) {
      return; // No change
    }

    try {
      await renameHistoryItem(oldName, newName);

      const backendBase =
        import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

      // Update the card in the list with cache-busting query parameter
      setHistoryCards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                title: newName,
                image: `${backendBase}/storage/output/${newName}.png?t=${Date.now()}`,
              }
            : card,
        ),
      );
    } catch (e) {
      console.error("Failed to rename:", e);
      alert(
        `Failed to rename: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };
  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const sort = sortBy === "Oldest" ? "oldest" : "newest";
        const data = await fetchHistory({
          style: selectedStyle,
          room: selectedRoom,
          sort,
        });
        setHistoryCards(data);
      } catch (e) {
        console.error(e);
        setHistoryCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [selectedStyle, selectedRoom, sortBy]);

  const filteredCards = historyCards.filter((card) => {
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
            <img
              src={
                isDark
                  ? "/HomePageImages/gridlight.png"
                  : "/HomePageImages/griddark.png"
              }
              alt="Projects"
              style={iconStyle}
            />
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

              {/* Sort By Dropdown */}
              <div style={dropdownWrapperStyle}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={dropdownStyle}
                  className="history-dropdown"
                >
                  {sortOptions.map((option) => (
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
                  onRename={(newName) => {
                    if (newName) handleRename(card.id, card.title, newName);
                  }}
                  actions={
                    <>
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
      </div>

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

const iconStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  objectFit: "contain",
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

const cardsGridStyle: React.CSSProperties = {
  display: "grid",
  // Match the Projects gen-card density so the cards look identical.
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "14px",
  width: "100%",
};

export default History;
