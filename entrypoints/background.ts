import { defaultTo } from "lodash-es";
import { dayjs } from "../src/lib/date";
import type { AutoSyncConfig } from "../src/types";

export default defineBackground(() => {
  console.log("GitHub Star Manager background started");

  const STORAGE_KEY = "github-star-manager-settings";
  const CHECK_ALARM_NAME = "auto-sync-check";

  // Chrome-specific sidePanel API
  if (import.meta.env.CHROME) {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

    browser.storage.sync.get(STORAGE_KEY).then((result) => {
      const settings = result[STORAGE_KEY] as
        | { uiMode?: string; autoSync?: AutoSyncConfig }
        | undefined;
      if (settings?.uiMode === "sidebar") {
        browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        browser.action.setPopup({ popup: "" });
      }
      // 初始化自动同步
      if (settings?.autoSync?.enabled) {
        setupAutoSyncCheck();
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      if (changes[STORAGE_KEY]) {
        const newSettings = changes[STORAGE_KEY].newValue as
          | { uiMode?: string; autoSync?: AutoSyncConfig }
          | undefined;

        // UI 模式切换
        if (newSettings?.uiMode === "sidebar") {
          browser.action.setPopup({ popup: "" });
          browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        } else {
          browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
          browser.action.setPopup({ popup: "/popup.html" });
        }

        // 自动同步配置更新
        if (newSettings?.autoSync) {
          if (newSettings.autoSync.enabled) {
            setupAutoSyncCheck();
          } else {
            browser.alarms.clear(CHECK_ALARM_NAME);
            console.log("Auto-sync disabled");
          }
        }
      }
    });
  }

  // 设置检查 alarm（每分钟检查一次是否需要同步）
  function setupAutoSyncCheck() {
    browser.alarms.create(CHECK_ALARM_NAME, {
      periodInMinutes: 1,
    });
    console.log("Auto-sync check alarm set (every 1 minute)");
  }

  // 检查是否应该同步
  function shouldSync(config: AutoSyncConfig): boolean {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    const dayOfWeek = now.day(); // 0=周日
    const dayOfMonth = now.date();

    // 检查时间是否匹配
    if (hour !== config.hour || minute !== config.minute) {
      return false;
    }

    // 根据频率检查
    switch (config.frequency) {
      case "daily":
        return true;

      case "weekly":
        return defaultTo(config.daysOfWeek, []).includes(dayOfWeek);

      case "monthly":
        return dayOfMonth === defaultTo(config.dayOfMonth, 1);

      default:
        return false;
    }
  }

  // 监听 alarm 事件
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === CHECK_ALARM_NAME) {
      // 读取配置并检查是否需要同步
      browser.storage.sync.get(STORAGE_KEY).then((result) => {
        const settings = result[STORAGE_KEY] as { autoSync?: AutoSyncConfig } | undefined;

        if (settings?.autoSync?.enabled && shouldSync(settings.autoSync)) {
          console.log("Auto-sync triggered by schedule");
          triggerSync();
        }
      });
    }
  });

  // 触发同步
  function triggerSync() {
    browser.runtime.sendMessage({ type: "TRIGGER_SYNC" }).catch(() => {
      // popup/sidepanel 可能未打开，忽略错误
    });
  }

  // 监听来自 content script 和 popup/sidepanel 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GITHUB_STAR_CHANGED") {
      console.log("GitHub star change detected:", message.action);
      triggerSync();
      sendResponse({ success: true });
    }

    if (message.type === "OPEN_SIDEPANEL") {
      if (import.meta.env.CHROME) {
        browser.sidePanel
          .open({ windowId: message.windowId || undefined })
          .then(() => sendResponse({ success: true }))
          .catch((err: Error) => sendResponse({ success: false, error: err.message }));
        return true; // 异步响应
      }
    }

    return false;
  });
});
