# 浏览器插件 UI 形态可配置方案

> 调研日期：2026-06-05

## 需求

用户可自行选择插件 UI 形态：

- **Popup 弹窗**：点击插件图标弹出管理面板
- **侧边栏面板**：在浏览器侧边栏显示管理面板

## 各浏览器 API 支持情况

### Chrome (Side Panel API)

Chrome 114+ 引入 `chrome.sidePanel` API（仅 Manifest V3）。

**核心 API**:

- `chrome.action.setPopup({ popup: "..." })` — 动态设置/移除 popup
- `chrome.sidePanel.setOptions({ path, enabled })` — 配置侧边栏
- `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` — 点击图标打开侧边栏
- `chrome.sidePanel.open({ windowId })` — 程序化打开侧边栏

**切换机制**:

```typescript
// 切换到 Popup 模式
chrome.action.setPopup({ popup: "popup.html" });

// 切换到 Side Panel 模式
chrome.action.setPopup({ popup: "" }); // 移除 popup
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

当 popup 设置为空字符串时，点击图标触发 `chrome.action.onClicked` 事件。

### Firefox (sidebar_action)

Firefox 使用 `browser.sidebarAction` API。

**核心 API**:

- `browser.sidebarAction.open()` / `.close()` — 打开/关闭侧边栏
- `browser.sidebarAction.setPanel({ panel: "..." })` — 切换侧边栏内容
- `browser.action.openPopup()` (Firefox 109+) — 程序化打开 popup

**限制**: `sidebar_action` 和 `browser_action` 是独立声明的，无法通过同一按钮动态切换，但可编程控制各自的打开/关闭。

### Safari (Web Extension)

Safari 16.4+ 支持 `browser.sidebarAction` API，与 Firefox 类似。

## 跨浏览器兼容性

| 特性           | Chrome                | Firefox                 | Safari                  |
| -------------- | --------------------- | ----------------------- | ----------------------- |
| Popup API      | `chrome.action`       | `browser.action`        | `browser.action`        |
| 侧边栏 API     | `chrome.sidePanel`    | `browser.sidebarAction` | `browser.sidebarAction` |
| 侧边栏最低版本 | 114+                  | 48+                     | 16.4+                   |
| API 命名空间   | `sidePanel`（非标准） | `sidebarAction`（标准） | `sidebarAction`（标准） |
| 动态切换       | ✅ 支持               | 有限支持                | 有限支持                |

**关键差异**: Chrome 使用专有的 `sidePanel` API，Firefox/Safari 使用标准的 `sidebarAction` API。

## 用户配置存储

```typescript
// 保存用户偏好
await chrome.storage.sync.set({
  uiMode: "sidebar", // 'popup' | 'sidebar'
});

// 读取用户偏好
const { uiMode } = await chrome.storage.sync.get("uiMode");
```

## 推荐实现方案：浏览器适配层

```
src/
├── adapters/
│   ├── ui-adapter.ts       # 适配器接口
│   ├── chrome-adapter.ts   # Chrome sidePanel 适配
│   └── firefox-adapter.ts  # Firefox sidebarAction 适配
├── entrypoints/
│   ├── popup/              # Popup 入口（共享组件）
│   └── sidepanel/          # Side Panel 入口（共享组件）
└── shared/
    └── state.ts            # 共享状态管理
```

**适配器接口**:

```typescript
interface UIAdapter {
  setMode(mode: "popup" | "sidebar"): Promise<void>;
  openSidebar(): Promise<void>;
  closeSidebar(): Promise<void>;
  getMode(): Promise<"popup" | "sidebar">;
}

function getAdapter(): UIAdapter {
  if (typeof chrome !== "undefined" && chrome.sidePanel) {
    return new ChromeAdapter();
  } else if (typeof browser !== "undefined" && browser.sidebarAction) {
    return new FirefoxAdapter();
  }
  throw new Error("Unsupported browser");
}
```

**Chrome 适配器实现**:

```typescript
class ChromeAdapter implements UIAdapter {
  async setMode(mode: "popup" | "sidebar") {
    await chrome.storage.sync.set({ uiMode: mode });

    if (mode === "sidebar") {
      await chrome.action.setPopup({ popup: "" });
      await chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: true,
      });
    } else {
      await chrome.sidePanel.setPanelBehavior({
        openPanelOnActionClick: false,
      });
      await chrome.action.setPopup({ popup: "/popup.html" });
    }
  }
  // ...
}
```

## 技术难点

1. **API 不兼容**: Chrome `sidePanel` vs Firefox/Safari `sidebarAction`，需适配层
2. **动态切换限制**: Firefox 的 `sidebar_action` 在 manifest 中静态声明，运行时只能切换内容
3. **状态同步**: Popup 和 Side Panel 是独立 UI 上下文，需通过 `chrome.storage` 或消息传递共享状态
4. **图标状态指示**: 切换模式后需更新图标/徽章提示用户
