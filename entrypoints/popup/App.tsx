import { useState, useEffect, useMemo, useCallback } from "react";
import { useStarStore } from "../../src/stores/starStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { SearchBar } from "../../src/components/SearchBar";
import { StarList } from "../../src/components/StarList";
import { TagPanel } from "../../src/components/TagPanel";
import { BatchActions } from "../../src/components/BatchActions";
import { Settings } from "../../src/components/Settings";

export function App() {
  const {
    repos,
    repoTags,
    isLoading,
    isSyncing,
    lastSyncTime,
    loadFromCache,
    syncFromGitHub,
    batchUnstar,
  } = useStarStore();
  const { token, loadSettings } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSettings().then(() => {
      loadFromCache();
    });
  }, [loadSettings, loadFromCache]);

  const filteredRepos = useMemo(() => {
    let result = repos;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.nameWithOwner.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.topics.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (selectedTag) {
      result = result.filter((r) => repoTags[r.nameWithOwner]?.includes(selectedTag));
    }

    return result;
  }, [repos, searchQuery, selectedTag, repoTags]);

  const handleSelect = useCallback((name: string, selected: boolean) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(name);
      } else {
        next.delete(name);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRepos(new Set(filteredRepos.map((r) => r.nameWithOwner)));
      } else {
        setSelectedRepos(new Set());
      }
    },
    [filteredRepos],
  );

  const handleBatchUnstar = useCallback(async () => {
    if (!token) return;
    setIsProcessing(true);
    await batchUnstar(token, Array.from(selectedRepos));
    setSelectedRepos(new Set());
    setIsProcessing(false);
  }, [token, selectedRepos, batchUnstar]);

  const handleSync = useCallback(async () => {
    if (!token) return;
    await syncFromGitHub(token);
  }, [token, syncFromGitHub]);

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-full min-h-[480px] w-[380px]">
      <header className="flex items-center justify-between p-3 border-b border-gray-200">
        <h1 className="text-sm font-semibold">GitHub Star Manager</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={!token || isSyncing}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSyncing ? "同步中..." : "同步"}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>

      <div className="p-3">
        {!token ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-3">请先配置 GitHub Token</p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              前往设置
            </button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-sm text-gray-500">加载中...</div>
        ) : repos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-3">暂无 Star 数据</p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="text-xs px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSyncing ? "同步中..." : "从 GitHub 同步"}
            </button>
          </div>
        ) : (
          <>
            <SearchBar onSearch={setSearchQuery} />
            <div className="mt-2">
              <TagPanel
                repoTags={repoTags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
              />
            </div>
            <BatchActions
              selectedCount={selectedRepos.size}
              onBatchUnstar={handleBatchUnstar}
              onClearSelection={() => setSelectedRepos(new Set())}
              isProcessing={isProcessing}
            />
            <div className="max-h-[320px] overflow-y-auto">
              <StarList
                repos={filteredRepos}
                selectedRepos={selectedRepos}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
              />
            </div>
            {lastSyncTime && (
              <div className="text-xs text-gray-400 text-center mt-2">
                上次同步：{new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
