import TopBar from "../components/TopBar";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div style={styles.container}>
      <TopBar />
      <main style={styles.mainContent}>
        <h1>Home Page</h1>
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
  } as React.CSSProperties,
  mainContent: {
    flex: 1,
  } as React.CSSProperties,
};

export default HomePage;
