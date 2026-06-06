import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./views/home";
import Settings from "./views/settings";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
