import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { StarList } from "../types";

interface ListPanelProps {
  starLists: StarList[];
  selectedList: string | null;
  onListSelect: (listName: string | null) => void;
}

export function ListPanel({ starLists, selectedList, onListSelect }: ListPanelProps) {
  if (starLists.length === 0) {
    return null;
  }

  return (
    <div className="list-panel mb-3">
      <div className="list-panel__list flex flex-wrap gap-1.5">
        <Button
          variant={selectedList === null ? "default" : "secondary"}
          size="sm"
          onClick={() => onListSelect(null)}
          className="list-panel__item rounded-md text-xs h-7"
        >
          全部
        </Button>
        {starLists.map((list) => (
          <Button
            key={list.id}
            variant={selectedList === list.name ? "default" : "secondary"}
            size="sm"
            onClick={() => onListSelect(selectedList === list.name ? null : list.name)}
            className="list-panel__item rounded-md text-xs h-7"
          >
            {list.name}
            <Badge variant="secondary" className="list-panel__count ml-1 opacity-60">
              {list.repositories.length}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
