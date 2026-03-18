import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignupFormProps {
  onAuthenticate: () => void;
}

function SignupForm({ onAuthenticate }: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (fullName && email && password && confirmPassword) {
      if (password === confirmPassword) {
        onAuthenticate();
      } else {
        alert("Passwords do not match!");
      }
    }
  };

  return (
    <div style={styles.leftSection}>
      <div style={styles.card} className="auth-card">
        {/* Title */}
        <h1 style={styles.title} className="auth-title">
          Create Account
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle} className="auth-subtitle">
          Sign up to generate interior redesigns
        </p>

        {/* Full Name field group */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.emailInput}
            className="auth-email-input"
          />
        </div>

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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.emailInput}
            className="auth-email-input"
          />
        </div>

        {/* Confirm Password field group */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.emailInput}
            className="auth-email-input"
          />
        </div>

        {/* Sign up button */}
        <button
          style={styles.emailButton}
          onClick={handleSignup}
          className="auth-email-button"
        >
          Sign up
        </button>

        {/* Login link */}
        <p style={styles.loginText} className="auth-login-text">
          Already have an account?{" "}
          <span
            style={styles.loginLink}
            onClick={() => navigate("/login")}
            className="auth-login-link"
          >
            Log in
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
    borderRadius: "20px",
    border: "1px solid #585858",
    fontSize: "14px",
    fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box",
  } as React.CSSProperties,
  emailButton: {
    width: "100%",
    height: "40px",
    backgroundColor: "#9ac1f7ff",
    border: "1px solid #9ac1f7ff",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'Lato', sans-serif",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  loginText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    textAlign: "center",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
  loginLink: {
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
};

export default SignupForm;
