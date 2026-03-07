import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Generate from "./pages/Generate";
import Porjects from "./pages/Porjects";
import History from "./pages/History";
import FAQ from "./pages/FAQ";
import Accont from "./pages/Accont";
import Authentication from "./pages/Authentication";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/auth"
          element={<Authentication onAuthenticate={() => {}} />}
        />
        <Route path="/about" element={<About />} />
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
