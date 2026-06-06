import { HashRouter, Routes, Route } from "react-router-dom";
import { useThemeSync } from "@/hooks/useTheme";
import Home from "./views/home";
import Settings from "./views/settings";

export default function App() {
  // 在应用启动时同步主题到 DOM，避免需要打开设置页面才生效
  useThemeSync();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}
