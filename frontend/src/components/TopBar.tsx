import { Link, useLocation, useNavigate } from "react-router-dom";

interface TopBarProps {
  showSignIn?: boolean;
  onSignIn?: () => void;
}

function TopBar({ showSignIn = false, onSignIn }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={styles.container}>
      <style>{`
        a[style] {
          cursor: pointer;
          transition: color 0.3s ease;
        }
        a[style]:hover {
          opacity: 0.8;
        }
      `}</style>
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
        <Link
          to="/"
          style={{
            ...styles.navLink,
            color: isActive("/") ? "#4384E2" : "#333",
          }}
        >
          Home
        </Link>
        <Link
          to="/about"
          style={{
            ...styles.navLink,
            color: isActive("/about") ? "#4384E2" : "#333",
          }}
        >
          About
        </Link>
        <Link
          to="/api"
          style={{
            ...styles.navLink,
            color: isActive("/api") ? "#4384E2" : "#333",
          }}
        >
          API
        </Link>
        <Link
          to="/blog"
          style={{
            ...styles.navLink,
            color: isActive("/blog") ? "#4384E2" : "#333",
          }}
        >
          Blog
        </Link>
        {showSignIn && (
          <button
            style={styles.signInButton}
            onClick={() => {
              if (onSignIn) onSignIn();
              navigate("/auth", { replace: true });
            }}
          >
            Sign in
          </button>
        )}
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
    marginTop: "5px",
    marginBottom: "5px",
    marginRight: "15px",
  } as React.CSSProperties,
  signInButton: {
    backgroundColor: "#87b6f8ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "24px",
    padding: "0.5rem 1.5rem",
    fontSize: "1.25rem",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Alata', sans-serif",
    transition: "background-color 0.3s ease",
    marginTop: "5px",
    marginBottom: "5px",
    marginRight: "5px",
  } as React.CSSProperties,
};

export default TopBar;
