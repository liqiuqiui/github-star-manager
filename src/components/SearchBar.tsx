import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "搜索 Star 仓库..." }: SearchBarProps) {
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
    <div className="relative flex items-center">
      <Search size={15} className="absolute left-3 text-gray-300" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
