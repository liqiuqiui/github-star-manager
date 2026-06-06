import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t("searchBar.placeholder");
  const [query, setQuery] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      onSearch(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="search-bar relative flex items-center">
      <Search size={15} className="search-bar__icon absolute left-3 text-muted-foreground" />
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={defaultPlaceholder}
        className="search-bar__input pl-9 pr-8"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="search-bar__clear absolute right-1 h-8 w-8"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}
