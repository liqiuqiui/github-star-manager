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
  error: string | null;
  lastSyncTime: number | null;

  loadFromCache: () => Promise<void>;
  syncFromGitHub: (token: string) => Promise<void>;
  unstar: (token: string, nameWithOwner: string) => Promise<void>;
  batchUnstar: (token: string, nameWithOwners: string[]) => Promise<void>;
}

export const useStarStore = create<StarState>((set, get) => ({
  repos: [],
  starLists: [],
  repoTags: {},
  isLoading: false,
  isSyncing: false,
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
    set({ isSyncing: true, error: null });
    try {
      const [repos, starLists] = await Promise.all([fetchAllStars(token), fetchStarLists(token)]);
      await Promise.all([cache.saveRepos(repos), cache.saveStarLists(starLists)]);
      const lastSyncTime = Date.now();
      set({ repos, starLists, lastSyncTime, isSyncing: false });
    } catch (err) {
      set({ error: (err as Error).message, isSyncing: false });
    }
  },

  unstar: async (token: string, nameWithOwner: string) => {
    try {
      await unstarRepo(token, nameWithOwner);
      const repos = get().repos.filter((r) => r.nameWithOwner !== nameWithOwner);
      await cache.saveRepos(repos);
      set({ repos });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  batchUnstar: async (token: string, nameWithOwners: string[]) => {
    set({ error: null });
    for (const name of nameWithOwners) {
      try {
        await unstarRepo(token, name);
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        set({ error: `Failed to unstar ${name}: ${(err as Error).message}` });
        break;
      }
    }
    const repos = get().repos.filter((r) => !nameWithOwners.includes(r.nameWithOwner));
    await cache.saveRepos(repos);
    set({ repos });
  },
}));
