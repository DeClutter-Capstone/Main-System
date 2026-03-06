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
        <a href="/" style={styles.navLink}>
          Home
        </a>
        <a href="/#about" style={styles.navLink}>
          About
        </a>
        <a href="/#api" style={styles.navLink}>
          API
        </a>
        <a href="/#blog" style={styles.navLink}>
          Blog
        </a>
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
    height: "40px",
    width: "auto",
  } as React.CSSProperties,
  navSection: {
    display: "flex",
    gap: "6rem",
    alignItems: "center",
  } as React.CSSProperties,
  navLink: {
    color: "#333",
    fontSize: "1.25rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.3s ease",
    fontFamily: "'Alata', sans-serif",
    padding: "0.5rem 1rem",
    textDecoration: "none",
  } as React.CSSProperties,
};

export default TopBar;
