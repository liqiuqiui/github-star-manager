import type { Repo } from "../types";

interface StarCardProps {
  repo: Repo;
  selected: boolean;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
}

export function StarCard({ repo, selected, onSelect }: StarCardProps) {
  return (
    <div
      className={`border rounded-lg p-3 hover:border-blue-300 transition-colors ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(repo.nameWithOwner, e.target.checked)}
          className="mt-1 cursor-pointer"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline truncate"
            >
              {repo.nameWithOwner}
            </a>
            {repo.isArchived && (
              <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                Archived
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {repo.primaryLanguage && (
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: repo.primaryLanguage.color }}
                />
                {repo.primaryLanguage.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {repo.stargazerCount.toLocaleString()}
            </span>
            <span>{new Date(repo.starredAt).toLocaleDateString()}</span>
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 5 && (
                <span className="text-xs text-gray-400">+{repo.topics.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
