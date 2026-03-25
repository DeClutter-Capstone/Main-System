import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { toast, Bounce } from "react-toastify";

interface SignupFormProps {
  onAuthenticate: (authenticated: boolean) => void;
}

function SignupForm({ onAuthenticate }: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && password && confirmPassword) {
      if (password === confirmPassword) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast.success("Signup successful!");
          onAuthenticate(true);
          // Navigate to generate page after successful signup
          setTimeout(() => navigate("/generate"), 500);
        } catch (error) {
          if (error instanceof Error) {
            if (
              error.message.includes("auth/email-already-in-use") ||
              error.message.includes("auth/weak-password") ||
              error.message.includes("auth/invalid-email")
            ) {
              toast.error(" Email or Password is incorrect!", {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
              });
            } else {
              toast.error(error.message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
              });
            }
          } else {
            toast.error("An error occurred during signup", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              transition: Bounce,
            });
          }
        }
      } else {
        toast.error("🔐 Passwords do not match!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      }
    } else {
      toast.error("⚠️ Please fill in all fields!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
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
          onClick={(e) => handleSignup(e as React.FormEvent)}
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
    marginTop: "0.7rem",
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
  messageText: {
    fontSize: "14px",
    color: "#dc2626",
    margin: "0",
    textAlign: "center",
    fontFamily: "'Lato', sans-serif",
  } as React.CSSProperties,
};

export default SignupForm;
