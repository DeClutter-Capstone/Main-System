import TopBar from "../components/TopBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <TopBar />
      <main style={styles.mainContent}>
        <h1>Home Page</h1>
        <button
          style={styles.generateButton}
          onClick={() => navigate("/generate")}
        >
          Start Generating
        </button>
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5ff",
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2rem",
  } as React.CSSProperties,
  generateButton: {
    padding: "12px 32px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
};

export default HomePage;
