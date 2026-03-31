import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged, type User, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { toast } from "react-toastify";

interface SavedAccount {
  email: string;
  displayName?: string;
  uid: string;
}

function Account() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangeUsernameModalOpen, setIsChangeUsernameModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  
  // Password change states
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Switch account states
  const [isSwitchAccountModalOpen, setIsSwitchAccountModalOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAskingPasswordForSwitch, setIsAskingPasswordForSwitch] = useState(false);
  const [selectedAccountForSwitch, setSelectedAccountForSwitch] = useState<SavedAccount | null>(null);
  const [switchPassword, setSwitchPassword] = useState("");
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [addAccountEmail, setAddAccountEmail] = useState("");
  const [addAccountPassword, setAddAccountPassword] = useState("");
  const [showAddAccountPassword, setShowAddAccountPassword] = useState(false);
  const [isSigningInNewAccount, setIsSigningInNewAccount] = useState(false);
  
  // Current account caching
  const [currentAccountPassword, setCurrentAccountPassword] = useState("");
  const [isAskingForCurrentPassword, setIsAskingForCurrentPassword] = useState(false);
  const [showCurrentAccountPassword, setShowCurrentAccountPassword] = useState(false);
  
  const navigate = useNavigate();

  // Fetch currently logged-in user from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        // Save current account and load other saved accounts
        saveSwitchedAccount(user.email || "", user.displayName || "", user.uid);
        loadSavedAccounts(user.uid);
      } else {
        // Redirect to login if user is not authenticated
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadSavedAccounts = (currentUid: string) => {
    try {
      const saved = localStorage.getItem("allAccounts");
      if (saved) {
        const accounts: SavedAccount[] = JSON.parse(saved);
        // Filter out the current account, show only other accounts
        const otherAccounts = accounts.filter(acc => acc.uid !== currentUid);
        setSavedAccounts(otherAccounts);
      } else {
        setSavedAccounts([]);
      }
    } catch (error) {
      console.error("Error loading saved accounts:", error);
      setSavedAccounts([]);
    }
  };

  const saveSwitchedAccount = (email: string, displayName?: string, uid?: string) => {
    try {
      if (!uid) return;
      
      const saved = localStorage.getItem("allAccounts");
      let accounts: SavedAccount[] = saved ? JSON.parse(saved) : [];
      
      // Check if account already exists
      const existingIndex = accounts.findIndex(acc => acc.uid === uid);
      
      if (existingIndex >= 0) {
        // Update existing account
        accounts[existingIndex] = { email, displayName, uid };
      } else {
        // Add new account
        accounts.push({ email, displayName, uid });
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

  const cacheAccountCredentials = (email: string, password: string, uid: string) => {
    try {
      // Store in localStorage so credentials are remembered across sessions
      const credentials = {
        email,
        password: btoa(password), // Simple encoding, not encryption
        uid,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cred_${uid}`, JSON.stringify(credentials));
      console.log("Credentials cached for", email);
    } catch (error) {
      console.error("Error caching credentials:", error);
    }
  };

  const getCachedCredentials = (uid: string) => {
    try {
      const cached = localStorage.getItem(`cred_${uid}`);
      if (!cached) {
        console.log("No cached credentials for", uid);
        return null;
      }
      
      const credentials = JSON.parse(cached);
      
      return {
        email: credentials.email,
        password: atob(credentials.password),
      };
    } catch (error) {
      console.error("Error getting cached credentials:", error);
      return null;
    }
  };

  const handleSwitchAccount = async () => {
    if (!selectedAccountForSwitch) {
      toast.error("Account not selected");
      return;
    }

    try {
      setIsSwitchingAccount(true);

      // Check if we have cached credentials for this account
      const cachedCreds = getCachedCredentials(selectedAccountForSwitch.uid);

      let password = switchPassword;

      // If no password entered but we have cached credentials, use them
      if (!password && cachedCreds) {
        password = cachedCreds.password;
      }

      if (!password) {
        toast.error("Please enter password");
        setIsSwitchingAccount(false);
        return;
      }

      // Sign in with the account credentials - no signOut before this!
      await signInWithEmailAndPassword(auth, selectedAccountForSwitch.email, password);

      // Cache the credentials for future switching
      cacheAccountCredentials(
        selectedAccountForSwitch.email,
        password,
        selectedAccountForSwitch.uid
      );

      toast.success(`Switched to ${selectedAccountForSwitch.email}`);
      
      // Reset and close modal
      setIsSwitchAccountModalOpen(false);
      setIsAskingPasswordForSwitch(false);
      setSelectedAccountForSwitch(null);
      setSwitchPassword("");
    } catch (error: any) {
      console.error("Error switching account:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else {
        toast.error("Failed to switch account");
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleSelectAccountToSwitch = async (account: SavedAccount) => {
    try {
      setIsSwitchingAccount(true);
      
      // Check if we have cached credentials for this account
      const cachedCreds = getCachedCredentials(account.uid);

      if (cachedCreds) {
        // We have cached credentials - switch directly without modal!
        await signInWithEmailAndPassword(auth, cachedCreds.email, cachedCreds.password);

        // Re-cache the credentials
        cacheAccountCredentials(cachedCreds.email, cachedCreds.password, account.uid);

        toast.success(`Switched to ${account.email}`);
        setIsSwitchAccountModalOpen(false);
      } else {
        // No cached credentials - show password modal
        setSelectedAccountForSwitch(account);
        setIsAskingPasswordForSwitch(true);
        setSwitchPassword("");
      }
    } catch (error: any) {
      console.error("Error switching with cached credentials:", error);
      // If cached credentials fail, show password modal
      setSelectedAccountForSwitch(account);
      setIsAskingPasswordForSwitch(true);
      setSwitchPassword("");
      toast.info("Please enter password for this account");
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleAddNewAccount = async () => {
    if (!addAccountEmail) {
      toast.error("Please enter email");
      return;
    }

    if (!addAccountPassword) {
      toast.error("Please enter password");
      return;
    }

    try {
      setIsSigningInNewAccount(true);

      // Sign in with the new account
      const result = await signInWithEmailAndPassword(
        auth,
        addAccountEmail,
        addAccountPassword
      );

      // Save the account
      saveSwitchedAccount(result.user.email || "", result.user.displayName || "", result.user.uid);

      // Cache the credentials for seamless future switching
      cacheAccountCredentials(addAccountEmail, addAccountPassword, result.user.uid);

      toast.success(`Added and switched to ${result.user.email}`);
      
      // Reset form and close modal
      setAddAccountEmail("");
      setAddAccountPassword("");
      setIsAddingAccount(false);
      setIsSwitchAccountModalOpen(false);
    } catch (error: any) {
      console.error("Error adding account:", error);
      if (error.code === "auth/user-not-found") {
        toast.error("Email not found. Please check and try again.");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address");
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    } finally {
      setIsSigningInNewAccount(false);
    }
  };

  const handleOpenSwitchAccount = () => {
    // Check if current account is cached
    if (firebaseUser?.uid && !getCachedCredentials(firebaseUser.uid)) {
      // Current account not cached - ask for password first
      setIsAskingForCurrentPassword(true);
      return;
    }
    
    loadSavedAccounts(firebaseUser?.uid || "");
    setIsAddingAccount(false);
    setAddAccountEmail("");
    setAddAccountPassword("");
    setIsSwitchAccountModalOpen(true);
  };

  const handleCacheCurrentAccountPassword = () => {
    if (!currentAccountPassword) {
      toast.error("Please enter your password");
      return;
    }

    if (firebaseUser?.email) {
      // Cache the current account's password
      cacheAccountCredentials(
        firebaseUser.email,
        currentAccountPassword,
        firebaseUser.uid
      );

      toast.success("Password cached for seamless switching!");
      setCurrentAccountPassword("");
      setShowCurrentAccountPassword(false);
      setIsAskingForCurrentPassword(false);

      // Now open the switch accounts modal
      loadSavedAccounts(firebaseUser?.uid || "");
      setIsAddingAccount(false);
      setAddAccountEmail("");
      setAddAccountPassword("");
      setIsSwitchAccountModalOpen(true);
    }
  };

  const handleSkipCachePassword = () => {
    setIsAskingForCurrentPassword(false);
    setCurrentAccountPassword("");
    setShowCurrentAccountPassword(false);

    // Still open the switch accounts modal
    loadSavedAccounts(firebaseUser?.uid || "");
    setIsAddingAccount(false);
    setAddAccountEmail("");
    setAddAccountPassword("");
    setIsSwitchAccountModalOpen(true);
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
          currentPassword
        );

        await reauthenticateWithCredential(firebaseUser, credential);

        // Update password
        await updatePassword(firebaseUser, newPassword);

        toast.success("Password updated successfully!");
        setIsChangePasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: any) {
        console.error("Error updating password:", error);
        if (error.code === "auth/wrong-password") {
          toast.error("Current password is incorrect");
        } else if (error.code === "auth/weak-password") {
          toast.error("New password is too weak");
        } else {
          toast.error("Failed to update password. Please try again.");
        }
      } finally {
        setIsUpdatingPassword(false);
      }
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

          {/* Change Username Modal */}
          {isChangeUsernameModalOpen && (
            <div style={styles.modalOverlay} onClick={() => setIsChangeUsernameModalOpen(false)}>
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
            <div style={styles.modalOverlay} onClick={() => setIsChangePasswordModalOpen(false)}>
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
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          {isAskingForCurrentPassword && (
            <div style={styles.modalOverlay} onClick={() => handleSkipCachePassword()}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>Cache Your Password</h3>
                <div style={styles.modalBody}>
                  <p style={{ marginBottom: "15px", color: "var(--text-secondary)" }}>
                    Enter your password once so you can switch accounts seamlessly without entering passwords again.
                  </p>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Your Password</label>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showCurrentAccountPassword ? "text" : "password"}
                        value={currentAccountPassword}
                        onChange={(e) => setCurrentAccountPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={styles.input}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleCacheCurrentAccountPassword();
                          }
                        }}
                      />
                      <button
                        style={styles.togglePasswordButton}
                        onClick={() => setShowCurrentAccountPassword(!showCurrentAccountPassword)}
                        type="button"
                      >
                        {showCurrentAccountPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div style={styles.modalActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={handleSkipCachePassword}
                    >
                      Skip for now
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={handleCacheCurrentAccountPassword}
                    >
                      Cache Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Switch Account Modal */}
          {isSwitchAccountModalOpen && (
            <div style={styles.modalOverlay} onClick={() => setIsSwitchAccountModalOpen(false)}>
              <div
                style={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={styles.modalTitle}>
                  {isAskingPasswordForSwitch ? "Enter Password" : isAddingAccount ? "Add Account" : "Switch Account"}
                </h3>
                <div style={styles.modalBody}>
                  {!isAddingAccount && !isAskingPasswordForSwitch ? (
                    <>
                      <p style={styles.modalDescription}>
                        Click to switch to another account:
                      </p>
                      <div style={styles.accountList}>
                        {savedAccounts.length > 0 ? (
                          savedAccounts.map((account) => (
                            <button
                              key={account.uid}
                              style={styles.switchAccountButton}
                              onClick={() => handleSelectAccountToSwitch(account)}
                              disabled={isSwitchingAccount}
                            >
                              <div style={styles.accountButtonContent}>
                                <span style={styles.accountEmail}>{account.email}</span>
                                {account.displayName && (
                                  <span style={styles.accountName}>
                                    {account.displayName}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <p style={styles.noAccountsText}>
                            No other logged-in accounts found.
                          </p>
                        )}
                      </div>
                      <div style={styles.modalActions}>
                        <button
                          style={styles.cancelButton}
                          onClick={() => setIsSwitchAccountModalOpen(false)}
                          disabled={isSwitchingAccount}
                        >
                          Close
                        </button>
                        <button
                          style={styles.submitButton}
                          onClick={() => setIsAddingAccount(true)}
                        >
                          Add Account
                        </button>
                      </div>
                    </>
                  ) : isAskingPasswordForSwitch ? (
                    <>
                      <p style={styles.modalDescription}>
                        Enter password for {selectedAccountForSwitch?.email}
                      </p>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordInputContainer}>
                          <input
                            type={showSwitchPassword ? "text" : "password"}
                            value={switchPassword}
                            onChange={(e) => setSwitchPassword(e.target.value)}
                            placeholder="Enter password"
                            style={styles.input}
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleSwitchAccount();
                              }
                            }}
                          />
                          <button
                            style={styles.togglePasswordButton}
                            onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                            type="button"
                          >
                            {showSwitchPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      <div style={styles.modalActions}>
                        <button
                          style={styles.cancelButton}
                          onClick={() => {
                            setIsAskingPasswordForSwitch(false);
                            setSelectedAccountForSwitch(null);
                            setSwitchPassword("");
                          }}
                          disabled={isSwitchingAccount}
                        >
                          Back
                        </button>
                        <button
                          style={styles.submitButton}
                          onClick={handleSwitchAccount}
                          disabled={isSwitchingAccount}
                        >
                          {isSwitchingAccount ? "Switching..." : "Switch"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={styles.modalDescription}>
                        Sign in with another account:
                      </p>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                          type="email"
                          value={addAccountEmail}
                          onChange={(e) => setAddAccountEmail(e.target.value)}
                          placeholder="Enter email"
                          style={styles.input}
                          autoFocus
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordInputContainer}>
                          <input
                            type={showAddAccountPassword ? "text" : "password"}
                            value={addAccountPassword}
                            onChange={(e) => setAddAccountPassword(e.target.value)}
                            placeholder="Enter password"
                            style={styles.input}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddNewAccount();
                              }
                            }}
                          />
                          <button
                            style={styles.togglePasswordButton}
                            onClick={() => setShowAddAccountPassword(!showAddAccountPassword)}
                            type="button"
                          >
                            {showAddAccountPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      <div style={styles.modalActions}>
                        <button
                          style={styles.cancelButton}
                          onClick={() => {
                            setIsAddingAccount(false);
                            setAddAccountEmail("");
                            setAddAccountPassword("");
                          }}
                          disabled={isSigningInNewAccount}
                        >
                          Back
                        </button>
                        <button
                          style={styles.submitButton}
                          onClick={handleAddNewAccount}
                          disabled={isSigningInNewAccount}
                        >
                          {isSigningInNewAccount ? "Signing in..." : "Sign In"}
                        </button>
                      </div>
                    </>
                  )}
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
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
    padding: "24px 24px 16px 24px",
    borderBottom: "1px solid #e0e0e0",
  } as React.CSSProperties,
  modalBody: {
    padding: "24px",
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
`;
document.head.appendChild(styleSheet);

export default Account;
