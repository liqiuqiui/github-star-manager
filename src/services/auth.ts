import type { GitHubUser, Settings } from "../types";
import { verifyToken } from "./github-api";

const STORAGE_KEY = "github-star-manager-settings";

const DEFAULT_SETTINGS: Settings = {
  token: "",
  uiMode: "popup",
};

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.sync.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<Settings> | undefined;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  await browser.storage.sync.set({
    [STORAGE_KEY]: { ...current, ...settings },
  });
}

export async function getToken(): Promise<string> {
  const settings = await getSettings();
  return settings.token;
}

export async function saveToken(token: string): Promise<void> {
  await saveSettings({ token });
}

export async function validateToken(token: string): Promise<GitHubUser> {
  return verifyToken(token);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return token.length > 0;
}
