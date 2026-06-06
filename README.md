# GitHub Star Manager

一个用于管理 GitHub Star 仓库的浏览器扩展，支持 Popup 和 SidePanel 两种 UI 模式。

## ✨ 功能特性

### 核心功能

- 📦 **Star 仓库管理** - 查看、搜索、筛选所有 Star 的仓库
- 🏷️ **标签分组** - 支持本地标签和 GitHub 原生列表
- ⭐ **批量操作** - 批量取消 Star
- 🔍 **搜索过滤** - 按名称、描述、主题搜索，按语言、排序方式筛选

### 同步功能

- 🔄 **手动同步** - 一键从 GitHub 同步 Star 数据
- ⏰ **自动同步** - 支持每天/每周/每月定时自动同步
- 👀 **实时监听** - Content Script 监听 GitHub 页面的 Star 操作，自动触发同步

### UI 功能

- 🌓 **暗色模式** - 支持亮色/暗色/跟随系统
- 📱 **双 UI 模式** - Popup 弹窗和 SidePanel 侧边栏，可实时切换
- 🎨 **shadcn/ui** - 使用现代化 UI 组件库

## 🛠️ 技术栈

| 类别     | 技术                             |
| -------- | -------------------------------- |
| 框架     | WXT (Web Extension Tools)        |
| UI       | React 19 + shadcn/ui             |
| 样式     | Tailwind CSS v4                  |
| 状态管理 | Zustand                          |
| 数据存储 | IndexedDB + browser.storage.sync |
| 工具库   | lodash-es                        |
| 图标     | Lucide React                     |
| 语言     | TypeScript                       |

## 📁 项目结构

```
github-star-manager/
├── entrypoints/
│   ├── background.ts      # Service Worker (定时同步、消息通信)
│   ├── content.ts         # Content Script (GitHub 页面监听)
│   ├── popup/
│   │   ├── App.tsx        # 主应用组件
│   │   ├── main.tsx       # Popup 入口
│   │   └── style.css      # 全局样式
│   └── sidepanel/
│       ├── main.tsx       # SidePanel 入口
│       └── index.html
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui 组件
│   │   ├── SearchBar.tsx  # 搜索栏
│   │   ├── StarList.tsx   # 仓库列表 (虚拟滚动)
│   │   ├── StarCard.tsx   # 仓库卡片
│   │   ├── TagPanel.tsx   # 标签面板
│   │   ├── ListPanel.tsx  # 列表面板
│   │   ├── BatchActions.tsx # 批量操作
│   │   └── Settings.tsx   # 设置页面
│   ├── stores/
│   │   ├── starStore.ts   # Star 数据状态
│   │   └── settingsStore.ts # 设置状态
│   ├── services/
│   │   ├── github-api.ts  # GitHub API 封装
│   │   ├── cache.ts       # IndexedDB 缓存
│   │   └── auth.ts        # 认证和设置存储
│   ├── hooks/
│   │   └── useTheme.ts    # 主题切换 Hook
│   ├── lib/
│   │   ├── utils.ts       # 工具函数 (cn)
│   │   └── date.ts        # 日期工具
│   └── types/
│       └── index.ts       # TypeScript 类型定义
├── public/
│   └── icon/              # 扩展图标
├── wxt.config.ts          # WXT 配置
├── tailwind.config.js     # Tailwind 配置
├── postcss.config.js      # PostCSS 配置
├── components.json        # shadcn/ui 配置
└── package.json
```

## 🚀 开发指南

### 环境要求

- Node.js >= 22
- pnpm >= 10

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# Chrome (默认)
pnpm dev

# 指定浏览器
pnpm dev:chrome
pnpm dev:firefox
pnpm dev:edge
pnpm dev:safari
```

### 构建

```bash
# 构建所有浏览器扩展
pnpm build

# 构建指定浏览器
pnpm build:chrome
pnpm build:firefox
pnpm build:edge
pnpm build:safari

# 构建并打包所有浏览器扩展
pnpm package
```

### 代码检查

```bash
# Lint
pnpm lint

# Format
pnpm format
```

## ⚙️ 配置说明

### GitHub Token

1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 创建新 Token，勾选 `read:user` 和 `repo` 权限
3. 在扩展设置中填入 Token

### 自动同步

在设置中可以配置自动同步：

- **频率**：每天/每周/每月
- **时间**：时:分
- **星期**：每周可选择多天
- **日期**：每月可选择具体日期

### UI 模式

- **Popup**：点击扩展图标弹出窗口
- **SidePanel**：在浏览器侧边栏显示，支持实时切换

## 📝 开发规范

### Git 提交

使用 Conventional Commits 规范：

```
<type>: <description>

Co-Authored-By: Claude <noreply@anthropic.com>
```

类型：`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### 代码风格

- ESLint (oxlint) 进行代码检查
- Prettier (oxfmt) 进行代码格式化
- 使用 lodash-es 进行工具函数处理

## 📄 License

MIT
