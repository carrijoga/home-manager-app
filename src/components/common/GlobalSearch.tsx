import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
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
const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onSearch,
  onResultClick,
  placeholder = 'Buscar... (Ctrl + K)',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Atalho de teclado Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Buscar quando o query mudar
  useEffect(() => {
    if (query.trim() && onSearch) {
      const searchResults = onSearch(query);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, onSearch]);

  // Navegar pelos resultados com teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      }
    },
    [results, selectedIndex]
  );

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-muted"
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
            'w-full pl-10 pr-10 py-2 rounded-lg border transition-all duration-200',
            'bg-white dark:bg-dark-bg-secondary',
            'border-gray-200 dark:border-dark-border-default',
            'text-gray-900 dark:text-dark-text-primary',
            'placeholder-gray-400 dark:placeholder-dark-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-ninho-500 dark:focus:ring-dark-accent-ninho',
            'focus:border-transparent'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-dark-text-muted dark:hover:text-dark-text-secondary transition-colors"
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
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-dark-bg-elevated rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-dark-border-subtle last:border-b-0 transition-colors',
                  'hover:bg-ninho-50 dark:hover:bg-dark-bg-hover',
                  index === selectedIndex && 'bg-ninho-50 dark:bg-dark-bg-hover'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="text-xs text-gray-600 dark:text-dark-text-secondary truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-dark-text-muted bg-gray-100 dark:bg-dark-bg-secondary px-2 py-1 rounded flex-shrink-0">
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
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-dark-bg-elevated rounded-lg shadow-lg border border-gray-200 dark:border-dark-border-default p-4">
            <p className="text-sm text-center text-gray-500 dark:text-dark-text-muted">
              Nenhum resultado encontrado para "{query}"
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalSearch;
