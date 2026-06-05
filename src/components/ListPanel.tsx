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
    <div className="mb-3">
      <div className="flex flex-wrap gap-1.5">
        <Button
          variant={selectedList === null ? "default" : "secondary"}
          size="sm"
          onClick={() => onListSelect(null)}
          className="rounded-md text-xs h-7"
        >
          全部
        </Button>
        {starLists.map((list) => (
          <Button
            key={list.id}
            variant={selectedList === list.name ? "default" : "secondary"}
            size="sm"
            onClick={() => onListSelect(selectedList === list.name ? null : list.name)}
            className="rounded-md text-xs h-7"
          >
            {list.name}
            <Badge variant="secondary" className="ml-1 opacity-60">
              {list.repositories.length}
            </Badge>
          </Button>
        ))}
      </div>
    </div>
  );
}
