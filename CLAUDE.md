# 项目指引

This file provides guidance to AI agents when working with code in this repository.

## 项目概述

GitHub Star Manager 是一个浏览器扩展，用于管理 GitHub Star 仓库。支持 Popup 和 SidePanel 两种 UI 模式，提供搜索、筛选、标签分组、批量操作和自动同步功能。

## 常用命令

```bash
# 开发
pnpm dev              # Chrome 开发模式
pnpm dev:firefox      # Firefox 开发模式

# 构建
pnpm build            # Chrome 生产构建
pnpm build:firefox    # Firefox 生产构建

# 代码质量
pnpm lint             # oxlint 检查
pnpm lint:fix         # oxlint 自动修复
pnpm format           # oxfmt 格式化
pnpm format:check     # 检查格式
pnpm compile          # TypeScript 类型检查
```

## 架构设计

### 入口点 (entrypoints/)

- `background.ts` - Service Worker：处理定时同步 (chrome.alarms)、消息通信、UI 模式切换
- `content.ts` - Content Script：注入 GitHub 页面，监听 Star 操作并触发同步
- `popup/` - Popup UI 入口
- `sidepanel/` - SidePanel UI 入口（复用 popup 的 App 组件）

### 状态管理 (src/stores/)

使用 Zustand，两个独立 Store：

- `starStore` - Star 数据、同步状态、加载状态
- `settingsStore` - Token、UI 模式、自动同步配置

### 服务层 (src/services/)

- `github-api.ts` - GitHub GraphQL API 封装（读取）+ REST API（写操作）
- `cache.ts` - IndexedDB 缓存（repos、tags、meta）
- `auth.ts` - 设置存储 (browser.storage.sync)

### 组件 (src/components/)

- `ui/` - shadcn/ui 基础组件（button、input、select、checkbox、badge、label、separator）
- 业务组件：SearchBar、StarList、StarCard、TagPanel、ListPanel、BatchActions、Settings

### 数据流

```
GitHub API → github-api.ts → starStore (Zustand) ↔ cache.ts (IndexedDB)
                                    ↓
                              React UI 组件
```

## 技术栈

- **框架**: WXT (Web Extension Tools) + React 19
- **样式**: Tailwind CSS v4 + shadcn/ui
- **状态**: Zustand
- **工具**: lodash-es（使用 ES 模块版本）
- **图标**: Lucide React
- **Lint**: oxlint + oxfmt（非 ESLint/Prettier）

## 重要约定

### 国际化

所有用户可见文案（按钮文字、提示信息、标签等）禁止硬编码，必须通过 `useTranslation` 使用国际化 key。

修改文案时需同步维护 `src/i18n/locales/` 下的所有语言文件：

任何文案变更都需同步维护语言文件，无引用的 key 应及时清理。

### 路径别名

`@/` 映射到 `./src/`，但在 WXT 中需要使用相对路径（entrypoints 中用 `../../src/`）。

### Git 提交规范

使用 Conventional Commits，提交信息必须包含：

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Pre-commit Hook

使用 lefthook + lint-staged，自动运行 oxlint 和 oxfmt。

### 浏览器扩展 API

使用 `browser.*` API（webextension-polyfill），Chrome 特定功能用 `import.meta.env.CHROME` 判断。

### 存储策略

- **IndexedDB** (cache.ts): 大数据（repos、tags、starLists）
- **browser.storage.sync**: 小配置（token、uiMode、autoSync）
