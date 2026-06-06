# Changelog

## [Unreleased]

### 🎨 UI 重构
- 迁移到 shadcn/ui 组件库
- 迁移到 Tailwind CSS v4
- 支持暗色模式（亮色/暗色/跟随系统）

### ✨ 新功能
- 全局同步遮罩 - 同步时显示 loading 状态
- UI 模式实时切换 - 切换 Popup/SidePanel 后立即生效
- GitHub 页面监听 - Content Script 监听 Star 操作并自动同步
- 自动同步配置 - 支持每天/每周/每月定时同步
- 引入 lodash-es 工具库

### 🔧 技术改进
- 使用 lint-staged 管理 pre-commit hook
- 优化代码结构和类型定义

---

## [0.1.0] - 2024-01-01

### ✨ 初始功能
- GitHub Star 仓库列表查看
- 搜索和筛选功能
- 标签分组管理
- 批量取消 Star
- Popup 和 SidePanel 双模式
- IndexedDB 本地缓存
