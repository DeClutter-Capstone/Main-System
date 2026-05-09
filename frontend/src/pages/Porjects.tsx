import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProjectCard from "../components/ProjectCard";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  thumbnail?: string;
}

// Mock data - replace with actual API calls
const MOCK_PROJECTS: Project[] = [];

type SortOption = "recent" | "oldest" | "alphabetical";

function Projects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const storedProjects = localStorage.getItem("projects");
      return storedProjects ? JSON.parse(storedProjects) : MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterButtonHovered, setFilterButtonHovered] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectThumbnail, setProjectThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Save projects to localStorage whenever they change
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    // Handle resize events
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort projects
    switch (sortBy) {
      case "oldest":
        result = result.sort((a, b) => {
          const dateA = new Date(a.updatedDate);
          const dateB = new Date(b.updatedDate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "alphabetical":
        result = result.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        break;
      case "recent":
      default:
        result = result.sort((a, b) => {
          const dateA = new Date(a.updatedDate);
          const dateB = new Date(b.updatedDate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }

    return result;
  }, [projects, searchQuery, sortBy]);

  const handleNewProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    const now = new Date().toLocaleDateString();
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: projectName,
      description: projectDescription || undefined,
      createdDate: now,
      updatedDate: now,
      thumbnail: projectThumbnail,
    };

    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
    setProjectName("");
    setProjectDescription("");
    setProjectThumbnail(undefined);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setProjectName("");
    setProjectDescription("");
    setProjectThumbnail(undefined);
  };

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    navigate(`/project/${projectId}`, { state: { project } });
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setShowFilterMenu(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Responsive grid columns
  const getGridColumns = () => {
    if (windowWidth > 1024) return 4;
    if (windowWidth > 768) return 3;
    if (windowWidth > 480) return 2;
    return 1;
  };

  // Responsive padding
  const getMainPadding = () => {
    if (windowWidth <= 480) return "16px";
    if (windowWidth <= 768) return "20px 24px";
    return "24px 240px 24px 300px";
  };

  // Responsive sizes
  const getTitleFontSize = () => {
    if (windowWidth <= 480) return "24px";
    return "28px";
  };

  const getButtonFontSize = () => {
    if (windowWidth <= 480) return "13px";
    return "14px";
  };

  const getButtonPadding = () => {
    if (windowWidth <= 480) return "8px 12px";
    return "10px 16px";
  };

  // CSS Styles
  const pageStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
    width: "100%",
    margin: 0,
    padding: 0,
  };

  const headerContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
    ...(windowWidth <= 768 && { flexDirection: "column", alignItems: "stretch" }),
  };

  const titleGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: getTitleFontSize(),
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
    lineHeight: 1.2,
  };

  const controlsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transform: "translateX(-25px)",
    ...(windowWidth <= 768 && { width: "100%" }),
  };

  const searchContainerStyle: React.CSSProperties = {
    flex: 1,
    minWidth: windowWidth <= 768 ? "auto" : "250px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    border: searchFocused ? "1px solid #999999" : "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "10px 16px",
    transition: "all 0.2s ease",
    boxShadow: searchFocused ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
  };

  const searchIconStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    color: "#999999",
    marginRight: 0,
    marginLeft: "auto",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    stroke: "#999999",
    order: 2,
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    border: "none",
    background: "transparent",
    fontSize: "14px",
    color: "#1a1a1a",
    outline: "none",
    fontFamily: "inherit",
    minWidth: 0,
    paddingLeft: 0,
    order: 1,
  };

  const filterButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: getButtonPadding(),
    border: filterButtonHovered ? "1px solid #d0d0d0" : "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: getButtonFontSize(),
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: getButtonPadding(),
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: getButtonFontSize(),
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "#4384E2",
    color: "#ffffff",
  };

  const buttonIconStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    stroke: "currentColor",
  };

  const filterDropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    zIndex: -1,
    minWidth: "200px",
    overflow: "hidden",
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    color: "#1a1a1a",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: getMainPadding(),
    width: "100%",
  };

  const sectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...(windowWidth <= 768 && { marginBottom: "8px" }),
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
    gap: windowWidth <= 768 ? "24px" : "28px",
    zIndex: 1,
  };

  const emptyStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    gridColumn: "1 / -1",
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  };

  const emptyDescriptionStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#888888",
    margin: "0 0 24px 0",
    maxWidth: "300px",
  };

  const skeletonStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    border: "1px solid #e8e8e8",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  const skeletonThumbnailStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "1",
    backgroundColor: "#e8e8e8",
  };

  const skeletonDividerStyle: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#efefef",
  };

  const skeletonContentStyle: React.CSSProperties = {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const skeletonTitleStyle: React.CSSProperties = {
    height: "16px",
    backgroundColor: "#e8e8e8",
    borderRadius: "4px",
  };

  const skeletonMetadataStyle: React.CSSProperties = {
    height: "12px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    width: "70%",
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100000,
  };

  const modalContainerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "32px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  };

  const formGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px 16px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#1a1a1a",
    transition: "all 0.2s ease",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "inherit",
  };

  const thumbnailPreviewStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: "150px",
    borderRadius: "8px",
    objectFit: "cover",
    marginTop: "8px",
  };

  const modalButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "12px",
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: "10px 24px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "#f5f5f5",
    color: "#1a1a1a",
    transition: "all 0.2s ease",
  };

  const createButtonStyle: React.CSSProperties = {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "#4384E2",
    color: "#ffffff",
    transition: "all 0.2s ease",
  };

  // Render skeleton loaders
  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={`skeleton-${i}`} style={skeletonStyle}>
        <div style={skeletonThumbnailStyle} />
        <div style={skeletonDividerStyle} />
        <div style={skeletonContentStyle}>
          <div style={skeletonTitleStyle} />
          <div style={skeletonMetadataStyle} />
        </div>
      </div>
    ));
  };

  return (
    <Layout>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        input::placeholder {
          color: #999999;
        }
      `}</style>
      <div style={pageStyle}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          input::placeholder {
            color: #999999;
          }
        `}</style>

        {/* Main Content */}
        <main style={mainStyle}>
          <section style={sectionStyle}>
            {/* Header Controls */}
            <div style={headerContainerStyle}>
              {/* Title with Icon */}
              <div style={titleGroupStyle}>
                <h1 style={titleStyle}>My Projects</h1>
              </div>

              {/* Search and Controls */}
              <div style={controlsStyle}>
                {/* Search Bar */}
                <div style={searchContainerStyle}>
                  <svg style={searchIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    style={searchInputStyle}
                    placeholder="Search your previous project..."
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    aria-label="Search projects"
                  />
                </div>

                {/* Filter Button */}
                <div style={{ position: "relative" }}>
                  <button
                    style={filterButtonStyle}
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    onMouseEnter={() => setFilterButtonHovered(true)}
                    onMouseLeave={() => setFilterButtonHovered(false)}
                    aria-label="Filter projects"
                    aria-expanded={showFilterMenu}
                  >
                    <svg style={buttonIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filter
                  </button>

                  {/* Filter Dropdown */}
                  {showFilterMenu && (
                    <div style={filterDropdownStyle}>
                      <button
                        style={{
                          ...dropdownItemStyle,
                          paddingTop: "8px",
                          backgroundColor: sortBy === "recent" ? "#f5f5f5" : "transparent",
                        }}
                        onClick={() => handleSortChange("recent")}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sortBy === "recent" ? "#f5f5f5" : "transparent")}
                      >
                        {sortBy === "recent" && "✓ "}Recently Updated
                      </button>
                      <button
                        style={{
                          ...dropdownItemStyle,
                          backgroundColor: sortBy === "oldest" ? "#f5f5f5" : "transparent",
                        }}
                        onClick={() => handleSortChange("oldest")}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sortBy === "oldest" ? "#f5f5f5" : "transparent")}
                      >
                        {sortBy === "oldest" && "✓ "}Oldest First
                      </button>
                      <button
                        style={{
                          ...dropdownItemStyle,
                          paddingBottom: "8px",
                          backgroundColor: sortBy === "alphabetical" ? "#f5f5f5" : "transparent",
                        }}
                        onClick={() => handleSortChange("alphabetical")}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = sortBy === "alphabetical" ? "#f5f5f5" : "transparent")}
                      >
                        {sortBy === "alphabetical" && "✓ "}A to Z
                      </button>
                    </div>
                  )}
                </div>

                {/* New Project Button */}
                <button
                  style={primaryButtonStyle}
                  onClick={handleNewProject}
                  aria-label="Create new project"
                >
                  <span style={buttonIconStyle}>+</span>
                  New Project
                </button>
              </div>
            </div>

            {/* Section Header */}
            <div style={sectionHeaderStyle}>
              <h2 style={sectionTitleStyle}>All Projects</h2>
            </div>

            {/* Projects Grid */}
            <div style={gridStyle}>
              {isLoading ? (
                renderSkeletons()
              ) : filteredAndSortedProjects.length > 0 ? (
                filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={handleProjectClick}
                  />
                ))
              ) : (
                <div style={emptyStyle}>
                  <h3 style={emptyTitleStyle}>No projects found</h3>
                  <p style={emptyDescriptionStyle}>
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first project to get started"}
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Create New Project</h2>

            {/* Project Name Input */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="project-name">Project Name *</label>
              <input
                id="project-name"
                type="text"
                style={inputStyle}
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateProject()}
              />
            </div>

            {/* Project Description Input */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="project-description">Description</label>
              <textarea
                id="project-description"
                style={textareaStyle}
                placeholder="Enter project description (optional)"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            {/* Thumbnail Upload */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="project-thumbnail">Thumbnail Image</label>
              <input
                id="project-thumbnail"
                type="file"
                accept="image/*"
                style={{ ...inputStyle, cursor: "pointer" }}
                onChange={handleThumbnailChange}
              />
              {projectThumbnail && (
                <img src={projectThumbnail} alt="Project thumbnail preview" style={thumbnailPreviewStyle} />
              )}
            </div>

            {/* Modal Actions */}
            <div style={modalButtonsStyle}>
              <button
                style={cancelButtonStyle}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                style={createButtonStyle}
                onClick={handleCreateProject}
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
