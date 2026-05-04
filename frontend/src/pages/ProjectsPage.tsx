import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

interface ProjectPageParams extends Record<string, string | undefined> {
  projectId?: string;
}

const ProjectsPage: React.FC = () => {
  const { projectId } = useParams<ProjectPageParams>();
  const navigate = useNavigate();
  const [backButtonHovered, setBackButtonHovered] = useState(false);

  const handleBack = () => {
    navigate("/projects");
  };

  const pageStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#fafafa",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #efefef",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const backButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    border: backButtonHovered ? "1px solid #d0d0d0" : "1px solid #e0e0e0",
    backgroundColor: backButtonHovered ? "#f5f5f5" : "#ffffff",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "18px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: "32px",
  };

  return (
    <Layout>
      <div style={pageStyle}>
        {/* Header with Back Button */}
        <div style={headerStyle}>
          <button
            style={backButtonStyle}
            onClick={handleBack}
            onMouseEnter={() => setBackButtonHovered(true)}
            onMouseLeave={() => setBackButtonHovered(false)}
            aria-label="Go back to projects"
          >
            ←
          </button>
          <h1 style={titleStyle}>Project {projectId?.replace("project-", "")}</h1>
        </div>

        {/* Content - Blank for now */}
        <div style={contentStyle}>
          {/* Blank content */}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
