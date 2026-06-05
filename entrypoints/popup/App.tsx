import { useState, useEffect, useMemo, useCallback } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Button } from "../../src/components/ui/button";
import { useStarStore } from "../../src/stores/starStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { SearchBar } from "../../src/components/SearchBar";
import { StarList } from "../../src/components/StarList";
import { TagPanel } from "../../src/components/TagPanel";
import { ListPanel } from "../../src/components/ListPanel";
import { BatchActions } from "../../src/components/BatchActions";
import { Settings } from "../../src/components/Settings";

export function App() {
  const {
    repos,
    starLists,
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
  const [selectedList, setSelectedList] = useState<string | null>(null);
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

    if (selectedList) {
      const list = starLists.find((l) => l.name === selectedList);
      if (list) {
        result = result.filter((r) => list.repositories.includes(r.nameWithOwner));
      }
    }

    return result;
  }, [repos, searchQuery, selectedTag, selectedList, repoTags, starLists]);

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
    <div className="flex flex-col h-full min-h-[680px] min-w-[520px] w-full overflow-hidden max-h-100vh">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-sm font-semibold text-foreground">GitHub Star Manager</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSync} disabled={!token || isSyncing} className="h-8">
            {isSyncing ? "同步中..." : "同步"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="h-8 w-8"
          >
            <SettingsIcon size={16} />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {!token ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">请先配置 GitHub Token</p>
            <Button onClick={() => setShowSettings(true)}>前往设置</Button>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : repos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">暂无 Star 数据</p>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? "同步中..." : "从 GitHub 同步"}
            </Button>
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
              <ListPanel
                starLists={starLists}
                selectedList={selectedList}
                onListSelect={setSelectedList}
              />
            </div>
            <BatchActions
              selectedCount={selectedRepos.size}
              onBatchUnstar={handleBatchUnstar}
              onClearSelection={() => setSelectedRepos(new Set())}
              isProcessing={isProcessing}
            />
            <div className="flex-1 overflow-y-auto">
              <StarList
                repos={filteredRepos}
                selectedRepos={selectedRepos}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
              />
            </div>
            {lastSyncTime && (
              <div className="text-xs text-muted-foreground text-center mt-2">
                上次同步：{new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
