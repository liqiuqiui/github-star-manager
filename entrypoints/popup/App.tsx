import { useState, useEffect, useMemo, useCallback } from "react";
import { Settings as SettingsIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../../src/components/ui/button";
import { Checkbox } from "../../src/components/ui/checkbox";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
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
  const [sortField, setSortField] = useState<"starredAt" | "stargazerCount" | "pushedAt" | "name">(
    "starredAt",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [langFilter, setLangFilter] = useState<string>("all");

  useEffect(() => {
    loadSettings().then(() => {
      loadFromCache();
    });
  }, [loadSettings, loadFromCache]);

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    for (const repo of repos) {
      if (repo.primaryLanguage) {
        langSet.add(repo.primaryLanguage.name);
      }
    }
    return Array.from(langSet).sort();
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
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

    if (langFilter && langFilter !== "all") {
      result = result.filter((r) => r.primaryLanguage?.name === langFilter);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "starredAt":
          cmp = new Date(a.starredAt).getTime() - new Date(b.starredAt).getTime();
          break;
        case "stargazerCount":
          cmp = a.stargazerCount - b.stargazerCount;
          break;
        case "pushedAt":
          cmp = new Date(a.pushedAt).getTime() - new Date(b.pushedAt).getTime();
          break;
        case "name":
          cmp = a.nameWithOwner.localeCompare(b.nameWithOwner);
          break;
      }
      return sortDirection === "desc" ? -cmp : cmp;
    });

    return result;
  }, [
    repos,
    searchQuery,
    selectedTag,
    selectedList,
    repoTags,
    starLists,
    langFilter,
    sortField,
    sortDirection,
  ]);

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

  const allSelected =
    filteredAndSortedRepos.length > 0 &&
    filteredAndSortedRepos.every((r) => selectedRepos.has(r.nameWithOwner));

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRepos(new Set(filteredAndSortedRepos.map((r) => r.nameWithOwner)));
      } else {
        setSelectedRepos(new Set());
      }
    },
    [filteredAndSortedRepos],
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
    <div className="app flex flex-col h-full w-full overflow-hidden">
      <header className="app__header flex items-center justify-between px-4 py-3 border-b border-border bg-card">
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

      <div className="app__content flex-1 overflow-hidden flex flex-col p-4">
        {!token ? (
          <div className="app__empty flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">请先配置 GitHub Token</p>
            <Button onClick={() => setShowSettings(true)}>前往设置</Button>
          </div>
        ) : isLoading ? (
          <div className="app__loading flex-1 flex items-center justify-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : repos.length === 0 ? (
          <div className="app__no-data flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">暂无 Star 数据</p>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? "同步中..." : "从 GitHub 同步"}
            </Button>
          </div>
        ) : (
          <>
            <SearchBar onSearch={setSearchQuery} />
            <div className="app__filters mt-2">
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
            <div className="app__toolbar flex items-center gap-2 mb-3">
              <Select
                value={sortField}
                onValueChange={(value) => setSortField(value as typeof sortField)}
              >
                <SelectTrigger className="app__sort-trigger w-[120px] h-8 text-xs">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starredAt">Star 时间</SelectItem>
                  <SelectItem value="stargazerCount">Star 数</SelectItem>
                  <SelectItem value="pushedAt">最近更新</SelectItem>
                  <SelectItem value="name">名称</SelectItem>
                </SelectContent>
              </Select>
              <Select value={langFilter} onValueChange={setLangFilter}>
                <SelectTrigger className="app__lang-trigger w-[140px] h-8 text-xs">
                  <SelectValue placeholder="所有语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有语言</SelectItem>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
                className="app__sort-direction h-8 w-8"
              >
                {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              </Button>
              <span className="app__count text-muted-foreground ml-auto text-xs">
                {filteredAndSortedRepos.length} 个仓库
              </span>
            </div>
            <div className="app__select-all flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
                <Label
                  htmlFor="select-all"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  全选
                </Label>
              </div>
            </div>
            <StarList
              repos={filteredAndSortedRepos}
              selectedRepos={selectedRepos}
              onSelect={handleSelect}
            />
            {lastSyncTime && (
              <div className="app__sync-time text-xs text-muted-foreground text-center mt-2">
                上次同步：{new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
