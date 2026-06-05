import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

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

  // Close on route change
  useEffect(() => {
    const id = setTimeout(() => setMenuOpen(false), 0);
    return () => clearTimeout(id);
  }, [location.pathname]);

  // Close on outside click
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

  // Close when resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  const navLinks: Array<{ to: string; label: string }> = [
    { to: "/generate", label: "Generate" },
    { to: "/projects", label: "My Projects" },
    { to: "/history", label: "History" },
  ];

  return (
    <nav style={styles.navbar} className="app-navbar" ref={menuRef}>
      <style>{`
        .app-navbar {
          border-bottom: 1px solid var(--color-border-low);
        }
        [data-theme="dark"] .app-navbar {
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
        .nav-profile:hover { opacity: 0.85; }

        /* ── Burger button ── */
        .navbar-burger {
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
          transition: background-color 0.15s ease;
        }
        .navbar-burger:hover { background-color: var(--color-bg-elevated); }
        .navbar-burger-line {
          width: 18px;
          height: 2px;
          background: var(--color-text-secondary);
          border-radius: 2px;
          transition: all 0.25s ease;
          transform-origin: center;
        }
        .navbar-burger.open .navbar-burger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .navbar-burger.open .navbar-burger-line:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .navbar-burger.open .navbar-burger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── Mobile drawer ── */
        .navbar-mobile-drawer {
          display: none;
          flex-direction: column;
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          background: var(--color-bg-surface);
          border-bottom: 1px solid var(--color-border-low);
          padding: 1rem 1.5rem 1.5rem;
          z-index: 99;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          animation: navbar-drawer-slide 0.22s ease forwards;
        }
        [data-theme="dark"] .navbar-mobile-drawer {
          background: #1a1a1a !important;
          border-bottom-color: #333 !important;
        }
        @keyframes navbar-drawer-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .navbar-mobile-drawer.open { display: flex; }

        .navbar-mobile-link {
          display: flex;
          align-items: center;
          padding: 0.9rem 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          text-decoration: none;
          font-family: inherit;
          border-bottom: 1px solid var(--color-border-low);
          border-radius: 6px;
          transition: color 0.15s ease, background-color 0.15s ease;
        }
        .navbar-mobile-link:last-of-type { border-bottom: none; }
        .navbar-mobile-link:hover {
          color: var(--color-text-primary);
          background-color: var(--color-bg-elevated);
        }
        .navbar-mobile-link.active { color: var(--color-brand-primary); }

        .navbar-mobile-divider {
          height: 1px;
          background: var(--color-border-low);
          margin: 0.75rem 0;
        }

        .navbar-mobile-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.25rem;
        }

        /* ── Breakpoints ── */
        .navbar-burger-wrap { display: none; }

        @media (max-width: 640px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-desktop-right { display: none !important; }
          .navbar-burger-wrap   { display: flex !important; align-items: center; gap: 10px; }
          .navbar-burger        { display: flex !important; }
        }
      `}</style>

      {/* Logo */}
      <Link to="/" style={styles.logoLink}>
        <span style={styles.logoDe}>De</span>
        <span style={styles.logoClutter}>Clutter</span>
      </Link>

      {/* Desktop center links */}
      <div style={styles.navItems} className="navbar-desktop-links">
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

      {/* Desktop right */}
      <div style={styles.rightSection} className="navbar-desktop-right">
        <button
          className="nav-icon-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <img
          src={firebaseUser?.photoURL || "/profile logo.png"}
          alt="Profile"
          className="nav-profile"
          onClick={() => navigate("/account")}
          onError={(e) => { (e.target as HTMLImageElement).src = "/profile logo.png"; }}
        />
      </div>

      {/* Mobile burger */}
      <div className="navbar-burger-wrap">
        <button
          className={`navbar-burger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="navbar-burger-line" />
          <span className="navbar-burger-line" />
          <span className="navbar-burger-line" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar-mobile-drawer${menuOpen ? " open" : ""}`} role="navigation">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-mobile-link${isActive(link.to) ? " active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="navbar-mobile-divider" />
        <div className="navbar-mobile-actions">
          <img
            src={firebaseUser?.photoURL || "/profile logo.png"}
            alt="Profile"
            className="nav-profile"
            onClick={() => { navigate("/account"); setMenuOpen(false); }}
            onError={(e) => { (e.target as HTMLImageElement).src = "/profile logo.png"; }}
          />
          <button
            className="nav-icon-btn"
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
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
    transition: "background-color 0.3s ease",
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
