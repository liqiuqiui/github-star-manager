import { create } from "zustand";
import type { AutoSyncConfig } from "../types";
import { settingsItem } from "../services/storage";
import i18n from "../i18n";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from "../constants";
import { SyncFrequency } from "../enums";

// Zustand Store
interface SettingsState {
  token: string;
  autoSync: AutoSyncConfig;
  language: SupportedLanguage;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  setToken: (token: string) => Promise<void>;
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
  autoSync: DEFAULT_AUTO_SYNC,
  language: DEFAULT_LANGUAGE,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await settingsItem.getValue();
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
      autoSync: settings.autoSync || DEFAULT_AUTO_SYNC,
      language,
      isLoading: false,
    });
  },

  setToken: async (token: string) => {
    const current = await settingsItem.getValue();
    await settingsItem.setValue({ ...current, token });
    set({ token });
  },

  setAutoSync: async (autoSync: AutoSyncConfig) => {
    const current = await settingsItem.getValue();
    await settingsItem.setValue({ ...current, autoSync });
    set({ autoSync });
  },

  setLanguage: async (language: SupportedLanguage) => {
    try {
      const current = await settingsItem.getValue();
      await settingsItem.setValue({ ...current, language });
      i18n.changeLanguage(language);
      set({ language });
    } catch (error) {
      console.error("Failed to save language setting:", error);
    }
  },
}));
