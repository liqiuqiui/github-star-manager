import { useState, useMemo } from "react";
import { isEmpty, groupBy, sortBy, flatten } from "lodash-es";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { RepoTagMap } from "../types";

interface TagPanelProps {
  repoTags: RepoTagMap;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function TagPanel({ repoTags, selectedTag, onTagSelect }: TagPanelProps) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const tagCounts = useMemo(() => {
    const allTags = flatten(Object.values(repoTags));
    const grouped = groupBy(allTags);
    return sortBy(
      Object.entries(grouped).map(([name, occurrences]) => ({
        name,
        count: occurrences.length,
      })),
      [(item) => -item.count],
    );
  }, [repoTags]);

  const displayTags = showAll ? tagCounts : tagCounts.slice(0, 20);

  if (isEmpty(tagCounts)) {
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
          {t("common.all")}
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
            {showAll ? t("tagPanel.collapse") : `+${tagCounts.length - 20}`}
          </Button>
        )}
      </div>
    </div>
  );
}
