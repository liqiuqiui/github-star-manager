import { create } from "zustand";
import type { UIMode } from "../types";
import { getSettings, saveSettings } from "../services/auth";

interface SettingsState {
  token: string;
  uiMode: UIMode;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setUIMode: (mode: UIMode) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  token: "",
  uiMode: "popup",
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await getSettings();
    set({
      token: settings.token,
      uiMode: settings.uiMode,
      isLoading: false,
    });
  },

  setToken: async (token: string) => {
    await saveSettings({ token });
    set({ token });
  },

  setUIMode: async (uiMode: UIMode) => {
    await saveSettings({ uiMode });
    set({ uiMode });
  },
}));
