import clsx from "clsx";
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
        <button
          onClick={() => onListSelect(null)}
          className={clsx(
            "text-xs px-2 py-1 rounded transition-colors",
            selectedList === null
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200",
          )}
        >
          全部
        </button>
        {starLists.map((list) => (
          <button
            key={list.id}
            onClick={() => onListSelect(selectedList === list.name ? null : list.name)}
            className={clsx(
              "text-xs px-2 py-1 rounded transition-colors",
              selectedList === list.name
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            {list.name}
            <span className="ml-1 opacity-60">{list.repositories.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
