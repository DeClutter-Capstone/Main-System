import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import HistoryCard from "../components/HistoryCard";

interface Project {
  id: string;
  title: string;
  description?: string;
  createdDate: string;
  updatedDate: string;
  thumbnail?: string;
}

interface ProjectPageParams extends Record<string, string | undefined> {
  projectId?: string;
}

interface LocationState {
  project?: Project;
}

interface Generation {
  id: number;
  image: string;
  title: string;
  date: string;
  style: string;
  originalImage?: string;
}

const ProjectsPage: React.FC = () => {
  const { projectId } = useParams<ProjectPageParams>();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentProject, setCurrentProject] = useState<Project | undefined>((location.state as LocationState)?.project);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentProject?.title || "");
  const [editDescription, setEditDescription] = useState(currentProject?.description || "");
  const [editThumbnail, setEditThumbnail] = useState<string | undefined>(currentProject?.thumbnail);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | undefined>(undefined);

  const handleAddTransformation = () => {
    navigate("/generate", { state: { project: currentProject } });
  };

  const handleEditProject = () => {
    if (currentProject) {
      setEditName(currentProject.title);
      setEditDescription(currentProject.description || "");
      setEditThumbnail(currentProject.thumbnail);
      setShowEditModal(true);
    }
  };

  const handleSaveProject = () => {
    if (!editName.trim()) {
      alert("Please enter a project name");
      return;
    }

    if (!currentProject) return;

    const updatedProject: Project = {
      ...currentProject,
      title: editName,
      description: editDescription || undefined,
      thumbnail: editThumbnail,
      updatedDate: new Date().toLocaleDateString(),
    };

    try {
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        let projects = JSON.parse(storedProjects);
        projects = projects.map((p: Project) =>
          p.id === currentProject.id ? updatedProject : p
        );
        localStorage.setItem("projects", JSON.stringify(projects));
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }

    setCurrentProject(updatedProject);
    setShowEditModal(false);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditName("");
    setEditDescription("");
    setEditThumbnail(undefined);
  };

  const handleGenerationClick = (generation: Generation) => {
    if (selectedGeneration?.id === generation.id) {
      setSelectedGeneration(undefined);
    } else {
      setSelectedGeneration(generation);
    }
  };

  const handleDeleteProject = () => {
    if (!currentProject || !window.confirm(`Are you sure you want to delete "${currentProject.title}"?`)) {
      return;
    }

    try {
      // Get current projects from localStorage
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        let projects = JSON.parse(storedProjects);
        // Remove the project
        projects = projects.filter((p: Project) => p.id !== currentProject.id);
        // Save back to localStorage
        localStorage.setItem("projects", JSON.stringify(projects));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }

    // Navigate back to projects page
    navigate("/projects");
  };

  const dummyGenerations = [
    {
      id: 1,
      image: "/HomePageImages/minimalist.jpg",
      title: "Living Room Transformation 1",
      date: "9/8/2025",
      style: "Modern",
    },
    {
      id: 2,
      image: "/HomePageImages/industrial.jpg",
      title: "Living Room Transformation 2",
      date: "8/15/2025",
      style: "Industrial",
    },
    {
      id: 3,
      image: "/HomePageImages/bohemian.webp",
      title: "Living Room Transformation 3",
      date: "7/20/2025",
      style: "Bohemian",
    },
    {
      id: 4,
      image: "/HomePageImages/scandinavian.webp",
      title: "Living Room Transformation 4",
      date: "6/10/2025",
      style: "Scandinavian",
    },
  ];

  const pageStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#fafafa",
  };



  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "32px 150px",
  };

  const projectInfoStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const projectNameStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 24px 0",
  };

  const dateContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const dateItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const dateLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#666666",
    minWidth: "100px",
  };

  const dateValueStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#1a1a1a",
  };

  const headerContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    gap: "16px",
  };

  const addTransformationButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4384E2",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 400,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  };

  const deleteButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "2px solid #000000",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 400,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  const editButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#4384E2",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 400,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
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
    fontWeight: 400,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "#f5f5f5",
    color: "#1a1a1a",
    transition: "all 0.2s ease",
  };

  const saveButtonStyle: React.CSSProperties = {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 400,
    cursor: "pointer",
    fontFamily: "inherit",
    backgroundColor: "#4384E2",
    color: "#ffffff",
    transition: "all 0.2s ease",
  };

  // Generation Comparison Styles
  const generationComparisonContainerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "2px solid #1a1a1a",
    overflow: "visible",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    padding: "12px",
    maxWidth: "800px",
    width: "100%",
  };

  const comparisonSideStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const comparisonImageContainerStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "1",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const comparisonImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const comparisonLabelStyle: React.CSSProperties = {
    padding: "16px",
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    textAlign: "center",
    width: "100%",
    borderTop: "1px solid #e0e0e0",
  };

  const comparisonDividerStyle: React.CSSProperties = {
    width: "2px",
    backgroundColor: "#1a1a1a",
    gridColumn: "1 / 2",
  };

  const projectDescriptionStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#666666",
    lineHeight: 1.5,
    marginBottom: "16px",
  };

  const generationsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  };

  return (
    <Layout>
      <div style={pageStyle}>
        {/* Content */}
        <div style={contentStyle}>
          {currentProject ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: "24px" }}>
                <h2 style={projectNameStyle}>{currentProject.title}</h2>
              </div>

              {/* Project Info Card */}
              <div style={projectInfoStyle}>
                {/* Description */}
                {currentProject.description && (
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 12px 0" }}>Project Description</h3>
                    <div style={projectDescriptionStyle}>
                      {currentProject.description}
                    </div>
                  </div>
                )}

                {/* Dates and Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", marginBottom: "24px" }}>
                  <div style={dateContainerStyle}>
                    <div style={dateItemStyle}>
                      <span style={dateLabelStyle}>Created:</span>
                      <span style={dateValueStyle}>{currentProject.createdDate}</span>
                    </div>
                    <div style={dateItemStyle}>
                      <span style={dateLabelStyle}>Updated:</span>
                      <span style={dateValueStyle}>{currentProject.updatedDate}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px", flex: "0 0 auto" }}>
                    <button
                      style={addTransformationButtonStyle}
                      onClick={handleAddTransformation}
                      aria-label="Add new transformation"
                    >
                      +  Add New Transformation
                    </button>
                    <button
                      style={editButtonStyle}
                      onClick={handleEditProject}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563d9")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4384E2")}
                      aria-label="Edit project"
                    >
                      Edit Project
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={handleDeleteProject}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                      aria-label="Delete project"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>

                {/* All Generations Section */}
                <div style={{ marginTop: "32px", borderTop: "1px solid #efefef", paddingTop: "24px" }}>
                  <h3 style={{ fontSize: "25px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px 0" }}>All Generations</h3>
                  <div style={generationsGridStyle}>
                    {dummyGenerations.map((generation) => (
                      <div
                        key={generation.id}
                        onClick={() => handleGenerationClick(generation)}
                        style={{ cursor: "pointer" }}
                      >
                        <HistoryCard
                          image={generation.image}
                          title={generation.title}
                          date={generation.date}
                          style={generation.style}
                          onDelete={() => console.log("Delete generation", generation.id)}
                          onDownload={() => console.log("Download generation", generation.id)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Generation Comparison Display */}
                  {selectedGeneration && (
                    <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px 0" }}>
                        {selectedGeneration.title}
                      </h3>

                      {/* Image Comparison Container */}
                      <div style={generationComparisonContainerStyle}>
                        {/* Original Image Side */}
                        <div style={comparisonSideStyle}>
                          <div style={comparisonImageContainerStyle}>
                            <img
                              src={selectedGeneration.originalImage || "/HomePageImages/home page 1.png"}
                              alt="Original"
                              style={comparisonImageStyle}
                            />
                          </div>
                          <div style={comparisonLabelStyle}>Original</div>
                        </div>

                        {/* Transformed Image Side */}
                        <div style={comparisonSideStyle}>
                          <div style={comparisonImageContainerStyle}>
                            <img
                              src={selectedGeneration.image}
                              alt="Transformed"
                              style={comparisonImageStyle}
                            />
                          </div>
                          <div style={comparisonLabelStyle}>Transformed</div>
                        </div>
                      </div>


                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={projectInfoStyle}>
              <p style={{ color: "#999999" }}>Project information not found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {showEditModal && currentProject && (
        <div style={modalOverlayStyle} onClick={closeEditModal}>
          <div style={modalContainerStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitleStyle}>Edit Project</h2>

            {/* Project Name Input */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="edit-project-name">Project Name *</label>
              <input
                id="edit-project-name"
                type="text"
                style={inputStyle}
                placeholder="Enter project name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSaveProject()}
              />
            </div>

            {/* Project Description Input */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="edit-project-description">Description</label>
              <textarea
                id="edit-project-description"
                style={textareaStyle}
                placeholder="Enter project description (optional)"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            {/* Thumbnail Upload */}
            <div style={formGroupStyle}>
              <label style={labelStyle} htmlFor="edit-project-thumbnail">Thumbnail Image</label>
              <input
                id="edit-project-thumbnail"
                type="file"
                accept="image/*"
                style={{ ...inputStyle, cursor: "pointer" }}
                onChange={handleThumbnailChange}
              />
              {editThumbnail && (
                <img src={editThumbnail} alt="Project thumbnail preview" style={thumbnailPreviewStyle} />
              )}
            </div>

            {/* Modal Actions */}
            <div style={modalButtonsStyle}>
              <button
                style={cancelButtonStyle}
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                style={saveButtonStyle}
                onClick={handleSaveProject}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectsPage;
