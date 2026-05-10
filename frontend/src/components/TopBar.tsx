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

        .signin-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 1.25rem;
          background: linear-gradient(135deg, #4790fdff 0%, #4790fdff 100%);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-size: 1.08rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          font-family: 'Alata', sans-serif;
          box-shadow: 0 2px 10px rgba(67, 132, 226, 0.3);
          transition: box-shadow 0.25s ease, transform 0.2s ease, background 0.25s ease;
          overflow: hidden;
        }
        .signin-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%);
          border-radius: inherit;
          pointer-events: none;
        }
        .signin-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba(67, 132, 226, 0.35);
          background: linear-gradient(135deg, #3c7ad6 0%, #78aef8 100%);
        }
        .signin-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(67, 132, 226, 0.3);
        }
        [data-theme="dark"] .signin-btn {
          background: linear-gradient(135deg, #2a5cb5 0%, #4384e2 100%);
          box-shadow: 0 2px 14px rgba(67, 132, 226, 0.25);
        }
        [data-theme="dark"] .signin-btn:hover {
          background: linear-gradient(135deg, #3272cc 0%, #5a9ef5 100%);
          box-shadow: 0 6px 22px rgba(67, 132, 226, 0.4);
        }
      `}</style>

      {/* Logo */}
      <div style={styles.logoSection}>
        <img
          src="/Declutter logo.png"
          alt="DeClutter Logo"
          style={styles.logo}
        />
      </div>

      {/* Nav links */}
      <nav style={styles.navSection}>
        <Link to="/" className={`topbar-link${isActive("/") ? " active" : ""}`}>
          Home
        </Link>
        <Link
          to="/about"
          className={`topbar-link${isActive("/about") ? " active" : ""}`}
        >
          About
        </Link>
        <Link
          to="/blog"
          className={`topbar-link${isActive("/blog") ? " active" : ""}`}
        >
          Blog
        </Link>
        {showSignIn && (
          <button
            className="signin-btn"
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
