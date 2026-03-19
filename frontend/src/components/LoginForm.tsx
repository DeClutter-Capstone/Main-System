import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Firebase/Firebase";

interface LoginFormProps {
  onAuthenticate: (authenticated: boolean) => void;
}

function LoginForm({ onAuthenticate }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMsg("Login successful!");
      onAuthenticate(true);
      // Navigate to generate page after successful login
      setTimeout(() => navigate("/generate"), 500);
    } catch (error) {
      if (error instanceof Error) {
        setMsg(error.message);
      } else {
        setMsg("An error occurred during login");
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert(`Welcome ${user.displayName}`);
      onAuthenticate(true);
      // Navigate to generate page after successful login
      setTimeout(() => navigate("/generate"), 500);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An error occurred during Google login");
      }
    }
  };

  return (
    <div style={styles.leftSection}>
      <div style={styles.card} className="auth-card">
        {/* Title */}
        <h1 style={styles.title} className="auth-title">
          Welcome to DeClutter
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle} className="auth-subtitle">
          log in or sign up to generate interior redesigns
        </p>

        {/* Email field group */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="Type in your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.emailInput}
            className="auth-email-input"
          />
        </div>

        {/* Password field group */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Type in your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.emailInput}
            className="auth-email-input"
          />
        </div>
        {/* Continue with email button */}
        <button
          style={styles.emailButton}
          onClick={(e) => handleLogin(e as React.FormEvent)}
          className="auth-email-button"
        >
          Continue with email
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} className="auth-divider-line"></div>
          <span style={styles.dividerText} className="auth-divider-text">
            OR
          </span>
          <div style={styles.dividerLine} className="auth-divider-line"></div>
        </div>

        {/* Google Sign-in button */}
        <button
          style={styles.googleButton}
          onClick={loginWithGoogle}
          className="auth-google-button"
        >
          <img src="/google icon.png" alt="Google" style={styles.googleIcon} />
          <span className="auth-google-text">Continue with Google</span>
        </button>

        {/* Error/Success message */}
        {msg && <p style={styles.messageText}>{msg}</p>}

        {/* Sign up link */}
        <p style={styles.signupText} className="auth-signup-text">
          Do you have an account?{" "}
          <span
            style={styles.signupLink}
            onClick={() => navigate("/signup")}
            className="auth-signup-link"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
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
    textAlign: "center",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    fontFamily: "'Lato', sans-serif",
    textAlign: "center",
  } as React.CSSProperties,
  googleButton: {
    width: "100%",
    height: "44px",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    fontFamily: "'Lato', sans-serif",
    transition: "background-color 0.3s ease",
    marginBottom: "1rem",
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
    borderRadius: "7px",
    border: "1px solid #585858b6",
    fontSize: "14px",
    fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  emailButton: {
    width: "100%",
    height: "40px",
    backgroundColor: "#9ac1f7ff",
    border: "1px solid #9ac1f7ff",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  signupText: {
    fontSize: "14px",
    margin: "0",
    textAlign: "center",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
  signupLink: {
    color: "#587dceff",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.3s ease",
  } as React.CSSProperties,
  label: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    fontFamily: "'Lato', sans-serif",
    margin: "0",
  } as React.CSSProperties,
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  } as React.CSSProperties,
  messageText: {
    fontSize: "14px",
    color: "#dc2626",
    margin: "0",
    textAlign: "center",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
};

export default LoginForm;
