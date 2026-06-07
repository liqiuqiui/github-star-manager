import { useState, useEffect, useMemo, useCallback } from "react";
import { isEmpty, uniq, sortBy, orderBy } from "lodash-es";
import { Settings as SettingsIcon, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStarStore } from "@/stores/starStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useMessageListener } from "@/sidepanel/hooks/useMessageListener";
import { SearchBar } from "./components/SearchBar";
import { StarList } from "./components/StarList";
import { TagPanel } from "./components/TagPanel";
import { ListPanel } from "./components/ListPanel";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  // 监听来自 background 的消息
  useMessageListener(token, isSyncing, syncFromGitHub);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
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
    return sortBy(uniq(repos.filter((r) => r.primaryLanguage).map((r) => r.primaryLanguage!.name)));
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

    result = orderBy(
      result,
      [
        (repo) => {
          switch (sortField) {
            case "starredAt":
              return new Date(repo.starredAt).getTime();
            case "pushedAt":
              return new Date(repo.pushedAt).getTime();
            case "name":
              return repo.nameWithOwner.toLowerCase();
            default:
              return repo[sortField];
          }
        },
      ],
      [sortDirection],
    );

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
    !isEmpty(filteredAndSortedRepos) &&
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

  return (
    <div className="app flex flex-col h-full w-full overflow-hidden relative">
      {/* 全局同步遮罩 */}
      {isSyncing && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">{t("app.syncMessage")}</p>
        </div>
      )}
      <header className="app__header flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-sm font-semibold text-foreground">{t("app.title")}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSync} disabled={!token || isSyncing} className="h-8">
            {isSyncing ? t("app.syncing") : t("app.sync")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="h-8 w-8"
          >
            <SettingsIcon size={16} />
          </Button>
        </div>
      </header>

      <div className="app__content flex-1 overflow-hidden flex flex-col p-4">
        {!token ? (
          <div className="app__empty flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">{t("app.noToken")}</p>
            <Button onClick={() => navigate("/settings")}>{t("app.goToSettings")}</Button>
          </div>
        ) : isLoading ? (
          <div className="app__loading flex-1 flex items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : isEmpty(repos) ? (
          <div className="app__no-data flex-1 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">{t("app.noData")}</p>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? t("app.syncing") : t("app.syncFromGitHub")}
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
            <div className="app__toolbar flex items-center gap-2 mb-3">
              <Select
                value={sortField}
                onValueChange={(value) => setSortField(value as typeof sortField)}
              >
                <SelectTrigger className="app__sort-trigger w-[120px] h-8 text-xs">
                  <SelectValue placeholder={t("app.sortPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starredAt">{t("app.sortByStarTime")}</SelectItem>
                  <SelectItem value="stargazerCount">{t("app.sortByStarCount")}</SelectItem>
                  <SelectItem value="pushedAt">{t("app.sortByLastUpdate")}</SelectItem>
                  <SelectItem value="name">{t("app.sortByName")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={langFilter} onValueChange={setLangFilter}>
                <SelectTrigger className="app__lang-trigger w-[140px] h-8 text-xs">
                  <SelectValue placeholder={t("app.allLanguages")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("app.allLanguages")}</SelectItem>
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
              <div className="flex items-center gap-2 ml-auto">
                {selectedRepos.size > 0 ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      {t("app.selected")} <Badge variant="secondary">{selectedRepos.size}</Badge>{" "}
                      {t("app.selectedUnit")}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 h-7 text-xs"
                        >
                          {t("app.batchUnstar")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("app.batchUnstar")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("app.batchUnstarConfirm", { count: selectedRepos.size })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBatchUnstar}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isProcessing ? t("common.processing") : t("common.confirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRepos(new Set())}
                      disabled={isProcessing}
                      className="text-muted-foreground h-7 text-xs"
                    >
                      {t("common.clear")}
                    </Button>
                  </>
                ) : (
                  <span className="app__count text-muted-foreground text-xs">
                    {filteredAndSortedRepos.length} {t("app.repoCount")}
                  </span>
                )}
              </div>
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
                  {t("app.selectAll")}
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
                {t("app.lastSync")}
                {new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
