import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Generate from "./pages/Generate";
import Porjects from "./pages/Porjects";
import ProjectsPage from "./pages/ProjectsPage";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Accont from "./pages/Accont";
import Authentication from "./pages/Authentication";
import Signup from "./pages/Signup";

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check if user is logged in (from localStorage, Firebase, or your backend)
      const authToken = localStorage.getItem("authToken");
      setIsAuthenticated(!!authToken);
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleAuthenticate = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (authenticated) {
      localStorage.setItem("authToken", "true");
    } else {
      localStorage.removeItem("authToken");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={<Authentication onAuthenticate={handleAuthenticate} />}
          />
          <Route
            path="/signup"
            element={<Signup onAuthenticate={handleAuthenticate} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/generate" element={<Generate />} />

          {/* Protected Routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Porjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <FAQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Accont />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
