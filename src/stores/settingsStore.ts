import { create } from "zustand";
import type { UIMode, AutoSyncConfig } from "../types";
import { getSettings, saveSettings } from "../services/auth";
import i18n from "../i18n";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../constants";
import { SyncFrequency } from "../enums";

interface SettingsState {
  token: string;
  uiMode: UIMode;
  autoSync: AutoSyncConfig;
  language: SupportedLanguage;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
  setUIMode: (mode: UIMode) => Promise<void>;
  setAutoSync: (config: AutoSyncConfig) => Promise<void>;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

const DEFAULT_AUTO_SYNC: AutoSyncConfig = {
  enabled: false,
  frequency: SyncFrequency.Daily,
  hour: 9,
  minute: 0,
  daysOfWeek: [1],
  dayOfMonth: 1,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  token: "",
  uiMode: "popup",
  autoSync: DEFAULT_AUTO_SYNC,
  language: DEFAULT_LANGUAGE,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await getSettings();
    // 优先使用持久化的语言，其次使用浏览器检测的语言，最后使用默认语言
    const detectedLng = (
      settings.language ||
      i18n.language ||
      DEFAULT_LANGUAGE
    ).toLowerCase() as SupportedLanguage;
    const language = SUPPORTED_LANGUAGES.includes(detectedLng) ? detectedLng : DEFAULT_LANGUAGE;
    i18n.changeLanguage(language);
    set({
      token: settings.token,
      uiMode: settings.uiMode,
      autoSync: settings.autoSync || DEFAULT_AUTO_SYNC,
      language,
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

  setLanguage: async (language: SupportedLanguage) => {
    try {
      await saveSettings({ language });
      i18n.changeLanguage(language);
      set({ language });
    } catch (error) {
      console.error("Failed to save language setting:", error);
    }
  },
}));
