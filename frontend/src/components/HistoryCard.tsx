import React from "react";

interface HistoryCardProps {
  image: string;
  title: string;
  date: string;
  style: string;
  onDelete?: () => void;
  onDownload?: () => void;
}

function HistoryCard({
  image,
  title,
  date,
  style,
  onDelete,
  onDownload,
}: HistoryCardProps) {
  return (
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
          <p style={dateStyle}>{date}</p>
          <p style={styleTextStyle}>{style}</p>
        </div>

        {/* Bottom Right: Action Icons */}
        <div style={actionsStyle}>
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
        
        [data-theme="dark"] .history-card-button {
          background-color: #272727ff !important;
          border-color: #111111ff !important;
          color: #999 !important;
        }
      `}</style>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
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

export default HistoryCard;
