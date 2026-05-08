import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  // Apply on first mount without waiting for state change
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={styles.navbar}>
      <style>{`
        .nav-link {
          color: #333;
          text-decoration: none;
          font-size: 1.25rem;
          font-weight: 500;
          font-family: 'Alata', sans-serif;
          cursor: pointer;
          padding: 0.5rem 1rem;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: #4384E2;
        }
        .nav-link.active {
          color: #4384E2;
        }
        [data-theme="dark"] .nav-link {
          color: #ffffff;
        }
        [data-theme="dark"] .nav-link:hover {
          color: #82b6ff;
        }
        [data-theme="dark"] .nav-link.active {
          color: #82b6ff;
        }
        [data-theme="dark"] nav {
          background-color: #1a1a1a !important;
        }
      `}</style>

      {/* Logo */}
      <div style={styles.logoSection}>
        <img src="/Declutter logo.png" alt="DeClutter Logo" style={styles.logo} />
      </div>

      {/* Nav links */}
      <div style={styles.navItems}>
        <Link to="/generate" className={`nav-link${isActive("/generate") ? " active" : ""}`}>
          Generate
        </Link>
        <Link to="/projects" className={`nav-link${isActive("/projects") ? " active" : ""}`}>
          My Projects
        </Link>
        <Link to="/history" className={`nav-link${isActive("/history") ? " active" : ""}`}>
          History
        </Link>
        <Link to="/faq" className={`nav-link${isActive("/faq") ? " active" : ""}`}>
          FAQ
        </Link>
      </div>

      {/* Right side */}
      <div style={styles.profileSection}>
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
        <img
          src={firebaseUser?.photoURL || "/profile logo.png"}
          alt="Profile"
          style={styles.profileIcon}
          onClick={() => navigate("/account")}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/profile logo.png";
          }}
        />
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
  navItems: {
    display: "flex",
    gap: "6rem",
    alignItems: "center",
    justifyContent: "center",
    flex: "1 1 auto",
  } as React.CSSProperties,
  profileSection: {
    display: "flex",
    alignItems: "center",
    flex: "0 0 auto",
    paddingRight: "1rem",
    gap: "1rem",
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
    margin: "2px",
  } as React.CSSProperties,
  toggleIcon: {
    width: "24px",
    height: "24px",
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
