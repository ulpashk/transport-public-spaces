// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import DataTables from "./pages/DataTables";
import RecommendedRoutes from "./pages/RecommendedRoutes";
import NotFound from "./pages/NotFound";
import './utils/res.css'

export default function App() {
  return (
    <Router basename="/transport-public-spaces">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/data" element={<DataTables />} />
        <Route path="/routes" element={<RecommendedRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
