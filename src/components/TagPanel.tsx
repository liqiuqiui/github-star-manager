import { useState, useMemo } from "react";
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
    <div className="mb-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onTagSelect(null)}
          className={`text-xs px-2 py-1 rounded-full transition-colors ${
            selectedTag === null
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        {displayTags.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => onTagSelect(selectedTag === name ? null : name)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              selectedTag === name
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {name}
            <span className="ml-1 opacity-60">{count}</span>
          </button>
        ))}
        {tagCounts.length > 20 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs px-2 py-1 rounded-full text-blue-500 hover:bg-blue-50"
          >
            {showAll ? "收起" : `+${tagCounts.length - 20}`}
          </button>
        )}
      </div>
    </div>
  );
}
