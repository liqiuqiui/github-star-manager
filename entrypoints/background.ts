export default defineBackground(() => {
  console.log("GitHub Star Manager background started");

  // Chrome-specific sidePanel API
  if (import.meta.env.CHROME) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

    browser.storage.sync.get("github-star-manager-settings").then((result) => {
      const settings = result["github-star-manager-settings"] as { uiMode?: string } | undefined;
      if (settings?.uiMode === "sidebar") {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        browser.action.setPopup({ popup: "" });
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      if (changes["github-star-manager-settings"]) {
        const newSettings = changes["github-star-manager-settings"].newValue as
          | { uiMode?: string }
          | undefined;
        if (newSettings?.uiMode === "sidebar") {
          browser.action.setPopup({ popup: "" });
          chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        } else {
          chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
          browser.action.setPopup({ popup: "/popup.html" });
        }
      }
    });
  }
});
