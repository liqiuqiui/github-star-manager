import type { UIMode } from "../types";

export interface UIAdapter {
  setMode(mode: UIMode): Promise<void>;
  getMode(): Promise<UIMode>;
  openSidebar(): Promise<void>;
}

class ChromeAdapter implements UIAdapter {
  async setMode(mode: UIMode): Promise<void> {
    if (mode === "sidebar") {
      await chrome.action.setPopup({ popup: "" });
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } else {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
      await chrome.action.setPopup({ popup: "/popup.html" });
    }
  }

  async getMode(): Promise<UIMode> {
    const result = await chrome.storage.sync.get("github-star-manager-settings");
    return result["github-star-manager-settings"]?.uiMode ?? "popup";
  }

  async openSidebar(): Promise<void> {
    const windows = await chrome.windows.getCurrent();
    if (windows.id) {
      await chrome.sidePanel.open({ windowId: windows.id });
    }
  }
}

class FirefoxAdapter implements UIAdapter {
  async setMode(_mode: UIMode): Promise<void> {
    // Firefox doesn't support dynamic switching between popup and sidebar
    // Both are declared in manifest and user can use either
  }

  async getMode(): Promise<UIMode> {
    const result = await browser.storage.sync.get("github-star-manager-settings");
    return result["github-star-manager-settings"]?.uiMode ?? "popup";
  }

  async openSidebar(): Promise<void> {
    await browser.sidebarAction.open();
  }
}

let adapter: UIAdapter | null = null;

export function getUIAdapter(): UIAdapter {
  if (adapter) return adapter;

  if (typeof chrome !== "undefined" && chrome.sidePanel) {
    adapter = new ChromeAdapter();
  } else if (typeof browser !== "undefined" && browser.sidebarAction) {
    adapter = new FirefoxAdapter();
  } else {
    adapter = new ChromeAdapter();
  }

  return adapter;
}
