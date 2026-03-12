import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function NavBar() {
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

    // Reset all text colors to dark
    document.querySelectorAll('[style*="color"]').forEach((el) => {
      const element = el as HTMLElement;
      if (
        element.style.color === "#ffffff" ||
        element.style.color === "rgb(255, 255, 255)"
      ) {
        element.style.color = "#333";
      }
    });

    // Reset all computed colors
    document.querySelectorAll("*").forEach((el) => {
      const element = el as HTMLElement;
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
        <img
          src="/profile logo.png"
          alt="Profile"
          style={styles.profileIcon}
          onClick={() => navigate("/account")}
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
    gap: "1rem",
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
    transition: "opacity 0.3s ease",
  } as React.CSSProperties,
};

export default NavBar;
