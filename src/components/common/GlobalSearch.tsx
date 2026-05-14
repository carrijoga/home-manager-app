import { Search, X } from "lucide-react";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { ModuleId } from "@/types";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  module: ModuleId;
  moduleLabel: string;
}

interface GlobalSearchProps {
  onSearch?: (query: string) => SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
}

/**
 * Componente de busca global com atalho de teclado (Ctrl/Cmd + K)
 */
const GlobalSearch: FC<GlobalSearchProps> = ({
  onSearch,
  onResultClick,
  placeholder = "Buscar... (Ctrl + K)",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Atalho de teclado Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Buscar quando o query mudar - com debounce de 300ms
  useEffect(() => {
    // Limpa o timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim()) {
      // Configura novo timer de debounce
      debounceTimerRef.current = setTimeout(() => {
        if (onSearch) {
          const searchResults = onSearch(query);
          setResults(searchResults);
          setSelectedIndex(0);
        }
      }, 300);
    } else {
      setResults([]);
    }

    // Cleanup do timer quando o componente desmontar
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelectedIndex(0);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-2 rounded-lg border transition-all duration-200",
            "bg-background dark:bg-card",
            "border-border",
            "text-foreground",
            "placeholder-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "focus:border-transparent"
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Resultados da busca */}
      {isOpen && query && results.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown de resultados */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover rounded-lg shadow-lg border border-border max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border last:border-b-0 transition-colors",
                  "hover:bg-accent",
                  index === selectedIndex && "bg-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
                    {result.moduleLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Mensagem de sem resultados */}
      {isOpen && query && results.length === 0 && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover rounded-lg shadow-lg border border-border p-4">
            <p className="text-sm text-center text-muted-foreground">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
