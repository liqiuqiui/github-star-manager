# Github Star Manager — 实施计划

> 创建日期：2026-06-05

## 项目概述

GitHub Star 管理浏览器插件，支持 Chrome / Firefox，所有操作通过 GitHub API 完成。

## 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 框架 | WXT | 基于 Vite，支持 Chrome + Firefox，HMR 体验最佳，活跃维护 |
| 前端 | React 19 + TypeScript | 最新 React，生态成熟 |
| 状态管理 | Zustand | 轻量级状态管理，适合插件场景 |
| 样式 | UnoCSS | WXT 有配套 unocss 包 |
| Lint | Oxlint | Rust 实现，比 ESLint 快 50~100 倍，React/TS 规则内置 |
| 格式化 | Oxfmt | 比 Prettier 快 30 倍，内置 import 排序和 Tailwind 排序 |
| Git Hooks | lefthook | Go 原生二进制，单 YAML 配置，并行执行 |
| 提交规范 | commitlint + Conventional Commits | 检查提交信息格式，支持自动化 changelog |
| 暂存 lint | lint-staged | 只对暂存文件运行 lint，避免全量扫描 |
| 存储 | chrome.storage.sync + IndexedDB | sync 存用户配置，IndexedDB 缓存 Star 数据 |
| API | GitHub GraphQL（主要）+ REST（补充） | GraphQL 一次请求获取更多字段，减少调用次数 |

## 项目结构

```
github-star-manager/
├── wxt.config.ts                 # WXT 配置
├── package.json
├── src/
│   ├── entrypoints/
│   │   ├── background.ts         # Service Worker，处理 UI 模式切换
│   │   ├── popup/
│   │   │   ├── index.html        # Popup 入口 HTML
│   │   │   └── main.tsx          # Popup React 入口
│   │   ├── sidepanel/
│   │   │   ├── index.html        # 侧边栏入口 HTML
│   │   │   └── main.tsx          # 侧边栏 React 入口
│   │   └── content.ts            # Content Script（可选，用于注入 GitHub 页面按钮）
│   ├── components/               # 共享 React 组件
│   │   ├── StarList.tsx          # Star 列表展示
│   │   ├── SearchBar.tsx         # 搜索栏
│   │   ├── TagPanel.tsx          # 标签面板
│   │   ├── BatchActions.tsx      # 批量操作栏
│   │   └── Settings.tsx          # 设置页面
│   ├── hooks/                    # React Hooks
│   │   ├── useGitHub.ts          # GitHub API 封装
│   │   ├── useStars.ts           # Star 数据管理
│   │   ├── useTags.ts            # 本地标签管理
│   │   └── useStarLists.ts       # GitHub Star Lists 管理
│   ├── stores/                   # Zustand 状态管理
│   │   ├── starStore.ts          # Star 数据 store
│   │   └── settingsStore.ts      # 设置 store
│   ├── services/
│   │   ├── github-api.ts         # GitHub GraphQL/REST API 调用
│   │   ├── cache.ts              # IndexedDB 缓存层
│   │   └── auth.ts               # Token 管理
│   ├── adapters/
│   │   ├── ui-adapter.ts         # UI 适配器接口
│   │   ├── chrome-adapter.ts     # Chrome sidePanel 适配
│   │   └── firefox-adapter.ts    # Firefox sidebarAction 适配
│   └── types/
│       └── index.ts              # 类型定义
├── public/
│   └── icons/                    # 插件图标
└── tests/
```

## 核心功能

### 功能 1: GitHub 认证

- 使用 GitHub Personal Access Token (PAT) 方式
- 用户在设置页输入 Token，存储到 `chrome.storage.sync`
- Token 权限范围：`read:user` + `repo`
- 首次使用引导用户生成 Token

### 功能 2: Star 列表管理

**数据获取**:
- GraphQL `User.starredRepositories` 分页拉取全部 Star（cursor 分页，每页 100）
- 缓存到 IndexedDB，记录 `lastSyncTime`
- 增量同步：按 `starredAt` 时间戳拉取新增

**展示**:
- 列表视图：卡片形式展示仓库（名称、描述、语言、Star 数、Star 时间）
- 支持按语言、Star 时间、最近更新排序
- 支持按关键词搜索（本地全文匹配名称/描述/topics）

### 功能 3: 分类系统（双模式）

**模式 A — GitHub Star Lists**:
- GraphQL 查询 `User.starLists` 获取用户的所有 Lists
- `addStarListEntry` / `removeStarListEntry` 管理列表内容
- `createStarList` / `deleteStarList` 管理列表本身
- 受限于 32 个列表上限、列表默认公开

**模式 B — 本地标签**:
- 存储在 IndexedDB，键为仓库 `full_name`
- 支持多标签（一个仓库可属于多个标签）
- 无数量限制，支持私有
- 支持标签的增删改查

**统一视图**: 在 UI 中同时展示两种分类，用户可自由切换

### 功能 4: 批量操作

- 多选模式：checkbox 选择多个仓库
- 批量取消 Star：`DELETE /user/starred/{owner}/{repo}`，串行 + 间隔 200ms
- 批量移动到 Star List：批量 `removeStarListEntry` + `addStarListEntry`
- 批量打本地标签：直接写 IndexedDB
- 操作进度条 + 取消按钮

### 功能 5: UI 模式可配置

- 设置页面中的"UI 模式"选项
- Chrome: `chrome.action.setPopup()` + `chrome.sidePanel.setPanelBehavior()` 动态切换
- Firefox: manifest 声明 `sidebar_action` + `action`，通过消息控制
- Popup 和 Side Panel 共用同一套 React 组件，仅入口 HTML 不同

## 实施步骤

### Phase 1: 项目初始化 & 基础框架

1. 使用 WXT 创建项目：`npx wxt@latest init github-star-manager --template react`
2. 配置 React 19 + TypeScript + UnoCSS + Zustand
3. 配置 manifest 权限：`storage`、`sidePanel`（Chrome）
4. 创建基础 Popup 和 Side Panel 入口页面
5. 实现 UI 模式切换的适配器层

### Phase 2: GitHub API 集成

1. 实现 Token 管理（存储/读取/验证）
2. 封装 GraphQL 客户端（使用 `fetch`）
3. 实现 Star 列表分页拉取 + IndexedDB 缓存
4. 实现 Star Lists API 调用

### Phase 3: 核心 UI

1. Star 列表展示组件（卡片/列表视图切换）
2. 搜索栏（本地全文搜索）
3. 排序/筛选（按语言、时间、Star 数）
4. 标签面板（本地标签 + Star Lists 双模式）

### Phase 4: 批量操作

1. 多选模式 UI
2. 批量取消 Star（带限流）
3. 批量移动到 Star List
4. 批量打本地标签
5. 操作进度和错误处理

### Phase 5: 设置 & 优化

1. 设置页面（Token 配置、UI 模式选择、同步设置）
2. 增量同步逻辑
3. 错误处理和重试机制
4. 性能优化（虚拟滚动、懒加载）

### Phase 6: 多浏览器适配 & 发布

1. Firefox 构建测试
2. 图标和商店素材制作
3. 打包发布到 Chrome Web Store / Firefox Add-ons

## 限流策略

```typescript
// 串行执行，每个请求间隔 200ms
async function batchUnstar(repos: Repo[]) {
  for (const repo of repos) {
    await unstar(repo.full_name);
    await delay(200);
  }
}
```

## 验证方式

1. `npm run dev` 启动开发模式，在浏览器中加载未打包扩展
2. 输入 GitHub Token 验证 API 连通性
3. 测试 Star 列表拉取和展示
4. 测试搜索、筛选、排序功能
5. 测试标签的增删改查
6. 测试批量操作（选中多个仓库，批量取消 Star / 移动 / 打标签）
7. 测试 UI 模式切换（Popup ↔ Side Panel）
8. 分别在 Chrome 和 Firefox 中测试
