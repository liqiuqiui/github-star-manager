import type { Repo, StarList, GitHubUser } from "../types";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface StarredRepoNode {
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
  starredAt: string;
}

interface StarListResponse {
  id: string;
  name: string;
  description: string;
  repositories: { nodes: Array<{ nameWithOwner: string }> };
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
          nodes: StarredRepoNode[];
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
            nodes {
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
              starredAt
            }
          }
        }
      }`,
      { after: cursor },
    );

    const starredRepos = data.viewer.starredRepositories;

    for (const node of starredRepos.nodes) {
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
        starredAt: node.starredAt,
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
      starLists: {
        nodes: StarListResponse[];
      };
    };
  } = await graphqlRequest(
    token,
    `query {
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
    }`,
  );

  return data.viewer.starLists.nodes.map((list) => ({
    id: list.id,
    name: list.name,
    description: list.description || "",
    repositories: list.repositories.nodes.map((r) => r.nameWithOwner),
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
