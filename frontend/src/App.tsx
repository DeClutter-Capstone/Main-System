import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import API from "./pages/API";
import Blog from "./pages/Blog";
import Generate from "./pages/Generate";
import Porjects from "./pages/Porjects";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Accont from "./pages/Accont";
import Authentication from "./pages/Authentication";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={<Authentication onAuthenticate={() => {}} />}
        />
        <Route path="/signup" element={<Signup onAuthenticate={() => {}} />} />
        <Route path="/about" element={<About />} />
        <Route path="/api" element={<API />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/projects" element={<Porjects />} />
        <Route path="/history" element={<History />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/account" element={<Accont />} />
      </Routes>
    </Router>
  );
}

export default App;
