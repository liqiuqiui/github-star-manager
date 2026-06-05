import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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

export function StarList({ repos, selectedRepos, onSelect, onSelectAll }: StarListProps) {
  const [sortField, setSortField] = useState<SortField>("starredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [langFilter, setLangFilter] = useState<string>("all");

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
  }, [repos, sortField, sortDirection, langFilter]);

  const allSelected =
    filteredAndSorted.length > 0 &&
    filteredAndSorted.every((r) => selectedRepos.has(r.nameWithOwner));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="starredAt">Star 时间</SelectItem>
            <SelectItem value="stargazerCount">Star 数</SelectItem>
            <SelectItem value="pushedAt">最近更新</SelectItem>
            <SelectItem value="name">名称</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
          className="h-8 w-8"
        >
          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </Button>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
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
        <span className="text-muted-foreground ml-auto text-xs">
          {filteredAndSorted.length} 个仓库
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          />
          <Label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer">
            全选
          </Label>
        </div>
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
        <div className="text-center text-muted-foreground py-8 text-sm">没有找到匹配的仓库</div>
      )}
    </div>
  );
}
