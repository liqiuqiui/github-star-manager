import { create } from "zustand";
import type { Repo, StarList, RepoTagMap } from "../types";
import { fetchAllStars, fetchStarLists, unstarRepo } from "../services/github-api";
import * as cache from "../services/cache";

interface StarState {
  repos: Repo[];
  starLists: StarList[];
  repoTags: RepoTagMap;
  isLoading: boolean;
  isSyncing: boolean;
  isDirty: boolean; // 标记是否需要完整同步
  error: string | null;
  lastSyncTime: number | null;

  loadFromCache: () => Promise<void>;
  syncFromGitHub: (token: string) => Promise<void>;
  markDirty: () => void;
  addRepo: (repo: Repo) => void;
  removeRepo: (nameWithOwner: string) => Promise<void>;
  unstar: (token: string, nameWithOwner: string) => Promise<void>;
  batchUnstar: (token: string, nameWithOwners: string[]) => Promise<void>;
}

export const useStarStore = create<StarState>((set, get) => ({
  repos: [],
  starLists: [],
  repoTags: {},
  isLoading: false,
  isSyncing: false,
  isDirty: false,
  error: null,
  lastSyncTime: null,

  loadFromCache: async () => {
    set({ isLoading: true, error: null });
    try {
      const [repos, repoTags, lastSyncTime, starLists] = await Promise.all([
        cache.getRepos(),
        cache.getRepoTags(),
        cache.getLastSyncTime(),
        cache.getStarLists(),
      ]);
      set({ repos, repoTags, lastSyncTime, starLists, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  syncFromGitHub: async (token: string) => {
    set({ isSyncing: true, error: null, isDirty: false });
    try {
      const [repos, starLists] = await Promise.all([fetchAllStars(token), fetchStarLists(token)]);
      await Promise.all([cache.saveRepos(repos), cache.saveStarLists(starLists)]);
      const lastSyncTime = Date.now();
      set({ repos, starLists, lastSyncTime, isSyncing: false });
    } catch (err) {
      set({ error: (err as Error).message, isSyncing: false });
    }
  },

  // 标记需要完整同步
  markDirty: () => {
    set({ isDirty: true });
  },

  // 本地增量添加 repo（用于外部 star 操作检测）
  addRepo: (repo: Repo) => {
    const { repos } = get();
    const exists = repos.some((r) => r.nameWithOwner === repo.nameWithOwner);
    if (!exists) {
      const newRepos = [repo, ...repos];
      set({ repos: newRepos });
      cache.saveRepos(newRepos).catch(console.error);
    }
  },

  // 本地增量删除 repo（用于外部 unstar 操作检测）
  removeRepo: async (nameWithOwner: string) => {
    const { repos } = get();
    const newRepos = repos.filter((r) => r.nameWithOwner !== nameWithOwner);
    if (newRepos.length !== repos.length) {
      set({ repos: newRepos, isDirty: true });
      await cache.saveRepos(newRepos).catch(console.error);
    }
  },

  unstar: async (token: string, nameWithOwner: string) => {
    try {
      await unstarRepo(token, nameWithOwner);
      // 直接从本地缓存移除，不触发全量同步
      const repos = get().repos.filter((r) => r.nameWithOwner !== nameWithOwner);
      await cache.saveRepos(repos);
      set({ repos });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  batchUnstar: async (token: string, nameWithOwners: string[]) => {
    set({ error: null });
    const failedNames: string[] = [];

    for (const name of nameWithOwners) {
      try {
        await unstarRepo(token, name);
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        failedNames.push(name);
        console.error(`Failed to unstar ${name}:`, err);
      }
    }

    // 只移除成功 unstar 的仓库
    const repos = get().repos.filter(
      (r) => !nameWithOwners.includes(r.nameWithOwner) || failedNames.includes(r.nameWithOwner),
    );
    await cache.saveRepos(repos).catch(console.error);
    set({
      repos,
      error: failedNames.length > 0 ? `Failed to unstar: ${failedNames.join(", ")}` : null,
    });
  },
}));
