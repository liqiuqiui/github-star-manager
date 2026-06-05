import { useState, useEffect, useMemo, useCallback } from "react";
import { Settings as SettingsIcon } from "lucide-react";
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
    <div className="flex flex-col h-full min-h-[680px] min-w-[520px] w-full">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <h1 className="text-sm font-semibold text-gray-800">GitHub Star Manager</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={!token || isSyncing}
            className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {isSyncing ? "同步中..." : "同步"}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {!token ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-400 mb-4">请先配置 GitHub Token</p>
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              前往设置
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            加载中...
          </div>
        ) : repos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-400 mb-4">暂无 Star 数据</p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="text-sm px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-40 transition-colors"
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
