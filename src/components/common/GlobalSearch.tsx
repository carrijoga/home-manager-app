import { Search, X } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { ModuleId } from '@/types';

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
  placeholder = 'Buscar... (Ctrl + K)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Atalho de teclado Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    setQuery('');
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  return (
    <div className="relative max-w-md flex-1">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-muted-foreground"
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
            'w-full rounded-lg border py-2 pl-10 pr-10 transition-all duration-200',
            'bg-background dark:bg-card',
            'border-border',
            'text-foreground',
            'placeholder-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'focus:border-transparent'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground transition-colors hover:text-foreground"
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown de resultados */}
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={cn(
                  'w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0',
                  'hover:bg-accent',
                  index === selectedIndex && 'bg-accent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
                    {result.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
                    )}
                  </div>
                  <span className="flex-shrink-0 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-border bg-popover p-4 shadow-lg">
            <p className="text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
