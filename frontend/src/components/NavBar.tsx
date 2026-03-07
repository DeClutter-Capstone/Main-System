import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
        <Link
          to="/generate"
          style={{
            ...styles.navLink,
            color: isActive("/generate") ? "#4384E2" : "#333",
          }}
        >
          Generate
        </Link>
        <Link
          to="/projects"
          style={{
            ...styles.navLink,
            color: isActive("/projects") ? "#4384E2" : "#333",
          }}
        >
          My Projects
        </Link>
        <Link
          to="/history"
          style={{
            ...styles.navLink,
            color: isActive("/history") ? "#4384E2" : "#333",
          }}
        >
          History
        </Link>
        <Link
          to="/faq"
          style={{
            ...styles.navLink,
            color: isActive("/faq") ? "#4384E2" : "#333",
          }}
        >
          FAQ
        </Link>
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
    marginTop: "5px",
    marginBottom: "5px",
  } as React.CSSProperties,
};

export default NavBar;
