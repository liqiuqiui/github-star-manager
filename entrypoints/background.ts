export default defineBackground(() => {
  console.log("GitHub Star Manager background started");

  // Handle UI mode switching for Chrome
  const chromeApi = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  if (chromeApi?.sidePanel) {
    chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

    chromeApi.storage.sync.get("github-star-manager-settings", (result: Record<string, unknown>) => {
      const settings = result["github-star-manager-settings"] as { uiMode?: string } | undefined;
      if (settings?.uiMode === "sidebar") {
        chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        chromeApi.action.setPopup({ popup: "" });
      }
    });

    chromeApi.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes["github-star-manager-settings"]) {
        const newSettings = changes["github-star-manager-settings"].newValue as { uiMode?: string } | undefined;
        if (newSettings?.uiMode === "sidebar") {
          chromeApi.action.setPopup({ popup: "" });
          chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        } else {
          chromeApi.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
          chromeApi.action.setPopup({ popup: "/popup.html" });
        }
      }
    });
  }
});
