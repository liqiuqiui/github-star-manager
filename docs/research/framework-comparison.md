# 多浏览器插件开发框架对比

> 调研日期：2026-06-05

## 框架详细分析

### 1. WXT (wxt.dev) — ⭐ 首选推荐

| 维度 | 详情 |
|------|------|
| 支持浏览器 | Chrome、Firefox、Edge、Safari、Opera |
| 技术栈 | 框架无关（React/Vue/Svelte 等任何有 Vite 插件的框架）；TypeScript 默认 |
| 开发体验 | 基于 Vite 的 HMR；Nuxt 风格自动导入；文件系统路由自动生成 manifest |
| 构建工具 | **Vite** |
| Manifest | 同时支持 MV2 和 MV3 |
| GitHub Stars | 9,929 |
| 最新版本 | v0.20.26（活跃维护） |
| 学习曲线 | 中等（熟悉 Nuxt/Vite 则上手快） |

**核心特性**:
- 文件系统入口点（自动生成 manifest）
- Module 系统支持跨扩展复用代码
- 丰富的配套包：storage、i18n、auto-icons、analytics、unocss
- 自动化商店发布

### 2. Extension.js — 推荐

| 维度 | 详情 |
|------|------|
| 支持浏览器 | Chrome、Firefox、Edge、Brave、Opera（**Safari 尚不支持**） |
| 技术栈 | React、Preact、Vue、Svelte；TypeScript 支持 |
| 开发体验 | 内置 dev server + HMR；浏览器前缀 manifest 系统 |
| 构建工具 | 自有构建系统 |
| Manifest | MV3 为默认 |
| GitHub Stars | 4,993 |
| 最新版本 | v3.18.2（活跃维护） |
| 学习曲线 | 低（`npx extension create` 一键创建） |

**核心特性**:
- 浏览器前缀 manifest 系统（单文件多浏览器编译）
- 每个浏览器独立输出目录 `dist/<browser>`
- 零配置理念
- 14 年项目历史

### 3. Plasmo — 可选

| 维度 | 详情 |
|------|------|
| 支持浏览器 | Chrome、Firefox、Edge；**Safari 未明确** |
| 技术栈 | React（一等支持）、Preact、Svelte、Vue |
| 开发体验 | 声明式开发模型；内置 React HMR |
| 构建工具 | 自有构建系统（非 Vite） |
| GitHub Stars | 13,046（最高） |
| 最新版本 | v0.90.5（**近 1 年未更新**） |
| 学习曲线 | 低-中 |

**核心特性**:
- 内置 Storage、Messaging、i18n 库
- Content Scripts UI 生命周期管理
- BPP 自动化商店发布

**不足**: 维护状态令人担忧，370 个 open issues

### 4. web-ext (Mozilla 官方) — 特定场景

| 维度 | 详情 |
|------|------|
| 支持浏览器 | **仅 Firefox** |
| 技术栈 | 纯 CLI 工具 |
| 构建工具 | 无，纯打包和校验 |
| GitHub Stars | ~3k+ |
| 学习曲线 | 极低 |

**局限**: 仅限 Firefox 生态，不能用于跨浏览器开发。

## 综合对比表

| 维度 | WXT | Extension.js | Plasmo | web-ext |
|------|-----|--------------|--------|---------|
| **Chrome** | ✅ | ✅ | ✅ | ❌ |
| **Firefox** | ✅ | ✅ | ✅ | ✅ |
| **Safari** | ✅ | ❌ | 未明确 | ❌ |
| **Edge** | ✅ | ✅ | ✅ | ❌ |
| **MV3** | ✅ | ✅ (默认) | ✅ | ✅ |
| **MV2** | ✅ | ❌ | ✅ | ✅ |
| **TypeScript** | 默认 | 支持 | 内置 | N/A |
| **HMR** | ✅ (Vite) | ✅ | ✅ | 文件监听 |
| **GitHub Stars** | 10k | 5k | 13k | ~3k |
| **更新频率** | 活跃 | 活跃 | 慢 | 稳定 |
| **商店发布** | 自动化 | 手动 | BPP 自动化 | AMO 签名 |

## 推荐结论

**首选 WXT**：
- 基于 Vite，开发体验最佳（原生 HMR）
- 活跃维护，社区增长最快
- 框架无关，不绑定特定前端框架
- 配套生态丰富（storage、i18n、unocss 等）

**备选 Extension.js**：零配置体验好，但 HMR 不如 Vite 原生

**不推荐 Plasmo**：近 1 年未更新，维护状态堪忧

### 最终选择

- **框架**: WXT
- **前端**: React 19 + TypeScript
- **状态管理**: Zustand
- **样式**: UnoCSS
- **目标浏览器**: Chrome + Firefox（Safari 非必须）
