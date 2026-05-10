import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface TopBarProps {
  showSignIn?: boolean;
  onSignIn?: () => void;
}

function TopBar({ showSignIn = false, onSignIn }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={styles.container} className="topbar-container">
      <style>{`
        .topbar-link {
          color: #333;
          font-size: 1.25rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Alata', sans-serif;
          padding: 0.5rem 1rem;
          text-decoration: none;
          margin-top: 5px;
          margin-bottom: 5px;
          margin-right: 15px;
          transition: color 0.2s ease;
        }
        .topbar-link:hover {
          color: #4384E2;
        }
        .topbar-link.active {
          color: #4384E2;
        }
        [data-theme="dark"] .topbar-link {
          color: #ffffff;
        }
        [data-theme="dark"] .topbar-link:hover {
          color: #82b6ff;
        }
        [data-theme="dark"] .topbar-link.active {
          color: #82b6ff;
        }
        [data-theme="dark"] .topbar-container {
          background-color: #1a1a1a !important;
        }
      `}</style>

      {/* Logo */}
      <div style={styles.logoSection}>
        <img src="/Declutter logo.png" alt="DeClutter Logo" style={styles.logo} />
      </div>

      {/* Nav links */}
      <nav style={styles.navSection}>
        <Link to="/" className={`topbar-link${isActive("/") ? " active" : ""}`}>
          Home
        </Link>
        <Link to="/about" className={`topbar-link${isActive("/about") ? " active" : ""}`}>
          About
        </Link>
        <Link to="/blog" className={`topbar-link${isActive("/blog") ? " active" : ""}`}>
          Blog
        </Link>
        {showSignIn && (
          <button
            style={styles.signInButton}
            onClick={() => {
              if (onSignIn) onSignIn();
              navigate("/login", { replace: true });
            }}
          >
            Sign in
          </button>
        )}
        <button
          style={{
            ...styles.toggleButton,
            backgroundColor: isDarkMode ? "#333" : "#ddd",
          }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle dark mode"
        >
          <img
            src={isDarkMode ? "/light-mode.png" : "/dark-mode.png"}
            alt="Toggle dark mode"
            style={styles.toggleIcon}
          />
        </button>
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
    transition: "background-color 0.3s ease",
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
  signInButton: {
    backgroundColor: "#99c0f8ff",
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
    marginRight: "0px",
  } as React.CSSProperties,
  toggleButton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
    margin: "4px",
    marginRight: "15px",
  } as React.CSSProperties,
  toggleIcon: {
    width: "24px",
    height: "24px",
  } as React.CSSProperties,
};

export default TopBar;
