import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { RepoTagMap } from "../types";

interface TagPanelProps {
  repoTags: RepoTagMap;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagPanel({ repoTags, selectedTag, onTagSelect }: TagPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tags of Object.values(repoTags)) {
      for (const tag of tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [repoTags]);

  const displayTags = showAll ? tagCounts : tagCounts.slice(0, 20);

  if (tagCounts.length === 0) {
    return null;
  }

  return (
    <div className="tag-panel mb-3">
      <div className="tag-panel__list flex flex-wrap gap-1.5">
        <Button
          variant={selectedTag === null ? "default" : "secondary"}
          size="sm"
          onClick={() => onTagSelect(null)}
          className="tag-panel__item rounded-md text-xs h-7"
        >
          全部
        </Button>
        {displayTags.map(({ name, count }) => (
          <Button
            key={name}
            variant={selectedTag === name ? "default" : "secondary"}
            size="sm"
            onClick={() => onTagSelect(selectedTag === name ? null : name)}
            className="tag-panel__item rounded-md text-xs h-7"
          >
            {name}
            <Badge variant="secondary" className="tag-panel__count ml-1 opacity-60">
              {count}
            </Badge>
          </Button>
        ))}
        {tagCounts.length > 20 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="tag-panel__toggle rounded-md text-xs h-7 text-muted-foreground"
          >
            {showAll ? "收起" : `+${tagCounts.length - 20}`}
          </Button>
        )}
      </div>
    </div>
  );
}
