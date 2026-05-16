import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect, type ReactNode } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Generate from "./pages/Generate";
import Projects from "./pages/Projects";
import ProjectsPage from "./pages/ProjectsPage";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Accont from "./pages/Accont";
import Authentication from "./pages/Authentication";
import Signup from "./pages/Signup";
import ContactUs from "./pages/ContactUs";

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
        <ScrollToTop />
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
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected Routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Projects />
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
