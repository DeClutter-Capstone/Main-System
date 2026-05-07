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

  const applyDarkMode = () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.backgroundColor = "#1a1a1a";
    document.documentElement.style.color = "#ffffff";
    document.body.style.backgroundColor = "#1a1a1a";
    document.body.style.color = "#ffffff";

    // Apply dark theme to all elements with specific styles
    document.querySelectorAll('[style*="background-color"]').forEach((el) => {
      const element = el as HTMLElement;
      const bgColor = element.style.backgroundColor;
      if (
        bgColor === "rgb(245, 245, 245)" ||
        bgColor === "#f5f5f5" ||
        bgColor === "rgba(245, 245, 245, 1)"
      ) {
        element.style.backgroundColor = "#2a2a2a";
      } else if (
        bgColor === "rgb(255, 255, 255)" ||
        bgColor === "#ffffff" ||
        bgColor === "rgba(255, 255, 255, 1)"
      ) {
        element.style.backgroundColor = "#1a1a1a";
      }
    });

    // Change all text colors to white
    document.querySelectorAll('[style*="color"]').forEach((el) => {
      const element = el as HTMLElement;
      if (
        element.style.color === "rgb(51, 51, 51)" ||
        element.style.color === "#333" ||
        element.style.color === "rgb(102, 102, 102)" ||
        element.style.color === "#666"
      ) {
        element.style.color = "#ffffff";
      }
    });

    // Also apply to all elements without style attribute
    document.querySelectorAll("*").forEach((el) => {
      const element = el as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      if (
        computedStyle.color === "rgb(51, 51, 51)" ||
        computedStyle.color === "rgb(0, 0, 0)"
      ) {
        element.style.color = "#ffffff";
      }
    });

    localStorage.setItem("darkMode", "true");
  };

  const applyLightMode = () => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.backgroundColor = "#ffffff";
    document.documentElement.style.color = "#000000";
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";

    // Reset all background colors
    document.querySelectorAll('[style*="background-color"]').forEach((el) => {
      const element = el as HTMLElement;
      const bgColor = element.style.backgroundColor;
      if (bgColor === "rgb(42, 42, 42)" || bgColor === "#2a2a2a") {
        element.style.backgroundColor = "#f5f5f5";
      } else if (bgColor === "rgb(26, 26, 26)" || bgColor === "#1a1a1a") {
        element.style.backgroundColor = "#ffffff";
      }
    });

    // Reset all text colors to dark, but skip elements inside protected sections
    document.querySelectorAll('[style*="color"]').forEach((el) => {
      const element = el as HTMLElement;
      if (element.closest("[data-hero-carousel]")) return;
      if (element.closest("[data-static-colors]")) return;
      if (
        element.style.color === "#ffffff" ||
        element.style.color === "rgb(255, 255, 255)"
      ) {
        element.style.color = "#333";
      }
    });

    // Reset all computed colors, but skip elements inside protected sections
    document.querySelectorAll("*").forEach((el) => {
      const element = el as HTMLElement;
      if (element.closest("[data-hero-carousel]")) return;
      if (element.closest("[data-static-colors]")) return;
      if (element.style.color === "#ffffff") {
        element.style.color = "#333";
      }
    });

    localStorage.setItem("darkMode", "false");
  };

  useEffect(() => {
    // Apply/remove dark mode based on state
    if (isDarkMode) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        applyDarkMode();
      }, 0);
    } else {
      setTimeout(() => {
        applyLightMode();
      }, 0);
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
          onClick={toggleDarkMode}
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
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
    marginLeft: "10px",
    margin: "4px",
    marginRight: "15px",
  } as React.CSSProperties,
  toggleIcon: {
    width: "24px",
    height: "24px",
  } as React.CSSProperties,
};

export default TopBar;
