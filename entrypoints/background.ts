export default defineBackground(() => {
  console.log("GitHub Star Manager background started");

  // Handle UI mode switching for Chrome
  if (typeof chrome !== "undefined" && chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

    chrome.storage.sync.get("github-star-manager-settings", (result) => {
      const settings = result["github-star-manager-settings"];
      if (settings?.uiMode === "sidebar") {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        chrome.action.setPopup({ popup: "" });
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes["github-star-manager-settings"]) {
        const newSettings = changes["github-star-manager-settings"].newValue;
        if (newSettings?.uiMode === "sidebar") {
          chrome.action.setPopup({ popup: "" });
          chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        } else {
          chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
          chrome.action.setPopup({ popup: "/popup.html" });
        }
      }
    });
  }
});
