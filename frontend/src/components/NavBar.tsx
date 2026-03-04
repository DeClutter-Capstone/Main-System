function NavBar() {
  return (
    <nav style={styles.navbar}>
      {/* Logo on the left */}
      <div style={styles.logoSection}>
        <img
          src="/Declutter logo.png"
          alt="DeClutter Logo"
          style={styles.logo}
        />
      </div>

      {/* Navigation items in the middle */}
      <div style={styles.navItems}>
        <a href="#generate" style={styles.navLink}>
          Generate
        </a>
        <a href="#projects" style={styles.navLink}>
          My Projects
        </a>
        <a href="#history" style={styles.navLink}>
          History
        </a>
        <a href="#faq" style={styles.navLink}>
          FAQ
        </a>
      </div>

      {/* Profile icon on the right */}
      <div style={styles.profileSection}>
        <img src="/profile logo.png" alt="Profile" style={styles.profileIcon} />
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
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
  navItems: {
    display: "flex",
    gap: "6rem",
    alignItems: "center",
    justifyContent: "center",
    flex: "1 1 auto",
  } as React.CSSProperties,
  navLink: {
    background: "none",
    border: "none",
    textDecoration: "none",
    color: "#333",
    fontSize: "1.25rem",
    fontWeight: "500",
    fontFamily: "'Alata', sans-serif",
    cursor: "pointer",
    transition: "color 0.3s ease",
    padding: "0.5rem 1rem",
  } as React.CSSProperties,
  profileSection: {
    display: "flex",
    alignItems: "center",
    flex: "0 0 auto",
    paddingRight: "1rem",
  } as React.CSSProperties,
  profileIcon: {
    height: "40px",
    width: "40px",
    borderRadius: "50%",
    cursor: "pointer",
  } as React.CSSProperties,
};

export default NavBar;
