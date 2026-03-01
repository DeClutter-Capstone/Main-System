function TopBar() {
  return (
    <div style={styles.container}>
      {/* Logo on the left */}
      <div style={styles.logoSection}>
        <img
          src="/Declutter logo.png"
          alt="DeClutter Logo"
          style={styles.logo}
        />
      </div>

      {/* Navigation links on the right */}
      <nav style={styles.navSection}>
        <button style={styles.button}>Home</button>
        <button style={styles.button}>About</button>
        <button style={styles.button}>API</button>
        <button style={styles.button}>Blog</button>
      </nav>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0",
    backgroundColor: "#ffffff",
    fontFamily: "'Alata', sans-serif",
  } as React.CSSProperties,
  logoSection: {
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  logo: {
    height: "49px",
    width: "auto",
  } as React.CSSProperties,
  navSection: {
    display: "flex",
    gap: "6rem",
    alignItems: "center",
  } as React.CSSProperties,
  button: {
    background: "none",
    border: "none",
    color: "#333",
    fontSize: "1.5rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.3s ease",
    fontFamily: "'Alata', sans-serif",
    padding: "0.5rem 1rem",
  } as React.CSSProperties,
};

export default TopBar;
