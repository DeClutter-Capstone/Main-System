import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import LoginForm from "../components/LoginForm";

interface AuthenticationProps {
  onAuthenticate: (authenticated: boolean) => void;
}

function Authentication({ onAuthenticate }: AuthenticationProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    const handleDarkModeChange = () => {
      const darkMode = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkMode);
    };

    const interval = setInterval(handleDarkModeChange, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.pageContainer} className="auth-container">
      <TopBar />
      <div style={styles.mainContent}>
        <LoginForm onAuthenticate={onAuthenticate} />
        {/* Right side - Visual section */}
        <div style={styles.rightSection}>
          <img
            src={isDarkMode ? "/dark auth.png" : "/auth.jpg"}
            alt="Authentication background"
            style={styles.authImage}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#ffffff",
  } as React.CSSProperties,
  mainContent: {
    display: "flex",
    flex: 1,
    width: "100%",
  } as React.CSSProperties,
  leftSection: {
    flex: "0 0 50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#f5f5f5ff",
  } as React.CSSProperties,
  card: {
    width: "420px",
    padding: "32px",
    borderRadius: "10px",
    backgroundColor: "#eeeeeeff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 13px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Lato', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  } as React.CSSProperties,
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
  googleButton: {
    width: "100%",
    height: "44px",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    borderRadius: "24px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    fontFamily: "'Lato', sans-serif",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  googleIcon: {
    width: "20px",
    height: "20px",
  } as React.CSSProperties,
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "0.5rem 0",
  } as React.CSSProperties,
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#000000ff",
  } as React.CSSProperties,
  dividerText: {
    fontSize: "12px",
    color: "#000000ff",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
  emailInput: {
    width: "100%",
    height: "40px",
    padding: "0 16px",
    borderRadius: "8px",
    border: "1px solid #585858",
    fontSize: "14px",
    fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  emailButton: {
    width: "100%",
    height: "40px",
    backgroundColor: "#e6e6e6ff",
    border: "1px solid #a0a0a0ff",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  rightSection: {
    flex: "0 0 50%",
    overflow: "hidden",
  } as React.CSSProperties,
  authImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .auth-google-text {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-container {
    background-color: #252525ff !important;
  }
  [data-theme="dark"] .auth-card {
    background-color: #383838ff !important;
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-title {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-subtitle {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-divider-line {
    background-color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-divider-text {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-email-input {
    background-color: #383838ff !important;
    color: #ffffff !important;
    border-color: #555 !important;
  }
  [data-theme="dark"] .auth-card .auth-email-input::placeholder {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-card .auth-email-button {
    background-color: #74a1e0be !important;
    color: #ffffff !important;
    border-color: #555555 !important;
  }
  [data-theme="dark"] .auth-signup-text {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-signup-link {
    color: #3058b1ff !important;
  }
  [data-theme="dark"] .auth-login-text {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-login-link {
    color: #3058b1ff !important;
  }
`;
document.head.appendChild(styleSheet);

export default Authentication;
