import { isEmpty } from "lodash-es";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Repo } from "@/types";

interface StarCardProps {
  repo: Repo;
  selected: boolean;
  onSelect: (nameWithOwner: string, selected: boolean) => void;
}

export function StarCard({ repo, selected, onSelect }: StarCardProps) {
  const { t } = useTranslation();
  return (
    <div
      onClick={() => onSelect(repo.nameWithOwner, !selected)}
      className={cn(
        "star-card border rounded-lg px-3 py-2.5 transition-colors cursor-pointer",
        selected
          ? "star-card--selected border-primary bg-muted"
          : "border-border hover:border-muted-foreground/50 bg-card",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="star-card__name text-sm font-medium text-foreground hover:text-muted-foreground truncate"
            >
              {repo.nameWithOwner}
            </a>
            {repo.isArchived && (
              <Badge variant="secondary" className="star-card__archived text-[10px] px-1.5 py-0.5">
                {t("starCard.archived")}
              </Badge>
            )}
          </div>
          {repo.description && (
            <p className="star-card__description text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
          <div className="star-card__meta flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
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
          {!isEmpty(repo.topics) && (
            <div className="star-card__topics flex flex-wrap gap-1 mt-1.5">
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
