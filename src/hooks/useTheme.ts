import { useEffect } from "react";
import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("theme") as Theme) || "system";
  }
  return "system";
}

function applyThemeToDOM(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme: Theme) => {
    localStorage.setItem("theme", theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
}));

/**
 * 在 App 启动时调用，将当前主题同步到 DOM
 */
export function useThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);
}
