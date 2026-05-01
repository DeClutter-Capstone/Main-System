import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOut,
  onAuthStateChanged,
  type User,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { toast } from "react-toastify";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../Firebase/Firebase";

interface SavedAccount {
  email: string;
  displayName?: string;
  uid: string;
  provider: "google" | "email";
}

interface LoginActivity {
  id: string;
  uid: string;
  email: string;
  timestamp: number;
  deviceInfo: string;
  ipAddress?: string;
  location?: string;
  loginMethod: "google" | "email";
}

function Account() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] =
    useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Password change states
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Switch account states
  const [isSwitchAccountModalOpen, setIsSwitchAccountModalOpen] =
    useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isSwitchEmailFormOpen, setIsSwitchEmailFormOpen] = useState(false);
  const [switchEmailInput, setSwitchEmailInput] = useState("");
  const [switchEmailPassword, setSwitchEmailPassword] = useState("");
  const [showSwitchEmailPassword, setShowSwitchEmailPassword] = useState(false);
  const [isSwitchingWithEmail, setIsSwitchingWithEmail] = useState(false);

  // Login activity states
  const [isLoginActivityModalOpen, setIsLoginActivityModalOpen] =
    useState(false);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Delete account states
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const navigate = useNavigate();

  // Fetch currently logged-in user from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        // Save current account and load other saved accounts
        const method = user.providerData.some(
          (p) => p.providerId === "google.com",
        )
          ? "google"
          : "email";
        saveSwitchedAccount(
          user.email || "",
          user.displayName || "",
          user.uid,
          method,
        );
        loadSavedAccounts(user.uid);
        // Track this login with the correct method
        trackLoginActivity(user.uid, user.email || "", method);
      } else {
        // Redirect to login if user is not authenticated
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Track login activity
  const trackLoginActivity = async (
    uid: string,
    email: string,
    method: "google" | "email",
  ) => {
    try {
      const deviceInfo = navigator.userAgent;

      // Try to get IP address (requires backend API or third-party service)
      let ipAddress = "Unknown";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        console.log("Could not fetch IP address");
      }

      await addDoc(collection(db, "loginActivity"), {
        uid,
        email,
        timestamp: Date.now(),
        deviceInfo,
        ipAddress,
        location: "Unknown", // Would need geolocation API or backend
        loginMethod: method,
      });
    } catch (error) {
      console.error("Error tracking login activity:", error);
    }
  };

  // Load login activity
  const loadLoginActivity = async (uid: string) => {
    try {
      setIsLoadingActivities(true);
      const q = query(
        collection(db, "loginActivity"),
        where("uid", "==", uid),
        orderBy("timestamp", "desc"),
        limit(20),
      );

      const querySnapshot = await getDocs(q);
      const activities: LoginActivity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          uid: data.uid,
          email: data.email,
          timestamp: data.timestamp,
          deviceInfo: data.deviceInfo,
          ipAddress: data.ipAddress,
          location: data.location,
          loginMethod: data.loginMethod,
        });
      });

      setLoginActivities(activities);
    } catch (error) {
      console.error("Error loading login activity:", error);
      toast.error("Failed to load login activity");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getDeviceName = (userAgent: string) => {
    if (userAgent.includes("Windows")) return "Windows PC";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Android")) return "Android Device";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown Device";
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown Browser";
  };

  const loadSavedAccounts = (currentUid: string) => {
    try {
      const saved = localStorage.getItem("allAccounts");
      if (saved) {
        const accounts: SavedAccount[] = JSON.parse(saved);
        // Only show other non-email accounts (exclude email/password accounts)
        const otherAccounts = accounts.filter(
          (acc) => acc.uid !== currentUid && acc.provider !== "email",
        );
        setSavedAccounts(otherAccounts);
      } else {
        setSavedAccounts([]);
      }
    } catch (error) {
      console.error("Error loading saved accounts:", error);
      setSavedAccounts([]);
    }
  };

  const saveSwitchedAccount = (
    email: string,
    displayName?: string,
    uid?: string,
    provider: "google" | "email" = "email",
  ) => {
    try {
      if (!uid) return;

      const saved = localStorage.getItem("allAccounts");
      let accounts: SavedAccount[] = saved ? JSON.parse(saved) : [];

      // Check if account already exists
      const existingIndex = accounts.findIndex((acc) => acc.uid === uid);

      if (existingIndex >= 0) {
        // Update existing account
        accounts[existingIndex] = { email, displayName, uid, provider };
      } else {
        // Add new account
        accounts.push({ email, displayName, uid, provider });
      }

      // Keep only last 5 accounts
      if (accounts.length > 5) {
        accounts = accounts.slice(-5);
      }

      localStorage.setItem("allAccounts", JSON.stringify(accounts));
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const handleOpenSwitchAccount = () => {
    loadSavedAccounts(firebaseUser?.uid || "");
    setIsSwitchAccountModalOpen(true);
  };

  const handleSwitchWithGoogle = async () => {
    try {
      setIsSwitchingAccount(true);
      const googleProvider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, googleProvider);

      // Save the account
      saveSwitchedAccount(
        result.user.email || "",
        result.user.displayName || "",
        result.user.uid,
        "google",
      );

      toast.success(`Switched to ${result.user.email}`);
      setIsSwitchAccountModalOpen(false);
    } catch (error: unknown) {
      console.error("Error switching with Google:", error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        toast.error("Failed to switch account");
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleSwitchWithEmail = async () => {
    if (!switchEmailInput || !switchEmailPassword) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      setIsSwitchingWithEmail(true);
      const result = await signInWithEmailAndPassword(
        auth,
        switchEmailInput,
        switchEmailPassword,
      );
      saveSwitchedAccount(
        result.user.email || "",
        result.user.displayName || "",
        result.user.uid,
        "email",
      );
      toast.success(`Switched to ${result.user.email}`);
      setIsSwitchAccountModalOpen(false);
      setSwitchEmailInput("");
      setSwitchEmailPassword("");
      setIsSwitchEmailFormOpen(false);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password");
      } else if (firebaseError.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error("Failed to sign in");
      }
    } finally {
      setIsSwitchingWithEmail(false);
    }
  };

  const handleSwitchToSavedAccount = async (account: SavedAccount) => {
    try {
      setIsSwitchingAccount(true);
      const googleProvider = new GoogleAuthProvider();

      // Set login hint to suggest the saved account email
      googleProvider.setCustomParameters({ login_hint: account.email });

      const result = await signInWithPopup(auth, googleProvider);

      toast.success(`Switched to ${result.user.email}`);
      setIsSwitchAccountModalOpen(false);
    } catch (error: unknown) {
      console.error("Error switching to saved account:", error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        toast.error("Failed to switch account");
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleAddNewAccountWithGoogle = async () => {
    try {
      setIsSwitchingAccount(true);
      const googleProvider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, googleProvider);

      // Save the account
      saveSwitchedAccount(
        result.user.email || "",
        result.user.displayName || "",
        result.user.uid,
        "google",
      );

      toast.success(`Added account ${result.user.email}`);
      setIsSwitchAccountModalOpen(false);
    } catch (error: unknown) {
      console.error("Error adding account:", error);
      const firebaseError = error as { code?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        toast.error("Failed to add account");
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (newUsername.length < 3) {
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (newUsername.length > 50) {
      toast.error("Username must be less than 50 characters");
      return;
    }

    if (firebaseUser) {
      try {
        setIsUpdatingUsername(true);
        await updateProfile(firebaseUser, {
          displayName: newUsername,
        });

        // Refresh the user data
        setFirebaseUser({
          ...firebaseUser,
          displayName: newUsername,
        });

        toast.success("Username updated successfully!");
        setIsChangeUsernameModalOpen(false);
        setNewUsername("");
      } catch (error) {
        console.error("Error updating username:", error);
        toast.error("Failed to update username. Please try again.");
      } finally {
        setIsUpdatingUsername(false);
      }
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    if (firebaseUser && firebaseUser.email) {
      try {
        setIsUpdatingPassword(true);

        // Re-authenticate the user with current password
        const credential = EmailAuthProvider.credential(
          firebaseUser.email,
          currentPassword,
        );

        await reauthenticateWithCredential(firebaseUser, credential);

        // Update password
        await updatePassword(firebaseUser, newPassword);

        toast.success("Password updated successfully!");
        setIsChangePasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: unknown) {
        console.error("Error updating password:", error);
        const firebaseError = error as { code?: string };
        if (firebaseError.code === "auth/wrong-password") {
          toast.error("Current password is incorrect");
        } else if (firebaseError.code === "auth/weak-password") {
          toast.error("New password is too weak");
        } else {
          toast.error("Failed to update password. Please try again.");
        }
      } finally {
        setIsUpdatingPassword(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) {
      toast.error("User not found");
      return;
    }

    try {
      setIsDeletingAccount(true);

      // Delete the user from Firebase Authentication
      await deleteUser(firebaseUser);

      // Clear local storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("allAccounts");

      toast.success("Account deleted successfully");

      // Redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      const firebaseError = error as { code?: string };

      if (firebaseError.code === "auth/requires-recent-login") {
        toast.error(
          "For security reasons, please sign out and sign back in before deleting your account",
        );
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteAccountModalOpen(false);
    }
  };

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
    } else if (action === "Change username") {
      setNewUsername(firebaseUser?.displayName || "");
      setIsChangeUsernameModalOpen(true);
    } else if (action === "Change password") {
      setIsChangePasswordModalOpen(true);
    } else if (action === "Switch accounts") {
      handleOpenSwitchAccount();
    } else if (action === "Login activity") {
      loadLoginActivity(firebaseUser?.uid || "");
      setIsLoginActivityModalOpen(true);
    } else if (action === "Delete account") {
      setIsDeleteAccountModalOpen(true);
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
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Signed in with</span>
                    <span
                      style={
                        firebaseUser.providerData.some(
                          (p) => p.providerId === "google.com",
                        )
                          ? styles.signInBadgeGoogle
                          : styles.signInBadgeEmail
                      }
                    >
                      {firebaseUser.providerData.some(
                        (p) => p.providerId === "google.com",
                      )
                        ? "Google"
                        : "Email & Password"}
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
                {!firebaseUser.providerData.some(
                  (p) => p.providerId === "google.com",
                ) && (
                  <button
                    style={styles.menuItem}
                    onClick={() => handleMenuClick("Change password")}
                  >
                    Change password
                  </button>
                )}
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

          {/* Change Username Modal */}
          {isChangeUsernameModalOpen && (
            <div
              style={styles.modalOverlay}
              onClick={() => setIsChangeUsernameModalOpen(false)}
            >
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Change Username</h3>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      style={styles.input}
                      maxLength={50}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleChangeUsername();
                        }
                      }}
                    />
                    <p style={styles.charCount}>
                      {newUsername.length}/50 characters
                    </p>
                  </div>
                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => {
                        setIsChangeUsernameModalOpen(false);
                        setNewUsername("");
                      }}
                      disabled={isUpdatingUsername}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={handleChangeUsername}
                      disabled={isUpdatingUsername}
                    >
                      {isUpdatingUsername ? "Updating..." : "Update Username"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {isChangePasswordModalOpen && (
            <div
              style={styles.modalOverlay}
              onClick={() => setIsChangePasswordModalOpen(false)}
            >
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Change Password</h3>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Password</label>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        style={styles.input}
                      />
                      <button
                        style={styles.togglePasswordButton}
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        type="button"
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        style={styles.input}
                      />
                      <button
                        style={styles.togglePasswordButton}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        type="button"
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p style={styles.helpText}>At least 6 characters</p>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        style={styles.input}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleChangePassword();
                          }
                        }}
                      />
                      <button
                        style={styles.togglePasswordButton}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        type="button"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => {
                        setIsChangePasswordModalOpen(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      disabled={isUpdatingPassword}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={handleChangePassword}
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Current Account Password Modal */}
          {/* REMOVED - No longer needed with Google Sign-In */}

          {/* Switch Account Modal */}
          {isSwitchAccountModalOpen && (
            <div
              style={styles.modalOverlay}
              onClick={() => {
                setIsSwitchAccountModalOpen(false);
                setIsSwitchEmailFormOpen(false);
                setSwitchEmailInput("");
                setSwitchEmailPassword("");
              }}
            >
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Switch Account</h3>
                <div style={styles.modalBody}>
                  <p style={styles.modalDescription}>
                    Choose how to switch accounts:
                  </p>

                  {/* Google Sign-In Section */}
                  <div style={styles.methodSection}>
                    <h4 style={styles.methodTitle}>Quick Switch with Google</h4>
                    <button
                      style={{
                        ...styles.submitButton,
                        width: "100%",
                        marginBottom: "12px",
                      }}
                      onClick={handleSwitchWithGoogle}
                      disabled={isSwitchingAccount || isSwitchingWithEmail}
                    >
                      {isSwitchingAccount
                        ? "Switching..."
                        : "Sign in with Google"}
                    </button>
                  </div>

                  {/* Email Sign-In Section */}
                  <div style={styles.methodSection}>
                    <h4 style={styles.methodTitle}>Or sign in with Email</h4>
                    <button
                      style={{
                        ...styles.submitButton,
                        width: "100%",
                        marginBottom: isSwitchEmailFormOpen ? "12px" : "0",
                      }}
                      onClick={() =>
                        setIsSwitchEmailFormOpen(!isSwitchEmailFormOpen)
                      }
                      disabled={isSwitchingAccount || isSwitchingWithEmail}
                    >
                      Sign in with Email
                    </button>
                    {isSwitchEmailFormOpen && (
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={switchEmailInput}
                          onChange={(e) => setSwitchEmailInput(e.target.value)}
                          style={{ ...styles.input, marginBottom: "8px" }}
                        />
                        <div style={styles.passwordInputContainer}>
                          <input
                            type={showSwitchEmailPassword ? "text" : "password"}
                            placeholder="Password"
                            value={switchEmailPassword}
                            onChange={(e) =>
                              setSwitchEmailPassword(e.target.value)
                            }
                            style={styles.input}
                          />
                          <button
                            style={styles.togglePasswordButton}
                            onClick={() =>
                              setShowSwitchEmailPassword(
                                !showSwitchEmailPassword,
                              )
                            }
                          >
                            {showSwitchEmailPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <button
                          style={{
                            ...styles.submitButton,
                            width: "100%",
                            marginTop: "8px",
                          }}
                          onClick={handleSwitchWithEmail}
                          disabled={isSwitchingWithEmail}
                        >
                          {isSwitchingWithEmail ? "Signing in..." : "Confirm"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Saved Accounts Section */}
                  {savedAccounts.length > 0 && (
                    <div style={styles.methodSection}>
                      <h4 style={styles.methodTitle}>
                        Or use an account signed in before:
                      </h4>
                      <div style={styles.accountList}>
                        {savedAccounts.map((account) => (
                          <button
                            key={account.uid}
                            style={styles.switchAccountButton}
                            onClick={() => handleSwitchToSavedAccount(account)}
                            disabled={isSwitchingAccount}
                          >
                            <div style={styles.accountButtonContent}>
                              <span style={styles.accountEmail}>
                                {account.email}
                              </span>
                              {account.displayName && (
                                <span style={styles.accountName}>
                                  {account.displayName}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => {
                        setIsSwitchAccountModalOpen(false);
                        setIsSwitchEmailFormOpen(false);
                        setSwitchEmailInput("");
                        setSwitchEmailPassword("");
                      }}
                      disabled={isSwitchingAccount}
                    >
                      Close
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={handleAddNewAccountWithGoogle}
                      disabled={isSwitchingAccount}
                    >
                      {isSwitchingAccount ? "Adding..." : "Add New Account"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Login Activity Modal */}
          {isLoginActivityModalOpen && (
            <div
              style={styles.modalOverlay}
              onClick={() => setIsLoginActivityModalOpen(false)}
            >
              <div
                style={{
                  ...styles.modalContent,
                  maxWidth: "600px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Login Activity</h3>
                <div style={styles.modalBody}>
                  {isLoadingActivities ? (
                    <p style={styles.loadingText}>Loading activities...</p>
                  ) : loginActivities.length === 0 ? (
                    <p style={styles.noActivitiesText}>
                      No login activity found
                    </p>
                  ) : (
                    <div style={styles.activityList}>
                      {loginActivities.map((activity) => (
                        <div key={activity.id} style={styles.activityItem}>
                          <div style={styles.activityHeader}>
                            <span style={styles.activityDevice}>
                              {getDeviceName(activity.deviceInfo)} •{" "}
                              {getBrowserName(activity.deviceInfo)}
                            </span>
                            <span style={styles.activityTime}>
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                          <div style={styles.activityDetails}>
                            <p style={styles.activityDetailItem}>
                              <span style={styles.detailLabel}>Email:</span>
                              <span>{activity.email}</span>
                            </p>
                            <p style={styles.activityDetailItem}>
                              <span style={styles.detailLabel}>Method:</span>
                              <span style={styles.methodBadge}>
                                {activity.loginMethod === "google"
                                  ? "Google Sign-In"
                                  : "Email/Password"}
                              </span>
                            </p>
                            {activity.ipAddress && (
                              <p style={styles.activityDetailItem}>
                                <span style={styles.detailLabel}>IP:</span>
                                <span>{activity.ipAddress}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => setIsLoginActivityModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          {isDeleteAccountModalOpen && (
            <div
              style={styles.modalOverlay}
              onClick={() => setIsDeleteAccountModalOpen(false)}
            >
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Delete Account</h3>
                <div style={styles.modalBody}>
                  <p style={styles.deleteWarningText}>
                    ⚠️ Are you sure you want to delete your account?
                  </p>
                  <p style={styles.deleteDescriptionText}>
                    This action is permanent and cannot be undone. All your
                    data, projects, and transformations will be permanently
                    deleted from our servers.
                  </p>

                  <div style={styles.deleteInfoBox}>
                    <p style={styles.deleteInfoItem}>
                      • Your profile will be removed
                    </p>
                    <p style={styles.deleteInfoItem}>
                      • All your projects will be deleted
                    </p>
                    <p style={styles.deleteInfoItem}>
                      • Your saved accounts will be cleared
                    </p>
                    <p style={styles.deleteInfoItem}>
                      • You will be signed out immediately
                    </p>
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => setIsDeleteAccountModalOpen(false)}
                      disabled={isDeletingAccount}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={handleDeleteAccount}
                      disabled={isDeletingAccount}
                    >
                      {isDeletingAccount
                        ? "Deleting..."
                        : "Yes, Delete My Account"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
    maxWidth: "450px",
    width: "90%",
    padding: "0",
    zIndex: 1001,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid #e0e0e0",
    flexShrink: 0,
  } as React.CSSProperties,
  modalBody: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  } as React.CSSProperties,
  formGroup: {
    marginBottom: "24px",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "8px",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  charCount: {
    fontSize: "12px",
    color: "#999999",
    margin: "8px 0 0 0",
  } as React.CSSProperties,
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
    flexShrink: 0,
  } as React.CSSProperties,
  cancelButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  submitButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#0066cc",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  passwordInputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  } as React.CSSProperties,
  togglePasswordButton: {
    position: "absolute",
    right: "12px",
    backgroundColor: "transparent",
    border: "none",
    color: "#0066cc",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    padding: "0",
    outline: "none",
    transition: "color 0.2s ease",
  } as React.CSSProperties,
  helpText: {
    fontSize: "12px",
    color: "#999999",
    margin: "8px 0 0 0",
  } as React.CSSProperties,
  modalDescription: {
    fontSize: "14px",
    color: "#666666",
    marginBottom: "16px",
    margin: "0",
  } as React.CSSProperties,
  accountList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "20px",
    maxHeight: "300px",
    overflowY: "auto",
  } as React.CSSProperties,
  accountButton: {
    backgroundColor: "#f8f8f8",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    padding: "12px 16px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  switchAccountButton: {
    backgroundColor: "#f8f8f8",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    padding: "14px 16px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
  accountButtonContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  } as React.CSSProperties,
  accountEmail: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
  } as React.CSSProperties,
  accountName: {
    fontSize: "12px",
    color: "#999999",
  } as React.CSSProperties,
  noAccountsText: {
    fontSize: "14px",
    color: "#999999",
    textAlign: "center",
    padding: "20px",
    margin: "0",
  } as React.CSSProperties,
  switchingText: {
    fontSize: "12px",
    color: "#0066cc",
    marginLeft: "8px",
    fontWeight: "500",
  } as React.CSSProperties,
  methodSection: {
    marginBottom: "24px",
  } as React.CSSProperties,
  methodTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
    letterSpacing: "0.3px",
  } as React.CSSProperties,
  // Login Activity Styles
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  } as React.CSSProperties,
  activityItem: {
    backgroundColor: "#f8f8f8",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
  } as React.CSSProperties,
  activityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  } as React.CSSProperties,
  activityDevice: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  } as React.CSSProperties,
  activityTime: {
    fontSize: "12px",
    color: "#999999",
  } as React.CSSProperties,
  activityDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  } as React.CSSProperties,
  activityDetailItem: {
    fontSize: "13px",
    color: "#666666",
    margin: "0",
    display: "flex",
    gap: "8px",
  } as React.CSSProperties,
  methodBadge: {
    fontSize: "12px",
    backgroundColor: "#e3f2fd",
    color: "#0066cc",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "500",
  } as React.CSSProperties,
  loadingText: {
    fontSize: "14px",
    color: "#666666",
    textAlign: "center",
    padding: "20px",
    margin: "0",
  } as React.CSSProperties,
  noActivitiesText: {
    fontSize: "14px",
    color: "#999999",
    textAlign: "center",
    padding: "20px",
    margin: "0",
  } as React.CSSProperties,
  signInBadgeGoogle: {
    fontSize: "12px",
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    padding: "3px 10px",
    borderRadius: "12px",
    fontWeight: "600",
  } as React.CSSProperties,
  signInBadgeEmail: {
    fontSize: "12px",
    backgroundColor: "#e6f4ea",
    color: "#1e7e34",
    padding: "3px 10px",
    borderRadius: "12px",
    fontWeight: "600",
  } as React.CSSProperties,
  // Delete Account Styles
  deleteWarningText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#d32f2f",
    margin: "0 0 16px 0",
  } as React.CSSProperties,
  deleteDescriptionText: {
    fontSize: "14px",
    color: "#666666",
    margin: "0 0 16px 0",
    lineHeight: "1.5",
  } as React.CSSProperties,
  deleteInfoBox: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "6px",
    padding: "12px 16px",
    marginBottom: "20px",
  } as React.CSSProperties,
  deleteInfoItem: {
    fontSize: "13px",
    color: "#333333",
    margin: "6px 0",
  } as React.CSSProperties,
  deleteButton: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#d32f2f",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
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

  /* Account button hover state */
  div[style*="backgroundColor: #f8f8f8"][style*="border: 1px solid"][style*="cursor: pointer"]:hover {
    background-color: #efefef !important;
    border-color: #b0b0b0 !important;
  }


  /* Modal styling for dark theme */
  [data-theme="dark"] div[style*="position: fixed"] {
    background-color: rgba(0, 0, 0, 0.7) !important;
  }

  [data-theme="dark"] div[style*="backgroundColor: #ffffff"][style*="borderRadius: 12px"] {
    background-color: #383838 !important;
  }

  [data-theme="dark"] h3[style*="color: #1a1a1a"] {
    color: #e8e8e8 !important;
  }

  [data-theme="dark"] input[type="text"] {
    background-color: #555 !important;
    color: #ffffff !important;
    border-color: #666 !important;
  }

  [data-theme="dark"] input[type="text"]::placeholder {
    color: #999 !important;
  }

  [data-theme="dark"] button[style*="backgroundColor: #ffffff"][style*="color: #1a1a1a"] {
    background-color: #444 !important;
    color: #e8e8e8 !important;
    border-color: #666 !important;
  }

  [data-theme="dark"] button[style*="backgroundColor: #0066cc"] {
    background-color: #004fa3 !important;
  }

  [data-theme="dark"] button[style*="backgroundColor: #0066cc"]:hover {
    background-color: #003d82 !important;
  }

  [data-theme="dark"] button[style*="color: #0066cc"][style*="backgroundColor: transparent"] {
    color: #4a9eff !important;
  }

  [data-theme="dark"] p[style*="color: #999999"] {
    color: #aaaaaa !important;
  }

  [data-theme="dark"] div[style*="backgroundColor: #f8f8f8"] {
    background-color: #444 !important;
    border-color: #555 !important;
  }

  [data-theme="dark"] div[style*="backgroundColor: #f8f8f8"]:hover {
    background-color: #4a4a4a !important;
  }

  [data-theme="dark"] span[style*="color: #1a1a1a"] {
    color: #e8e8e8 !important;
  }

  [data-theme="dark"] span[style*="color: #999999"] {
    color: #888 !important;
  }

  [data-theme="dark"] p[style*="color: #666666"] {
    color: #aaaaaa !important;
  }

  /* Input field for add account */
  [data-theme="dark"] input[type="email"],
  [data-theme="dark"] input[type="password"] {
    background-color: #555 !important;
    color: #ffffff !important;
    border-color: #666 !important;
  }

  [data-theme="dark"] input[type="email"]::placeholder,
  [data-theme="dark"] input[type="password"]::placeholder {
    color: #999 !important;
  }

  [data-theme="dark"] input[type="email"]:focus,
  [data-theme="dark"] input[type="password"]:focus {
    border-color: #0066cc !important;
  }

  /* Delete Account Modal Styles */
  [data-theme="dark"] p[style*="color: #d32f2f"] {
    color: #ff5252 !important;
  }

  [data-theme="dark"] div[style*="backgroundColor: #fff3cd"] {
    background-color: #5c4b2a !important;
    border-color: #8b6d3e !important;
  }

  [data-theme="dark"] p[style*="color: #333333"] {
    color: #e8e8e8 !important;
  }

  [data-theme="dark"] button[style*="backgroundColor: #d32f2f"] {
    background-color: #b71c1c !important;
  }

  [data-theme="dark"] button[style*="backgroundColor: #d32f2f"]:hover {
    background-color: #9a1414 !important;
  }
`;
document.head.appendChild(styleSheet);

export default Account;
