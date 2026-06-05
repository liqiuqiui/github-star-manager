import { Star } from "lucide-react";
import clsx from "clsx";
import type { Repo } from "../types";

interface StarCardProps {
  repo: Repo;
  selected: boolean;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
}

export function StarCard({ repo, selected, onSelect }: StarCardProps) {
  return (
    <div
      className={clsx(
        "border rounded-lg px-3 py-2.5 transition-colors",
        selected ? "border-gray-800 bg-gray-50" : "border-gray-150 hover:border-gray-300 bg-white",
      )}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(repo.nameWithOwner, e.target.checked)}
          className="mt-1 cursor-pointer rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-800 hover:text-gray-600 truncate"
            >
              {repo.nameWithOwner}
            </a>
            {repo.isArchived && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                Archived
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
            {repo.primaryLanguage && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: repo.primaryLanguage.color }}
                />
                {repo.primaryLanguage.name}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Star size={11} className="text-gray-300" fill="currentColor" />
              {repo.stargazerCount.toLocaleString()}
            </span>
            <span>{new Date(repo.starredAt).toLocaleDateString()}</span>
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 5 && (
                <span className="text-[10px] text-gray-300">+{repo.topics.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
