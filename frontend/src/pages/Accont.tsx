import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

function Account() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch currently logged-in user from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
      } else {
        // Redirect to login if user is not authenticated
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleMenuClick = async (action: string) => {
    console.log(`${action} clicked`);

    if (action === "Sign out") {
      try {
        await signOut(auth);
        localStorage.removeItem("authToken");
        navigate("/");
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
    // TODO: Implement other action handlers
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={styles.pageContainer}>
          <div style={styles.contentWrapper}>
            <div style={styles.loadingContainer}>Loading user data...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // If no user found, show message
  if (!firebaseUser) {
    return (
      <Layout>
        <div style={styles.pageContainer}>
          <div style={styles.contentWrapper}>
            <div style={styles.errorContainer}>
              User data not found. Please log in again.
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.pageContainer}>
        <div style={styles.contentWrapper}>
          {/* My Account Section */}
          <h2 style={styles.sectionTitle}>My account</h2>
          <div style={styles.section}>
            <div style={styles.accountCard} className="account-card">
              <div style={styles.accountContent}>
                <div style={styles.avatarContainer}>
                  <img
                    src={firebaseUser.photoURL || "/profile logo.png"}
                    alt="User Avatar"
                    style={styles.avatar}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/profile logo.png";
                    }}
                  />
                </div>
                <div style={styles.userDetailsContainer}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Username</span>
                    <span style={styles.detailValue} className="detail-value">
                      {firebaseUser.displayName || "No name set"}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Email</span>
                    <span style={styles.detailValue} className="detail-value">
                      {firebaseUser.email || "No email set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Profile</h2>
            <div style={styles.card} className="menu-card">
              <div style={styles.menuList}>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Edit profile photo")}
                >
                  Edit profile photo
                </button>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Change username")}
                >
                  Change username
                </button>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Switch accounts")}
                >
                  Switch accounts
                </button>
                <button
                  style={{ ...styles.menuItem, borderBottomWidth: 0 }}
                  onClick={() => handleMenuClick("Sign out")}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Privacy & Security</h2>
            <div style={styles.card} className="menu-card">
              <div style={styles.menuList}>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Change password")}
                >
                  Change password
                </button>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Enable / Disable 2FA")}
                >
                  Enable / Disable 2FA
                </button>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Login activity")}
                >
                  Login activity
                </button>
                <button
                  style={styles.menuItem}
                  onClick={() => handleMenuClick("Download my data")}
                >
                  Download my data
                </button>
                <button
                  style={{ ...styles.menuItem, borderBottomWidth: 0 }}
                  onClick={() => handleMenuClick("Delete account")}
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  pageContainer: {
    width: "100%",
    minHeight: "100vh",
    padding: "40px 20px",
    backgroundColor: "inherit",
  } as React.CSSProperties,
  contentWrapper: {
    maxWidth: "1050px",
    margin: "0 auto",
  } as React.CSSProperties,
  section: {
    marginBottom: "32px",
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1a1a1a",
    letterSpacing: "0.5px",
  } as React.CSSProperties,
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #999999",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  accountContent: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  } as React.CSSProperties,
  avatarContainer: {
    flexShrink: 0,
  } as React.CSSProperties,
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    objectFit: "cover",
    border: "2px solid #999999",
  } as React.CSSProperties,
  userDetailsContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  } as React.CSSProperties,
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  } as React.CSSProperties,
  detailLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#666666",
    flexShrink: 0,
  } as React.CSSProperties,
  detailValue: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "right",
    flex: 1,
  } as React.CSSProperties,
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #999999",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  } as React.CSSProperties,
  menuList: {
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  menuItem: {
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid #999999",
    padding: "16px 24px",
    textAlign: "left",
    color: "#0066cc",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "16px",
    color: "#666666",
  } as React.CSSProperties,
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "16px",
    color: "#d32f2f",
    padding: "20px",
    textAlign: "center",
  } as React.CSSProperties,
} as const;

// Add hover state
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  [data-theme="dark"] h2 {
    color: #e8e8e8 !important;
  }
  
  [data-theme="dark"] .account-card {
    background-color: #38383893 !important;
    border-color: #999999 !important;
  }
  
  [data-theme="dark"] .section-card {
    background-color: #555 !important;
    border-color: #404040 !important;
  }
  
  [data-theme="dark"] .menu-card {
    background-color: #38383893 !important;
  }
  
  [data-theme="dark"] button[style*="color: #0066cc"] {
    color: #4a9eff !important;
  }
  
  [data-theme="dark"] .detail-label {
    color: #aaaaaa !important;
  }
  
  [data-theme="dark"] .detail-value {
    color: #ffffff !important;
  }
  
  button[style*="color: #0066cc"]:hover {
    background-color: #f5f5f5;
  }
  
  [data-theme="dark"] button[style*="color: #4a9eff"]:hover {
    background-color: #404040 !important;
  }
`;
document.head.appendChild(styleSheet);

export default Account;
