import { storage } from "wxt/utils/storage";
import type { AutoSyncConfig } from "../types";
import type { SupportedLanguage } from "../constants";
import { DEFAULT_LANGUAGE } from "../constants";
import { SyncFrequency } from "../enums";

// Settings 数据类型
export interface SettingsData {
  token: string;
  autoSync: AutoSyncConfig;
  language: SupportedLanguage;
}

// WXT Storage 定义
export const settingsItem = storage.defineItem<SettingsData>("sync:settings", {
  fallback: {
    token: "",
    autoSync: {
      enabled: false,
      frequency: SyncFrequency.Daily,
      hour: 9,
      minute: 0,
      daysOfWeek: [1],
      dayOfMonth: 1,
    },
    language: DEFAULT_LANGUAGE,
  },
});
