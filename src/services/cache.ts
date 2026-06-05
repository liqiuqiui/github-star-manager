import type { Repo, RepoTagMap } from "../types";

const DB_NAME = "github-star-manager";
const DB_VERSION = 1;

const STORES = {
  repos: "repos",
  tags: "tags",
  meta: "meta",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.repos)) {
        db.createObjectStore(STORES.repos, { keyPath: "nameWithOwner" });
      }

      if (!db.objectStoreNames.contains(STORES.tags)) {
        db.createObjectStore(STORES.tags, { keyPath: "repoFullName" });
      }

      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStore(
  storeName: string,
  mode: IDBTransactionMode = "readonly",
): Promise<IDBObjectStore> {
  const db = await openDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Repos cache
export async function saveRepos(repos: Repo[]): Promise<void> {
  const store = await getStore(STORES.repos, "readwrite");
  for (const repo of repos) {
    store.put(repo);
  }
  const meta = await getStore(STORES.meta, "readwrite");
  meta.put({ key: "lastSyncTime", value: Date.now() });
}

export async function getRepos(): Promise<Repo[]> {
  const store = await getStore(STORES.repos);
  return requestToPromise(store.getAll());
}

export async function getLastSyncTime(): Promise<number | null> {
  const store = await getStore(STORES.meta);
  const result = await requestToPromise(store.get("lastSyncTime"));
  return result?.value ?? null;
}

export async function clearRepos(): Promise<void> {
  const store = await getStore(STORES.repos, "readwrite");
  store.clear();
}

// Tags cache
export async function saveRepoTags(tagMap: RepoTagMap): Promise<void> {
  const store = await getStore(STORES.tags, "readwrite");
  for (const [repoFullName, tags] of Object.entries(tagMap)) {
    store.put({ repoFullName, tags });
  }
}

export async function getRepoTags(): Promise<RepoTagMap> {
  const store = await getStore(STORES.tags);
  const entries = await requestToPromise(store.getAll());
  const tagMap: RepoTagMap = {};
  for (const entry of entries) {
    tagMap[entry.repoFullName] = entry.tags;
  }
  return tagMap;
}

export async function setRepoTag(repoFullName: string, tagName: string): Promise<void> {
  const store = await getStore(STORES.tags, "readwrite");
  const existing = await requestToPromise(store.get(repoFullName));
  const tags = existing?.tags ?? [];
  if (!tags.includes(tagName)) {
    tags.push(tagName);
    store.put({ repoFullName, tags });
  }
}

export async function removeRepoTag(repoFullName: string, tagName: string): Promise<void> {
  const store = await getStore(STORES.tags, "readwrite");
  const existing = await requestToPromise(store.get(repoFullName));
  if (existing) {
    existing.tags = existing.tags.filter((t: string) => t !== tagName);
    store.put(existing);
  }
}

export async function clearTags(): Promise<void> {
  const store = await getStore(STORES.tags, "readwrite");
  store.clear();
}
