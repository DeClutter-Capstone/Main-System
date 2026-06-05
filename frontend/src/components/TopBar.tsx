import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when route changes
  useEffect(() => {
    const id = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(id);
  }, [location.pathname]);

  // Close menu when viewport grows past mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const isActive = (path: string) => location.pathname === path;
  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog" },
  ];

  return (
    <div style={styles.container} className="topbar-container" ref={menuRef}>
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
        .nav-link:hover { color: var(--color-text-primary); }
        .nav-link.active { color: var(--color-brand-primary); }

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
          width: 100%; height: 100%;
          object-fit: cover; display: block;
        }

        /* ── Burger button ── */
        .burger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: transparent;
          border: 1px solid var(--color-border-subtle);
          border-radius: 8px;
          cursor: pointer;
          padding: 0;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .burger-btn:hover {
          background-color: var(--color-bg-elevated);
        }
        .burger-line {
          width: 18px;
          height: 2px;
          background: var(--color-text-secondary);
          border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }
        .burger-btn.open .burger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .burger-btn.open .burger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .burger-btn.open .burger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Mobile nav drawer ── */
        .mobile-nav {
          display: none;
          flex-direction: column;
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: var(--color-bg-surface);
          border-bottom: 1px solid var(--color-border-low);
          padding: 1rem 1.5rem 1.5rem;
          gap: 0;
          z-index: 99;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          animation: drawer-slide 0.22s ease forwards;
        }
        [data-theme="dark"] .mobile-nav {
          background: #1a1a1a !important;
          border-bottom-color: #333 !important;
        }
        @keyframes drawer-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav.open { display: flex; }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          padding: 0.9rem 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          font-family: inherit;
          border-bottom: 1px solid var(--color-border-low);
          transition: color 0.15s ease, background-color 0.15s ease;
          border-radius: 6px;
        }
        .mobile-nav-link:last-of-type { border-bottom: none; }
        .mobile-nav-link:hover { color: var(--color-text-primary); background-color: var(--color-bg-elevated); }
        .mobile-nav-link.active { color: var(--color-brand-primary); }

        .mobile-nav-divider {
          height: 1px;
          background: var(--color-border-low);
          margin: 0.75rem 0;
        }

        .mobile-nav-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.25rem;
          gap: 0.75rem;
        }

        /* ── Breakpoints ── */
        .burger-btn-wrap { display: none; }

        @media (max-width: 640px) {
          .topbar-desktop-nav { display: none !important; }
          .topbar-desktop-right { display: none !important; }
          .burger-btn-wrap { display: flex !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>

      {/* Logo */}
      <Link to="/" style={styles.logoSection}>
        <span style={{ color: "var(--color-brand-primary)" }}>De</span>
        <span style={{ color: "var(--color-text-primary)" }}>Clutter</span>
      </Link>

      {/* Desktop nav center */}
      <nav style={styles.navSection} className="topbar-desktop-nav">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              ...styles.navLink,
              ...(isActive(to) && { color: "var(--color-brand-primary)" }),
            }}
            className={`nav-link${isActive(to) ? " active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop right */}
      <div style={styles.rightSection} className="topbar-desktop-right">
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
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Mobile burger — hidden on desktop via CSS */}
      <div className="burger-btn-wrap" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          className={`burger-btn${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-nav${menuOpen ? " open" : ""}`} role="navigation" aria-label="Mobile navigation">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`mobile-nav-link${isActive(to) ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <div className="mobile-nav-divider" />
        <div className="mobile-nav-actions">
          {currentUser ? (
            <button
              className="avatar-btn"
              onClick={() => { navigate("/account"); setMenuOpen(false); }}
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
              style={{ flex: 1 }}
              onClick={() => {
                if (onSignIn) onSignIn();
                navigate("/login", { replace: true });
                setMenuOpen(false);
              }}
            >
              Sign in
            </button>
          ) : <div />}
          <button
            className="nav-icon-btn"
            style={styles.toggleButton}
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
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
};

export default TopBar;
