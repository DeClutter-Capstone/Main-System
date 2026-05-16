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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;
  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  const navLinks: Array<{ to: string; label: string }> = [
    { to: "/generate", label: "Generate" },
    { to: "/projects", label: "My Projects" },
    { to: "/history", label: "History" },
  ];

  return (
    <nav style={styles.navbar} className="app-navbar">
      <style>{`
        .app-navbar {
          border-bottom: 1px solid var(--color-border-low);
        }
        .nav-link {
          color: var(--color-text-secondary);
          transition: color 0.15s ease;
          text-decoration: none;
          font-family: inherit;
        }
        .nav-link:hover {
          color: var(--color-text-primary);
        }
        .nav-link.active {
          color: var(--color-brand-primary);
        }
        .nav-icon-btn {
          background: transparent;
          border: 1px solid var(--color-border-subtle);
          color: var(--color-text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
        }
        .nav-icon-btn:hover {
          color: var(--color-text-primary);
          background-color: var(--color-bg-elevated);
          border-color: var(--color-border-subtle);
        }
        .nav-profile {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          object-fit: cover;
          border: 1px solid var(--color-border-subtle);
          transition: opacity 0.15s ease;
        }
        .nav-profile:hover {
          opacity: 0.85;
        }
      `}</style>

      {/* Logo */}
      <Link to="/" style={styles.logoLink}>
        <span style={styles.logoDe}>De</span>
        <span style={styles.logoClutter}>Clutter</span>
      </Link>

      {/* Center nav */}
      <div style={styles.navItems}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={styles.navLink}
            className={`nav-link${isActive(link.to) ? " active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={styles.rightSection}>
        <button
          className="nav-icon-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <img
          src={firebaseUser?.photoURL || "/profile logo.png"}
          alt="Profile"
          className="nav-profile"
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
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    padding: "0 24px",
    backgroundColor: "var(--color-bg-surface)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    fontFamily: "'Alata', sans-serif",
  } as React.CSSProperties,
  logoLink: {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    flex: "0 0 auto",
  } as React.CSSProperties,
  logoDe: {
    color: "var(--color-brand-primary)",
  } as React.CSSProperties,
  logoClutter: {
    color: "var(--color-text-primary)",
  } as React.CSSProperties,
  navItems: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "40px",
    flex: "1 1 auto",
  } as React.CSSProperties,
  navLink: {
    fontSize: "0.95rem",
    fontWeight: 500,
    padding: "8px 0",
    lineHeight: 1,
  } as React.CSSProperties,
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flex: "0 0 auto",
  } as React.CSSProperties,
};

export default NavBar;
