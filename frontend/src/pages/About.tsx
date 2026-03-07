import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

function About() {
  return (
    <div style={styles.container}>
      <TopBar showSignIn={true} />
      <main style={styles.mainContent}>
        <h1 style={styles.title}>About Page</h1>
        <p style={styles.description}>
          Welcome to the About page of DeClutter. Here you can learn more about
          our mission and vision.
        </p>
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
    padding: "2rem",
  } as React.CSSProperties,
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0",
  } as React.CSSProperties,
  description: {
    fontSize: "1.1rem",
    color: "#666",
    maxWidth: "600px",
    textAlign: "center",
    margin: "0",
  } as React.CSSProperties,
};

export default About;
