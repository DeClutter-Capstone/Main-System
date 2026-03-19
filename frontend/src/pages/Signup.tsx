import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import SignupForm from "../components/SignupForm";

interface SignupProps {
  onAuthenticate: (authenticated: boolean) => void;
}

function Signup({ onAuthenticate }: SignupProps) {
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
        <SignupForm onAuthenticate={onAuthenticate} />
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
  [data-theme="dark"] .auth-login-text {
    color: #ffffff !important;
  }
  [data-theme="dark"] .auth-login-link {
    color: #3058b1ff !important;
  }
`;
document.head.appendChild(styleSheet);

export default Signup;
