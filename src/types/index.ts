import { type SyncFrequency } from "@@/common/enums";

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

export interface AutoSyncConfig {
  enabled: boolean;
  frequency: SyncFrequency;
  hour: number; // 0-23
  minute: number; // 0-59
  daysOfWeek?: number[]; // 0-6, 0=周日, 用于 weekly
  dayOfMonth?: number; // 1-31, 用于 monthly
}

export interface Settings {
  token: string;
  autoSync: AutoSyncConfig;
  language?: string;
}
