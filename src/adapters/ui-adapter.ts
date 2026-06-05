import type { UIMode } from "../types";

export interface UIAdapter {
  setMode(mode: UIMode): Promise<void>;
  getMode(): Promise<UIMode>;
  openSidebar(): Promise<void>;
}

function getChromeApi() {
  return (globalThis as unknown as { chrome?: typeof chrome }).chrome;
}

class ChromeAdapter implements UIAdapter {
  async setMode(mode: UIMode): Promise<void> {
    const chromeApi = getChromeApi();
    if (!chromeApi?.sidePanel) return;

    if (mode === "sidebar") {
      await chromeApi.action.setPopup({ popup: "" });
      await chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } else {
      await chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
      await chromeApi.action.setPopup({ popup: "/popup.html" });
    }
  }

  async getMode(): Promise<UIMode> {
    const chromeApi = getChromeApi();
    if (!chromeApi) return "popup";

    const result = await chromeApi.storage.sync.get("github-star-manager-settings");
    const settings = result["github-star-manager-settings"] as { uiMode?: UIMode } | undefined;
    return settings?.uiMode ?? "popup";
  }

  async openSidebar(): Promise<void> {
    const chromeApi = getChromeApi();
    if (!chromeApi?.sidePanel) return;

    const win = await chromeApi.windows.getCurrent();
    if (win.id) {
      await chromeApi.sidePanel.open({ windowId: win.id });
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
    await (browser as unknown as { sidebarAction: { open: () => Promise<void> } }).sidebarAction.open();
  }
}

let adapter: UIAdapter | null = null;

export function getUIAdapter(): UIAdapter {
  if (adapter) return adapter;

  const chromeApi = getChromeApi();
  if (chromeApi?.sidePanel) {
    adapter = new ChromeAdapter();
  } else {
    adapter = new FirefoxAdapter();
  }

  return adapter;
}
