export interface Repo {
  nameWithOwner: string;
  name: string;
  owner: string;
  description: string;
  url: string;
  homepageUrl: string;
  stargazerCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  topics: string[];
  isArchived: boolean;
  isDisabled: boolean;
  pushedAt: string;
  starredAt: string;
}

export interface StarList {
  id: string;
  name: string;
  description: string;
  repositories: string[];
}

export interface LocalTag {
  name: string;
  color: string;
}

export interface RepoTagMap {
  [repoFullName: string]: string[];
}

export interface GitHubUser {
  login: string;
  avatarUrl: string;
  name: string;
}

export type UIMode = "popup" | "sidebar";

export interface Settings {
  token: string;
  uiMode: UIMode;
}
