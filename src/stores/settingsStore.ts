import { create } from "zustand";
import type { UIMode, AutoSyncConfig } from "../types";
import { getSettings, saveSettings } from "../services/auth";

interface SettingsState {
  token: string;
  uiMode: UIMode;
  autoSync: AutoSyncConfig;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setUIMode: (mode: UIMode) => Promise<void>;
  setAutoSync: (config: AutoSyncConfig) => Promise<void>;
}

const DEFAULT_AUTO_SYNC: AutoSyncConfig = {
  enabled: false,
  frequency: "daily",
  hour: 9,
  minute: 0,
  daysOfWeek: [1],
  dayOfMonth: 1,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  token: "",
  uiMode: "popup",
  autoSync: DEFAULT_AUTO_SYNC,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await getSettings();
    set({
      token: settings.token,
      uiMode: settings.uiMode,
      autoSync: settings.autoSync || DEFAULT_AUTO_SYNC,
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

  setAutoSync: async (autoSync: AutoSyncConfig) => {
    await saveSettings({ autoSync });
    set({ autoSync });
  },
}));
