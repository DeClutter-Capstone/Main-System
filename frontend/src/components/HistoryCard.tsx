import React, { useState } from "react";

interface HistoryCardProps {
  image: string;
  title: string;
  date: string;
  style: string;
  isDeleting?: boolean;
  onDelete?: () => void;
  onDownload?: () => void;
  onRename?: (newName: string) => void;
}

function HistoryCard({
  image,
  title,
  date,
  style,
  onDelete,
  onDownload,
  onRename,
}: HistoryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(title);

  const openEdit = () => {
    setDraftName(title);
    setEditOpen(true);
  };

  const confirmEdit = () => {
    if (draftName.trim() && onRename) onRename(draftName.trim());
    setEditOpen(false);
  };

  const cancelEdit = () => setEditOpen(false);

  return (
    <>
      <div style={cardStyle} className="history-card">
        {/* Left: Thumbnail Image */}
        <div style={imageContainerStyle}>
          <img src={image} alt={title} style={imageStyle} />
        </div>

        {/* Right: Content */}
        <div style={contentStyle}>
          <div style={textContainerStyle}>
            <h3 style={titleStyle} className="history-card-title">
              {title}
            </h3>
            <p style={dateStyle} className="history-card-date">
              {date}
            </p>
            <p style={styleTextStyle} className="history-card-style">
              {style}
            </p>
          </div>

          {/* Bottom Right: Action Icons */}
          <div style={actionsStyle}>
            {/* Edit button */}
            <button
              style={actionButtonStyle}
              onClick={openEdit}
              title="Rename"
              aria-label="Rename"
              className="history-card-button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>

            {/* Delete button */}
            <button
              style={actionButtonStyle}
              onClick={onDelete}
              title="Delete"
              aria-label="Delete"
              className="history-card-button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>

            {/* Download button */}
            <button
              style={actionButtonStyle}
              onClick={onDownload}
              title="Download"
              aria-label="Download"
              className="history-card-button"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        </div>

        <style>{`
          [data-theme="dark"] .history-card {
            background-color: #383838ff !important;
            border-color: #4b4b4bff !important;
          }
          [data-theme="dark"] .history-card-title {
            color: #ffffff !important;
          }
          [data-theme="dark"] .history-card-date {
            color: #cccccc !important;
          }
          [data-theme="dark"] .history-card-button {
            background-color: #272727ff !important;
            border-color: #111111ff !important;
            color: #999 !important;
          }
          [data-theme="dark"] .edit-modal-backdrop {
            background: rgba(0,0,0,0.65) !important;
          }
          [data-theme="dark"] .edit-modal-box {
            background-color: #2c2c2c !important;
            border-color: #444 !important;
          }
          [data-theme="dark"] .edit-modal-title {
            color: #fff !important;
          }
          [data-theme="dark"] .edit-modal-input {
            background-color: #383838 !important;
            border-color: #555 !important;
            color: #fff !important;
          }
        `}</style>
      </div>

      {/* Edit popup */}
      {editOpen && (
        <div
          className="edit-modal-backdrop"
          style={backdropStyle}
          onClick={cancelEdit}
        >
          <div
            className="edit-modal-box"
            style={modalBoxStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="edit-modal-title" style={modalTitleStyle}>
              Rename design
            </h3>
            <input
              className="edit-modal-input"
              style={modalInputStyle}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              autoFocus
            />
            <div style={modalActionsStyle}>
              <button style={cancelBtnStyle} onClick={cancelEdit}>
                Cancel
              </button>
              <button style={saveBtnStyle} onClick={confirmEdit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "7px",
  transition: "all 0.2s ease",
  cursor: "default",
};

const imageContainerStyle: React.CSSProperties = {
  flexShrink: 0,
};

const imageStyle: React.CSSProperties = {
  width: "140px",
  height: "120px",
  objectFit: "cover",
  borderRadius: "8px",
  display: "block",
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "120px",
};

const textContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  color: "#1a1a1a",
};

const dateStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  margin: "0",
};

const styleTextStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#0066cc",
  margin: "0",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  justifyContent: "flex-end",
};

const actionButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  backgroundColor: "#f5f5f5",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  cursor: "pointer",
  color: "#666",
  transition: "all 0.2s ease",
  padding: "0",
  fontSize: "16px",
};

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "14px",
  border: "1px solid #e0e0e0",
  padding: "28px 32px",
  width: "360px",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  border: "1px solid #d0d0d0",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
  color: "#1a1a1a",
  backgroundColor: "#fafafa",
};

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "8px 18px",
  fontSize: "13px",
  fontWeight: "500",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  color: "#555",
  cursor: "pointer",
};

const saveBtnStyle: React.CSSProperties = {
  padding: "8px 18px",
  fontSize: "13px",
  fontWeight: "600",
  border: "none",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #4384e2 0%, #82b6ff 100%)",
  color: "#fff",
  cursor: "pointer",
};

export default HistoryCard;
