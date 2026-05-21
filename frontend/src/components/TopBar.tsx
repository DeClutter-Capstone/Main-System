import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

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
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return unsub;
  }, []);

  const applyDarkMode = () => {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("darkMode", "true");
  };

  const applyLightMode = () => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("darkMode", "false");
  };

  useEffect(() => {
    if (isDarkMode) {
      applyDarkMode();
    } else {
      applyLightMode();
    }
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  return (
    <div style={styles.container} className="topbar-container">
      <style>{`
        [data-theme="dark"] .topbar-container {
          background-color: #1a1a1a !important;
          border-bottom-color: #333 !important;
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
        .signin-btn {
          background-color: transparent;
          color: var(--color-brand-primary);
          border: 1.5px solid color-mix(in srgb, var(--color-brand-primary) 60%, transparent);
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          letter-spacing: 0.01em;
        }
        .signin-btn:hover {
          background-color: color-mix(in srgb, var(--color-brand-primary) 8%, transparent);
          border-color: var(--color-brand-primary);
        }
        .signin-btn:active {
          background-color: color-mix(in srgb, var(--color-brand-primary) 14%, transparent);
          border-color: var(--color-brand-primary);
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
        .avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--color-brand-primary);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-brand-primary);
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 0;
          flex-shrink: 0;
          transition: box-shadow 0.15s ease;
        }
        .avatar-btn:hover {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand-primary) 30%, transparent);
        }
        .avatar-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      `}</style>
      {/* Logo */}
      <Link to="/" style={styles.logoSection}>
        <span style={{ color: "var(--color-brand-primary)" }}>De</span>
        <span style={{ color: "var(--color-text-primary)" }}>Clutter</span>
      </Link>

      {/* Navigation links in center */}
      <nav style={styles.navSection}>
        <Link
          to="/"
          style={{
            ...styles.navLink,
            ...(isActive("/") && { color: "var(--color-brand-primary)" }),
          }}
          className={`nav-link${isActive("/") ? " active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          style={{
            ...styles.navLink,
            ...(isActive("/about") && { color: "var(--color-brand-primary)" }),
          }}
          className={`nav-link${isActive("/about") ? " active" : ""}`}
        >
          About
        </Link>
        <Link
          to="/blog"
          style={{
            ...styles.navLink,
            ...(isActive("/blog") && { color: "var(--color-brand-primary)" }),
          }}
          className={`nav-link${isActive("/blog") ? " active" : ""}`}
        >
          Blog
        </Link>
      </nav>

      {/* Right side - Sign In & Dark Mode */}
      <div style={styles.rightSection}>
        <div>
          {currentUser ? (
            <button
              className="avatar-btn"
              onClick={() => navigate("/account")}
              title="Go to account"
              aria-label="Account"
            >
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" referrerPolicy="no-referrer" />
              ) : (
                (currentUser.displayName?.[0] ?? currentUser.email?.[0] ?? "U").toUpperCase()
              )}
            </button>
          ) : showSignIn ? (
            <button
              className="signin-btn"
              onClick={() => {
                if (onSignIn) onSignIn();
                navigate("/login", { replace: true });
              }}
            >
              Sign in
            </button>
          ) : null}
        </div>
        <button
          className="nav-icon-btn"
          style={styles.toggleButton}
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
      </div>
    </div>
  );
}

const styles = {
  container: {
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
    borderBottom: "1px solid var(--color-border-low)",
  } as React.CSSProperties,
  logoSection: {
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    flex: "0 0 auto",
    gap: "0",
    color: "inherit",
  } as React.CSSProperties,
  navSection: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flex: "1 1 auto",
    justifyContent: "center",
  } as React.CSSProperties,
  navLink: {
    color: "var(--color-text-secondary)",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.15s ease",
    fontFamily: "inherit",
    padding: "8px 0",
    textDecoration: "none",
    lineHeight: 1,
  } as React.CSSProperties,
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flex: "0 0 auto",
  } as React.CSSProperties,
  toggleButton: {
    background: "transparent",
    border: "1px solid var(--color-border-subtle)",
    color: "var(--color-text-secondary)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease",
  } as React.CSSProperties,
  toggleIcon: {
    width: "18px",
    height: "18px",
  } as React.CSSProperties,
};

export default TopBar;
