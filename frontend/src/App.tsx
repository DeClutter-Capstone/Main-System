import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Authentication from "./pages/Authentication";
import HomePage from "./pages/HomePage";
import Generate from "./pages/Generate";
import Porjects from "./pages/Porjects";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Accont from "./pages/Accont";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Authentication onAuthenticate={handleAuthentication} />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />

        {/* Protected Routes - User must be authenticated */}
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/generate"
          element={isAuthenticated ? <Generate /> : <Navigate to="/" replace />}
        />
        <Route
          path="/projects"
          element={isAuthenticated ? <Porjects /> : <Navigate to="/" replace />}
        />
        <Route
          path="/history"
          element={isAuthenticated ? <History /> : <Navigate to="/" replace />}
        />
        <Route
          path="/faq"
          element={isAuthenticated ? <FAQ /> : <Navigate to="/" replace />}
        />
        <Route
          path="/account"
          element={isAuthenticated ? <Accont /> : <Navigate to="/" replace />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
