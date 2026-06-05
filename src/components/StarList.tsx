import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { Repo } from "../types";
import { StarCard } from "./StarCard";

interface StarListProps {
  repos: Repo[];
  selectedRepos: Set<string>;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

type SortField = "starredAt" | "stargazerCount" | "pushedAt" | "name";
type SortDirection = "asc" | "desc";

const selectClass =
  "border border-gray-200 rounded-md px-2.5 py-1.5 text-xs bg-white text-gray-600 focus:outline-none focus:border-gray-400";

export function StarList({ repos, selectedRepos, onSelect, onSelectAll }: StarListProps) {
  const [sortField, setSortField] = useState<SortField>("starredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [langFilter, setLangFilter] = useState<string>("");

  const languages = useMemo(() => {
    const langSet = new Set<string>();
    for (const repo of repos) {
      if (repo.primaryLanguage) {
        langSet.add(repo.primaryLanguage.name);
      }
    }
    return Array.from(langSet).sort();
  }, [repos]);

  const filteredAndSorted = useMemo(() => {
    let result = repos;

    if (langFilter) {
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
  }, [repos, sortField, sortDirection, langFilter]);

  const allSelected =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((r) => selectedRepos.has(r.nameWithOwner));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-xs">
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className={selectClass}
        >
          <option value="starredAt">Star 时间</option>
          <option value="stargazerCount">Star 数</option>
          <option value="pushedAt">最近更新</option>
          <option value="name">名称</option>
        </select>
        <button
          onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
          className="border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-500 hover:bg-gray-50 transition-colors"
        >
          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </button>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">所有语言</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <span className="text-gray-400 ml-auto">{filteredAndSorted.length} 个仓库</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded"
          />
          全选
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {filteredAndSorted.map((repo) => (
          <StarCard
            key={repo.nameWithOwner}
            repo={repo}
            selected={selectedRepos.has(repo.nameWithOwner)}
            onSelect={onSelect}
          />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center text-gray-400 py-8 text-sm">没有找到匹配的仓库</div>
      )}
    </div>
  );
}
