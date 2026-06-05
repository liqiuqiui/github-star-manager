import { Star } from "lucide-react";
import { cn } from "../lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import type { Repo } from "../types";

interface StarCardProps {
  repo: Repo;
  selected: boolean;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
}

export function StarCard({ repo, selected, onSelect }: StarCardProps) {
  return (
    <div
      className={cn(
        "border rounded-lg px-3 py-2.5 transition-colors",
        selected
          ? "border-primary bg-muted"
          : "border-border hover:border-muted-foreground/50 bg-card",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(repo.nameWithOwner, checked as boolean)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:text-muted-foreground truncate"
            >
              {repo.nameWithOwner}
            </a>
            {repo.isArchived && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                Archived
              </Badge>
            )}
          </div>
          {repo.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
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
              <Star size={11} className="text-muted-foreground/50" fill="currentColor" />
              {repo.stargazerCount.toLocaleString()}
            </span>
            <span>{new Date(repo.starredAt).toLocaleDateString()}</span>
          </div>
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {repo.topics.slice(0, 5).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {topic}
                </Badge>
              ))}
              {repo.topics.length > 5 && (
                <span className="text-[10px] text-muted-foreground/50">
                  +{repo.topics.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
