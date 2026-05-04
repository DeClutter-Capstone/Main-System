import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import HistoryCard from "../components/HistoryCard";

interface Project {
  id: string;
  title: string;
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

const ProjectsPage: React.FC = () => {
  const { projectId } = useParams<ProjectPageParams>();
  const location = useLocation();
  const navigate = useNavigate();

  const project = (location.state as LocationState)?.project;

  const handleAddTransformation = () => {
    navigate("/generate");
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
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
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
          {project ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: "24px" }}>
                <h2 style={projectNameStyle}>{project.title}</h2>
              </div>

              {/* Project Info Card */}
              <div style={projectInfoStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
                  <div style={dateContainerStyle}>
                    <div style={dateItemStyle}>
                      <span style={dateLabelStyle}>Created:</span>
                      <span style={dateValueStyle}>{project.createdDate}</span>
                    </div>
                    <div style={dateItemStyle}>
                      <span style={dateLabelStyle}>Updated:</span>
                      <span style={dateValueStyle}>{project.updatedDate}</span>
                    </div>
                  </div>
                  <button
                    style={{
                      ...addTransformationButtonStyle,
                      backgroundColor: "#4384E2",
                      flex: "0 0 auto",
                    }}
                    onClick={handleAddTransformation}
                    aria-label="Add new transformation"
                  >
                    + Add New Transformation
                  </button>
                </div>

                {/* All Generations Section */}
                <div style={{ marginTop: "32px", borderTop: "1px solid #efefef", paddingTop: "24px" }}>
                  <h3 style={{ fontSize: "25px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px 0" }}>All Generations</h3>
                  <div style={generationsGridStyle}>
                    {dummyGenerations.map((generation) => (
                      <HistoryCard
                        key={generation.id}
                        image={generation.image}
                        title={generation.title}
                        date={generation.date}
                        style={generation.style}
                        onDelete={() => console.log("Delete generation", generation.id)}
                        onDownload={() => console.log("Download generation", generation.id)}
                      />
                    ))}
                  </div>
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
    </Layout>
  );
};

export default ProjectsPage;
