import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProjectCard from "../components/ProjectCard";

interface Project {
  id: string;
  title: string;
  updatedDate: string;
  thumbnail?: string;
}

// Mock data - replace with actual API calls
const MOCK_PROJECTS: Project[] = [
  { id: "project-1", title: "Taipei Tower Project 1", updatedDate: "9/8/2025", thumbnail: "/HomePageImages/minimalist.jpg" },
  { id: "project-2", title: "Project 2", updatedDate: "7/7/2025", thumbnail: "/HomePageImages/industrial.jpg" },
  { id: "project-3", title: "Tower Project 3", updatedDate: "8/10/2025", thumbnail: "/HomePageImages/bohemian.webp" },
  { id: "project-4", title: "Project 4", updatedDate: "1/11/2025", thumbnail: "/HomePageImages/scandinavian.webp" },
  { id: "project-5", title: "Karachi Project 5", updatedDate: "12/12/2025", thumbnail: "/HomePageImages/rustic.jpg" },
  { id: "project-6", title: "Project 6", updatedDate: "7/4/2025", thumbnail: "/HomePageImages/spa.jpg" },
  { id: "project-7", title: "Empire state Project 7", updatedDate: "1/1/2025", thumbnail: "/HomePageImages/modren.jpg" },
  { id: "project-8", title: "Project 8", updatedDate: "9/10/2025", thumbnail: "/HomePageImages/home page 1.png" },
  { id: "project-9", title: "Project 9", updatedDate: "5/10/2025", thumbnail: "/HomePageImages/home page 2.jpg" },
  { id: "project-10", title: "Kingdom Tower", updatedDate: "5/1/2025", thumbnail: "/HomePageImages/after.png" },
];

type SortOption = "recent" | "oldest" | "alphabetical";

function Projects() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isLoading] = useState(false);
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterButtonHovered, setFilterButtonHovered] = useState(false);

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
    console.log("Create new project");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
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
  const getHeaderPadding = () => {
    if (windowWidth <= 480) return "16px";
    if (windowWidth <= 768) return "20px 24px";
    return "24px 240px 24px 300px";
  };

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
    backgroundColor: "#fafafa",
    width: "100%",
    margin: 0,
    padding: 0,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #efefef",
    padding: getHeaderPadding(),
    position: "relative",
    zIndex: 1000,
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
    zIndex: 9999,
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
    overflow: "hidden",
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
        {/* Header */}
        <header style={headerStyle}>
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
        </header>

        {/* Main Content */}
        <main style={mainStyle}>
          <section style={sectionStyle}>
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
    </Layout>
  );
}

export default Projects;
