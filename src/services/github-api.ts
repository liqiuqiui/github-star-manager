import type { Repo, StarList, GitHubUser } from "../types";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface StarredRepoEdge {
  starredAt: string;
  node: {
    nameWithOwner: string;
    name: string;
    description: string;
    url: string;
    homepageUrl: string;
    stargazerCount: number;
    primaryLanguage: { name: string; color: string } | null;
    repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
    isArchived: boolean;
    isDisabled: boolean;
    pushedAt: string;
  };
}

interface StarListResponse {
  id: string;
  name: string;
  description: string;
  items: { nodes: Array<{ nameWithOwner: string }> };
}

async function graphqlRequest<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();
  if (result.errors) {
    throw new Error(result.errors.map((e) => e.message).join(", "));
  }

  return result.data;
}

export async function verifyToken(token: string): Promise<GitHubUser> {
  const data = await graphqlRequest<{ viewer: GitHubUser }>(
    token,
    `query {
      viewer {
        login
        avatarUrl
        name
      }
    }`,
  );
  return data.viewer;
}

export async function fetchAllStars(token: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data: {
      viewer: {
        starredRepositories: {
          pageInfo: { hasNextPage: boolean; endCursor: string };
          edges: StarredRepoEdge[];
        };
      };
    } = await graphqlRequest(
      token,
      `query ($after: String) {
        viewer {
          starredRepositories(first: 100, after: $after, orderBy: { field: STARRED_AT, direction: DESC }) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              starredAt
              node {
                nameWithOwner
                name
                description
                url
                homepageUrl
                stargazerCount
                primaryLanguage {
                  name
                  color
                }
                repositoryTopics(first: 10) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
                isArchived
                isDisabled
                pushedAt
              }
            }
          }
        }
      }`,
      { after: cursor },
    );

    const starredRepos = data.viewer.starredRepositories;

    for (const edge of starredRepos.edges) {
      const node = edge.node;
      const [owner, name] = node.nameWithOwner.split("/");
      repos.push({
        nameWithOwner: node.nameWithOwner,
        name,
        owner,
        description: node.description || "",
        url: node.url,
        homepageUrl: node.homepageUrl || "",
        stargazerCount: node.stargazerCount,
        primaryLanguage: node.primaryLanguage,
        topics: node.repositoryTopics.nodes.map((t: { topic: { name: string } }) => t.topic.name),
        isArchived: node.isArchived,
        isDisabled: node.isDisabled,
        pushedAt: node.pushedAt,
        starredAt: edge.starredAt,
      });
    }

    hasNextPage = starredRepos.pageInfo.hasNextPage;
    cursor = starredRepos.pageInfo.endCursor;
  }

  return repos;
}

export async function fetchStarLists(token: string): Promise<StarList[]> {
  const data: {
    viewer: {
      lists: {
        nodes: StarListResponse[];
      };
    };
  } = await graphqlRequest(
    token,
    `query {
      viewer {
        lists(first: 32) {
          nodes {
            id
            name
            description
            items(first: 100) {
              nodes {
                ... on Repository {
                  nameWithOwner
                }
              }
            }
          }
        }
      }
    }`,
  );

  return data.viewer.lists.nodes.map((list) => ({
    id: list.id,
    name: list.name,
    description: list.description || "",
    repositories: list.items.nodes.map((r) => r.nameWithOwner),
  }));
}

export async function unstarRepo(token: string, nameWithOwner: string): Promise<void> {
  const [owner, name] = nameWithOwner.split("/");
  await fetch(`https://api.github.com/user/starred/${owner}/${name}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
}

export async function fetchRepoInfo(token: string, nameWithOwner: string): Promise<Repo | null> {
  const [owner, name] = nameWithOwner.split("/");

  try {
    const data: {
      repository: {
        nameWithOwner: string;
        name: string;
        description: string;
        url: string;
        homepageUrl: string;
        stargazerCount: number;
        primaryLanguage: { name: string; color: string } | null;
        repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
        isArchived: boolean;
        isDisabled: boolean;
        pushedAt: string;
      } | null;
    } = await graphqlRequest(
      token,
      `query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          nameWithOwner
          name
          description
          url
          homepageUrl
          stargazerCount
          primaryLanguage {
            name
            color
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          isArchived
          isDisabled
          pushedAt
        }
      }`,
      { owner, name },
    );

    const repo = data.repository;
    if (!repo) return null;

    return {
      nameWithOwner: repo.nameWithOwner,
      name: repo.name,
      owner,
      description: repo.description || "",
      url: repo.url,
      homepageUrl: repo.homepageUrl || "",
      stargazerCount: repo.stargazerCount,
      primaryLanguage: repo.primaryLanguage,
      topics: repo.repositoryTopics.nodes.map((t) => t.topic.name),
      isArchived: repo.isArchived,
      isDisabled: repo.isDisabled,
      pushedAt: repo.pushedAt,
      starredAt: new Date().toISOString(),
    };
  } catch (err) {
    // 区分不同错误类型
    if (err instanceof Error) {
      // GraphQL 错误（仓库不存在、无权限等）
      if (err.message.includes("Could not resolve")) {
        return null;
      }
      // 网络错误或 API 限流 - 向上抛出，让调用方决定是否重试
      throw err;
    }
    return null;
  }
}

export async function starRepo(token: string, nameWithOwner: string): Promise<void> {
  const [owner, name] = nameWithOwner.split("/");
  await fetch(`https://api.github.com/user/starred/${owner}/${name}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Length": "0",
    },
  });
}
