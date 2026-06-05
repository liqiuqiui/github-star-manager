import type { UIMode } from "../types";

export interface UIAdapter {
  setMode(mode: UIMode): Promise<void>;
  getMode(): Promise<UIMode>;
  openSidebar(): Promise<void>;
}

class ChromeAdapter implements UIAdapter {
  async setMode(mode: UIMode): Promise<void> {
    if (mode === "sidebar") {
      await browser.action.setPopup({ popup: "" });
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } else {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
      await browser.action.setPopup({ popup: "/popup.html" });
    }
  }

  async getMode(): Promise<UIMode> {
    const result = await browser.storage.sync.get("github-star-manager-settings");
    const settings = result["github-star-manager-settings"] as { uiMode?: UIMode } | undefined;
    return settings?.uiMode ?? "popup";
  }

  async openSidebar(): Promise<void> {
    const win = await browser.windows.getCurrent();
    if (win.id) {
      await chrome.sidePanel.open({ windowId: win.id });
    }
  }
}

class FirefoxAdapter implements UIAdapter {
  async setMode(_mode: UIMode): Promise<void> {
    // Firefox doesn't support dynamic switching between popup and sidebar
  }

  async getMode(): Promise<UIMode> {
    const result = await browser.storage.sync.get("github-star-manager-settings");
    const settings = result["github-star-manager-settings"] as { uiMode?: UIMode } | undefined;
    return settings?.uiMode ?? "popup";
  }

  async openSidebar(): Promise<void> {
    // sidebarAction is Firefox-specific
    const api = (browser as unknown as { sidebarAction?: { open: () => Promise<void> } }).sidebarAction;
    if (api) {
      await api.open();
    }
  }
}

let adapter: UIAdapter | null = null;

export function getUIAdapter(): UIAdapter {
  if (adapter) return adapter;

  if (import.meta.env.CHROME) {
    adapter = new ChromeAdapter();
  } else {
    adapter = new FirefoxAdapter();
  }

  return adapter;
}
