import React, { useState } from "react";

interface Project {
  id: string;
  title: string;
  updatedDate: string;
  thumbnail?: string;
}

interface ProjectCardProps {
  project: Project;
  onClick?: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    onClick?.(project.id);
  };

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    border: isHovered ? "1px solid #d0d0d0" : "1px solid #e8e8e8",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isHovered ? "0 8px 16px rgba(0, 0, 0, 0.1)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
    userSelect: "none",
    transform: isActive ? "translateY(0)" : isHovered ? "translateY(-2px)" : "translateY(0)",
    maxWidth: "200px",
    width: "100%",
  };

  const thumbnailStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "1",
    background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const dividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#efefef",
  };

  const contentStyle: React.CSSProperties = {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    lineHeight: 1.4,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const metadataStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#888888",
    margin: 0,
    lineHeight: 1.3,
  };

  return (
    <div
      style={cardStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {/* Thumbnail Area */}
      <div style={thumbnailStyle}>
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={project.title}
            style={imageStyle}
          />
        )}
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Content Area */}
      <div style={contentStyle}>
        <h3 style={titleStyle}>{project.title}</h3>
        <p style={metadataStyle}>Updated {project.updatedDate}</p>
      </div>
    </div>
  );
};

export default ProjectCard;
