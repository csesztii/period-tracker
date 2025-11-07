import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Articles from "./pages/Articles";
import Cycles from "./pages/Cycles";
import Pregnancy from "./pages/Pregnancy";
import User from "./pages/User";
import BottomNav from "./components/BottomNav";

// Temporary placeholder for the 5th page
function PlaceholderPage() {
  return <h2>Placeholder Page</h2>;
}

function App() {

  return (
    <Router>
      <div style={{ paddingBottom: "60px" }}>
        <Routes>
          <Route path="/" element={<Cycles />} />

          <Route path="/articles" element={<Articles />} />
          <Route path="/pregnancy" element={<Pregnancy />} />
          <Route path="/page3" element={<PlaceholderPage />} />
          <Route path="/user" element={<User />} />

          <Route path="*" element={<Navigate to="/" replace />} /> {/* default */}
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;