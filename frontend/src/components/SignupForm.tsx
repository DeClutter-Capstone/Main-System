import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { toast } from "react-toastify";

interface SignupFormProps {
  onAuthenticate: (authenticated: boolean) => void;
}

interface FieldErrors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function validate(
  field: keyof FieldErrors,
  value: string,
  extra?: string,
): string {
  switch (field) {
    case "fullName":
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    case "email":
      if (!value.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Enter a valid email address.";
      return "";
    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (!/\d/.test(value)) return "Password must contain at least one number.";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== extra) return "Passwords do not match.";
      return "";
    default:
      return "";
  }
}

function SignupForm({ onAuthenticate }: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();

  const errors: FieldErrors = {
    fullName: validate("fullName", fullName),
    email: validate("email", email),
    password: validate("password", password),
    confirmPassword: validate("confirmPassword", confirmPassword, password),
  };

  const touch = (field: keyof FieldErrors) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const touchAll = () =>
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });

  const isFormValid = Object.values(errors).every((e) => e === "");

  const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    touchAll();
    if (!isFormValid) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: fullName });
      toast.success("Account created! Welcome to DeClutter.");
      onAuthenticate(true);
      setTimeout(() => navigate("/generate"), 500);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          toast.error("An account with this email already exists.", {
            position: "top-center",
            autoClose: 5000,
            theme: "colored",
          });
        } else if (error.message.includes("auth/weak-password")) {
          toast.error("Password is too weak. Choose a stronger one.", {
            position: "top-center",
            autoClose: 5000,
            theme: "colored",
          });
        } else if (error.message.includes("auth/invalid-email")) {
          toast.error("The email address is not valid.", {
            position: "top-center",
            autoClose: 5000,
            theme: "colored",
          });
        } else {
          toast.error("Something went wrong. Please try again.", {
            position: "top-center",
            autoClose: 5000,
            theme: "colored",
          });
        }
      }
    }
  };

  return (
    <div style={styles.leftSection} className="auth-left-section">
      <style>{`
        .auth-card {
          background-color: #eeeeeeff;
          color: #1f2937;
        }
        [data-theme="dark"] .auth-card {
          background-color: #2a2a2a !important;
          color: #ffffff !important;
        }
        .auth-title { color: #1f2937; }
        [data-theme="dark"] .auth-title { color: #ffffff !important; }
        .auth-subtitle { color: #6b7280; }
        [data-theme="dark"] .auth-subtitle { color: #cccccc !important; }
        .auth-label { color: #1f2937 !important; }
        [data-theme="dark"] .auth-label { color: #ffffff !important; }
        .auth-email-input {
          background-color: #ffffff;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
        }
        .auth-email-input::placeholder { color: #999999; }
        [data-theme="dark"] .auth-email-input {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          border: 1px solid #444444 !important;
        }
        [data-theme="dark"] .auth-email-input::placeholder { color: #888888 !important; }
        .auth-email-input.input-error { border-color: #ef4444 !important; }
        .auth-email-button { background-color: #4384E2; color: #ffffff; }
        [data-theme="dark"] .auth-email-button { background-color: #4384E2 !important; }
        .field-error {
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
          font-family: 'Lato', sans-serif;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        [data-theme="dark"] .field-error { color: #f87171 !important; }
      `}</style>
      <div style={styles.card} className="auth-card">
        <h1 style={styles.title} className="auth-title">Create Account</h1>
        <p style={styles.subtitle} className="auth-subtitle">
          Sign up to generate interior redesigns
        </p>

        {/* Full Name */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} className="auth-label">Full Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => touch("fullName")}
            style={styles.emailInput}
            className={`auth-email-input${touched.fullName && errors.fullName ? " input-error" : ""}`}
          />
          {touched.fullName && errors.fullName && (
            <span className="field-error">⚠ {errors.fullName}</span>
          )}
        </div>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} className="auth-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            style={styles.emailInput}
            className={`auth-email-input${touched.email && errors.email ? " input-error" : ""}`}
          />
          {touched.email && errors.email && (
            <span className="field-error">⚠ {errors.email}</span>
          )}
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} className="auth-label">Password</label>
          <input
            type="password"
            placeholder="Min. 8 characters, include a number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch("password")}
            style={styles.emailInput}
            className={`auth-email-input${touched.password && errors.password ? " input-error" : ""}`}
          />
          {touched.password && errors.password && (
            <span className="field-error">⚠ {errors.password}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} className="auth-label">Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => touch("confirmPassword")}
            style={styles.emailInput}
            className={`auth-email-input${touched.confirmPassword && errors.confirmPassword ? " input-error" : ""}`}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <span className="field-error">⚠ {errors.confirmPassword}</span>
          )}
        </div>

        <button
          style={{
            ...styles.emailButton,
            opacity: !isFormValid && Object.values(touched).some(Boolean) ? 0.6 : 1,
          }}
          onClick={handleSignup}
          className="auth-email-button"
        >
          Sign up
        </button>

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
  } as CSSProperties,
  card: {
    width: "420px",
    padding: "32px",
    borderRadius: "10px",
    backgroundColor: "#eeeeeeff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 13px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Lato', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  } as CSSProperties,
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0",
    fontFamily: "'Lato', sans-serif",
    textAlign: "center",
  } as CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    fontFamily: "'Lato', sans-serif",
    textAlign: "center",
  } as CSSProperties,
  emailInput: {
    width: "100%",
    height: "40px",
    padding: "0 16px",
    borderRadius: "7px",
    border: "1px solid #585858b6",
    fontSize: "14px",
    fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box",
  } as CSSProperties,
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
    marginTop: "0.3rem",
    transition: "background-color 0.3s ease, opacity 0.2s ease",
  } as CSSProperties,
  loginText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    textAlign: "center",
    fontFamily: "'Lato', sans-serif",
  } as CSSProperties,
  loginLink: {
    color: "#587dceff",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
    transition: "color 0.3s ease",
  } as CSSProperties,
  label: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "'Lato', sans-serif",
    margin: "0",
  } as CSSProperties,
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  } as CSSProperties,
};

export default SignupForm;
