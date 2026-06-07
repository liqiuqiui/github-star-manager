import { defaultTo } from "lodash-es";
import { dayjs } from "../src/lib/date";
import type { AutoSyncConfig } from "../src/types";
import { settingsItem } from "../src/services/storage";
import { BackgroundMessageType, StarAction } from "../common/enums";

export default defineBackground(() => {
  const CHECK_ALARM_NAME = "auto-sync-check";
  const KEEPALIVE_ALARM_NAME = "keepalive";
  const GITHUB_PATTERN = /^https?:\/\/(www\.)?github\.com/;

  // 保活：防止 Service Worker 休眠导致 webRequest 事件丢失
  browser.alarms.create(KEEPALIVE_ALARM_NAME, { periodInMinutes: 0.4 });

  // Chrome-specific sidePanel API
  if (import.meta.env.CHROME) {
    browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }

  // 图标状态管理
  function isGitHubUrl(url: string | undefined): boolean {
    return !!url && GITHUB_PATTERN.test(url);
  }

  // 生成灰色图标
  async function getGrayIcon(size: number): Promise<ImageData> {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const iconUrl = browser.runtime.getURL(`/icon/${size}.png` as any);
    const response = await fetch(iconUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    ctx.drawImage(bitmap, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
      data[i + 3] = data[i + 3] * 0.5;
    }

    return imageData;
  }

  async function updateIconState(tabId: number, url?: string) {
    const isGitHub = isGitHubUrl(url);

    try {
      if (isGitHub) {
        await browser.action.setIcon({
          tabId,
          path: {
            16: "/icon/16.png",
            32: "/icon/32.png",
            48: "/icon/48.png",
            96: "/icon/96.png",
            128: "/icon/128.png",
          },
        });
      } else {
        const sizes = [16, 32, 48, 96, 128];
        const imageDataMap: Record<number, ImageData> = {};

        for (const size of sizes) {
          imageDataMap[size] = await getGrayIcon(size);
        }

        await browser.action.setIcon({
          tabId,
          imageData: imageDataMap,
        });
      }
    } catch {
      // 忽略图标设置错误
    }
  }

  // 监听标签页切换
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      await updateIconState(activeInfo.tabId, tab.url);
    } catch {
      // 忽略无法访问的标签页
    }
  });

  // 监听标签页 URL 变化
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === "complete") {
      await updateIconState(tabId, tab.url);
    }
  });

  // 初始化当前标签页图标状态
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0]?.id) {
      updateIconState(tabs[0].id, tabs[0].url);
    }
  });

  // 防抖定时器
  let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  const SYNC_DEBOUNCE_MS = 5000; // 5秒防抖

  // 使用 webRequest API 拦截 GitHub Star/Unstar 请求
  if (browser.webRequest) {
    // Star: POST https://github.com/{owner}/{repo}/star
    // Unstar: POST https://github.com/{owner}/{repo}/unstar
    const starUrlPattern = /https:\/\/github\.com\/([^/]+\/[^/]+)\/(star|unstar)/;

    browser.webRequest.onCompleted.addListener(
      (details) => {
        const match = details.url.match(starUrlPattern);

        if (match && details.method === "POST") {
          const repoName = match[1];
          const actionType = match[2];
          const action = actionType === "star" ? StarAction.Star : StarAction.Unstar;

          // 通知 sidepanel 做本地增量更新
          browser.runtime
            .sendMessage({
              type: BackgroundMessageType.StarChange,
              action,
              repoName,
            })
            .catch(() => {});

          // 防抖：延迟触发完整同步标记
          if (syncDebounceTimer) {
            clearTimeout(syncDebounceTimer);
          }
          syncDebounceTimer = setTimeout(() => {
            browser.runtime.sendMessage({ type: BackgroundMessageType.MarkDirty }).catch(() => {});
            syncDebounceTimer = null;
          }, SYNC_DEBOUNCE_MS);
        }
      },
      { urls: ["https://github.com/*"] },
    );
  }

  // 初始化自动同步
  settingsItem.getValue().then((settings) => {
    if (settings.autoSync?.enabled) {
      setupAutoSyncCheck();
    }
  });

  // 监听设置变更
  settingsItem.watch((newSettings) => {
    if (newSettings.autoSync) {
      if (newSettings.autoSync.enabled) {
        setupAutoSyncCheck();
      } else {
        browser.alarms.clear(CHECK_ALARM_NAME);
      }
    }
  });

  // 设置检查 alarm（每分钟检查一次是否需要同步）
  function setupAutoSyncCheck() {
    browser.alarms.create(CHECK_ALARM_NAME, {
      periodInMinutes: 1,
    });
  }

  // 检查是否应该同步
  function shouldSync(config: AutoSyncConfig): boolean {
    const now = dayjs();
    const hour = now.hour();
    const minute = now.minute();
    const dayOfWeek = now.day();
    const dayOfMonth = now.date();

    if (hour !== config.hour || minute !== config.minute) {
      return false;
    }

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
      settingsItem.getValue().then((settings) => {
        if (settings.autoSync?.enabled && shouldSync(settings.autoSync)) {
          triggerSync();
        }
      });
    }
  });

  // 触发同步
  function triggerSync() {
    browser.runtime.sendMessage({ type: BackgroundMessageType.TriggerSync }).catch(() => {
      // sidepanel 可能未打开，忽略错误
    });
  }

  // 监听来自 sidepanel 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === BackgroundMessageType.OpenSidepanel) {
      if (import.meta.env.CHROME) {
        browser.sidePanel
          .open({ windowId: message.windowId || undefined })
          .then(() => sendResponse({ success: true }))
          .catch((err: Error) => sendResponse({ success: false, error: err.message }));
        return true;
      }
    }

    return false;
  });
});
