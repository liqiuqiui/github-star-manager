# Git 提交规范工具链调研

> 调研日期：2026-06-05

## Conventional Commits 规范

提交信息格式：`<type>[optional scope]: <description>`

常用 type：`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

示例：`feat(star-list): add batch unstar with rate limiting`

## 工具对比

### Git Hooks 管理：husky vs lefthook

| 维度 | husky | lefthook |
|------|-------|----------|
| 语言 | JavaScript (Node.js) | Go (编译为二进制) |
| 启动速度 | 较慢（需启动 Node 进程） | 快（原生二进制，毫秒级） |
| 配置方式 | `.husky/` 目录下多个 shell 脚本 | 单个 `lefthook.yml` |
| 并行执行 | 有限 | 内置支持 |
| 社区规模 | 极大（32k+ stars） | 中等（5k+ stars，快速增长） |
| monorepo 支持 | 需额外配置 | 原生支持 |
| 学习成本 | 低 | 低 |

### 提交信息检查：commitlint

- 功能：校验提交信息是否符合 Conventional Commits 规范
- 包名：`@commitlint/cli` + `@commitlint/config-conventional`
- 配置：单文件 `commitlint.config.js`，支持 ESM
- 社区：16k+ stars，维护活跃

### 暂存文件 lint：lint-staged

- 功能：只对 git staged 的文件执行 lint，避免全量扫描
- 社区：12k+ stars，成熟稳定

### 交互式提交：commitizen

- 功能：`git cz` 命令，交互式引导编写规范提交信息
- 与 commitlint 互补：commitizen 帮助"写好"，commitlint 确保"写对"
- 初期可不引入，直接手写 Conventional Commits 格式

## 最终选择

- **Git Hooks**: lefthook（Go 原生，更快，单 YAML 配置）
- **提交检查**: commitlint + `@commitlint/config-conventional`
- **暂存 lint**: lint-staged
- **暂不引入**: commitizen（初期开发者少，手写即可）

## 配置示例

### lefthook.yml

```yaml
pre-commit:
  commands:
    lint:
      run: npx oxlint --fix {staged_files}
      glob: "*.{ts,tsx,js,jsx}"
    format:
      run: npx oxfmt --write {staged_files}
      glob: "*.{ts,tsx,js,jsx,json,css}"

commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
```

### commitlint.config.js

```js
export default {
  extends: ['@commitlint/config-conventional'],
};
```
