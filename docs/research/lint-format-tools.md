# 代码 Lint & 格式化工具调研

> 调研日期：2026-06-05

## OXC 工具链概览

OXC (Oxidation Compiler) 是由 VoidZero 开发的 Rust 高性能 JavaScript/TypeScript 工具链：

| 工具          | 用途                       | 状态 |
| ------------- | -------------------------- | ---- |
| **Oxlint**    | Linter（替代 ESLint）      | 稳定 |
| **Oxfmt**     | Formatter（替代 Prettier） | Beta |
| oxc-parser    | 解析器                     | 稳定 |
| oxc-transform | 转译器                     | 稳定 |

## Oxlint vs ESLint

| 维度            | ESLint             | Oxlint                                   |
| --------------- | ------------------ | ---------------------------------------- |
| 语言            | JavaScript         | Rust                                     |
| 性能            | 基准               | 快 50~100 倍                             |
| React 规则      | 需装插件           | 60+ 条内置原生支持                       |
| TypeScript 规则 | 需装插件           | 内置原生支持                             |
| Hooks 规则      | 需装插件           | `rules-of-hooks`、`exhaustive-deps` 内置 |
| jsx-a11y        | 需装插件           | 35+ 条内置                               |
| 总规则数        | 取决于插件配置     | 813+ 条内置                              |
| 配置复杂度      | 较高（需多个插件） | 低（零配置即可用）                       |

**React 规则覆盖**：

- 核心规则：`jsx-key`、`rules-of-hooks`、`exhaustive-deps`、`no-direct-mutation-state`、`no-unstable-nested-components` 等
- 性能规则：`jsx-no-new-function-as-prop`、`jsx-no-new-object-as-prop`
- 无障碍规则：`alt-text`、`aria-props`、`click-events-have-key-events` 等

**已知生产使用者**：Elastic Kibana、Sentry JavaScript、Renovate、Preact、PostHog、Cloudflare Agents

## Oxfmt vs Prettier

| 维度              | Prettier | Oxfmt                               |
| ----------------- | -------- | ----------------------------------- |
| 性能              | 基准     | 快 30 倍                            |
| 一致性            | -        | 通过 100% Prettier JS/TS 一致性测试 |
| Import 排序       | 需装插件 | 内置                                |
| Tailwind 排序     | 需装插件 | 内置                                |
| package.json 排序 | 需装插件 | 内置                                |
| 稳定性            | 成熟     | Beta                                |

**注意**：Oxfmt 默认 `printWidth` 为 100（Prettier 默认 80），需显式配置。

## 与 Vite 生态集成

CLI 直接集成，无需 Vite 插件：

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

## ESLint 迁移

自动迁移工具：`npx @oxlint/migrate eslint.config.js`

渐进迁移方案：可用 `eslint-plugin-oxlint` 禁用与 oxlint 重叠的 ESLint 规则。

## 最终选择

- **Linter**: Oxlint（已生产就绪，React/TS 规则内置，性能极佳）
- **Formatter**: Oxfmt（Beta 但通过 Prettier 一致性测试，内置 import 排序）
