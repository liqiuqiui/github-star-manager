# GitHub Star 管理 — API 能力评估

> 调研日期：2026-06-05

## REST API — Star 相关端点

| HTTP 方法 | 端点                               | 认证   | 功能                                  |
| --------- | ---------------------------------- | ------ | ------------------------------------- |
| `GET`     | `/user/starred`                    | 必需   | 列出当前认证用户 starred 的仓库       |
| `GET`     | `/users/{username}/starred`        | 不需要 | 列出指定用户 starred 的仓库（仅公开） |
| `GET`     | `/repos/{owner}/{repo}/stargazers` | 不需要 | 列出给某仓库 star 的用户              |
| `GET`     | `/user/starred/{owner}/{repo}`     | 必需   | 检查当前用户是否已 star 某仓库        |
| `PUT`     | `/user/starred/{owner}/{repo}`     | 必需   | 给仓库加 star                         |
| `DELETE`  | `/user/starred/{owner}/{repo}`     | 必需   | 取消仓库的 star                       |

## 列出 Starred 仓库

**端点**: `GET /user/starred`

**分页参数**:

- `per_page` (默认 30, 最大 100)
- `page` (默认 1)
- 采用 Link header 分页机制

**排序参数**:

- `sort`: `created`（star 时间）或 `updated`（仓库最后更新时间）
- `direction`: `asc` 或 `desc`

**获取 Star 时间**: 设置 Accept header 为 `application/vnd.github.star+json`，响应包含 `starred_at` 字段

**响应关键字段**:

- `id`, `name`, `full_name`, `description`, `html_url`, `language`
- `topics` (字符串数组)
- `stargazers_count`, `forks_count`, `watchers_count`
- `private`, `archived`, `disabled`, `visibility`
- `created_at`, `updated_at`, `pushed_at`
- `starred_at`（仅使用 star+json media type 时）

## Star / Unstar

- **Star**: `PUT /user/starred/{owner}/{repo}` → 204 No Content
- **Unstar**: `DELETE /user/starred/{owner}/{repo}` → 204 No Content
- **检查**: `GET /user/starred/{owner}/{repo}` → 204 = 已 star, 404 = 未 star

## GraphQL API

**查询 Star 列表**:

```graphql
query GetUserStars($after: String) {
  viewer {
    starredRepositories(
      first: 100
      after: $after
      orderBy: { field: STARRED_AT, direction: DESC }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        nameWithOwner
        description
        url
        stargazerCount
        primaryLanguage {
          name
        }
        topics: repositoryTopics(first: 10) {
          nodes {
            topic {
              name
            }
          }
        }
        isArchived
        pushedAt
      }
      starredAt
    }
  }
}
```

**查询 Star Lists**:

```graphql
query {
  viewer {
    starLists(first: 32) {
      nodes {
        id
        name
        description
        repositories(first: 100) {
          nodes {
            nameWithOwner
          }
        }
      }
    }
  }
}
```

**变更操作**:

```graphql
# 创建 Star List
mutation {
  createStarList(input: { name: "My List", description: "..." }) {
    starList {
      id
      name
    }
  }
}

# 添加仓库到列表
mutation {
  addStarListEntry(input: { starListId: "...", repositoryId: "..." }) {
    entry {
      repository {
        nameWithOwner
      }
    }
  }
}

# 从列表移除仓库
mutation {
  removeStarListEntry(input: { starListId: "...", repositoryId: "..." }) {
    entry {
      repository {
        nameWithOwner
      }
    }
  }
}
```

## 速率限制

| API 类型      | 认证用户      | 未认证用户 |
| ------------- | ------------- | ---------- |
| REST Core API | 5,000 次/小时 | 60 次/小时 |
| GraphQL API   | 5,000 点/小时 | N/A        |

**二级限制**:

- REST: 900 点/分钟/端点
- GraphQL: 2,000 点/分钟
- 并发请求上限: 100 个

**速率限制头**:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-RateLimit-Used`

## 关键限制

| 限制                            | 影响                         | 应对方案                  |
| ------------------------------- | ---------------------------- | ------------------------- |
| **不支持为 star 添加标签/备注** | Star 是纯布尔关系            | 必须自建存储（IndexedDB） |
| **无服务端搜索**                | 只能拉取全部数据后客户端过滤 | 本地缓存 + 全文搜索       |
| **Star Lists 上限 32 个**       | 分类不够用                   | 本地标签作为补充          |
| **列表默认公开**                | 隐私问题                     | 本地标签支持私有          |
| **批量操作逐个调用**            | 受速率限制                   | 串行 + 间隔 200ms 限流    |

## 开发建议

1. **拉取完整 Star 列表**: 使用 GraphQL cursor 分页，每页 100，逐页遍历
2. **获取 Star 时间**: GraphQL 直接返回 `starredAt`，REST 需用 `star+json` media type
3. **搜索/筛选**: 拉回全部数据后本地缓存，客户端搜索
4. **批量操作**: 串行执行，每个请求间隔 200ms，避免触发二级速率限制
5. **建议使用 GraphQL**: 一次请求获取仓库详情 + star 时间 + topics，减少 API 调用次数
