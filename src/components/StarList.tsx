import { useRef } from "react";
import { isEmpty } from "lodash-es";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Repo } from "../types";
import { StarCard } from "./StarCard";

interface StarListProps {
  repos: Repo[];
  selectedRepos: Set<string>;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
}

export function StarList({ repos, selectedRepos, onSelect }: StarListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: repos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    gap: 8,
  });

  if (isEmpty(repos)) {
    return (
      <div className="star-list__empty text-center text-muted-foreground py-8 text-sm">
        没有找到匹配的仓库
      </div>
    );
  }

  return (
    <div ref={parentRef} className="star-list__scroll overflow-auto">
      <div
        className="star-list__virtual-container"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const repo = repos[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="star-list__item"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <StarCard
                repo={repo}
                selected={selectedRepos.has(repo.nameWithOwner)}
                onSelect={onSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
