import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { useApp } from '@/contexts/AppContext';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchResultItem } from '@/services/globalSearchService';
import { NAVIGATION_ITEMS, searchAll } from '@/services/globalSearchService';

export interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onOpenNestManager?: () => void;
}

export function GlobalSearchModal({
  open,
  onOpenChange,
  onOpenProfile,
  onOpenSettings,
  onOpenNestManager,
}: GlobalSearchModalProps) {
  const navigate = useNavigate();
  const { activeNestId } = useApp();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [asyncResults, setAsyncResults] = useState<SearchResultItem[]>([]);

  const debouncedQuery = useDebounce(query, 200);

  // Filtragem instantânea de páginas e atalhos (0ms lag)
  const instantNavResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAVIGATION_ITEMS;
    return NAVIGATION_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [query]);

  // Executar busca assíncrona nos serviços quando o termo com debounce muda
  useEffect(() => {
    if (!open) return;

    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setAsyncResults([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    searchAll(trimmed, activeNestId)
      .then((res) => {
        if (isMounted) {
          setAsyncResults(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Erro na busca global:', err);
        if (isMounted) {
          setAsyncResults([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, activeNestId, open]);

  // Resetar estado quando modal abre/fecha
  useEffect(() => {
    if (!open) {
      setQuery('');
      setAsyncResults([]);
      setLoading(false);
    }
  }, [open]);

  const handleSelectResult = (item: SearchResultItem) => {
    onOpenChange(false);

    if (item.actionId) {
      if (item.actionId === 'openProfile') onOpenProfile?.();
      else if (item.actionId === 'openSettings') onOpenSettings?.();
      else if (item.actionId === 'openNestManager') onOpenNestManager?.();
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  // Combinar atalhos de páginas (instantâneos) com resultados assíncronos
  const combinedResults = useMemo(() => {
    if (!query.trim()) return NAVIGATION_ITEMS;
    const map = new Map<string, SearchResultItem>();
    instantNavResults.forEach((item) => map.set(item.id, item));
    asyncResults.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, [query, instantNavResults, asyncResults]);

  // Agrupar por categoria
  const groups = useMemo(() => {
    return Array.from(new Set(combinedResults.map((r) => r.group)));
  }, [combinedResults]);

  const hasSearch = query.trim().length > 0;
  const showEmptyState = !loading && hasSearch && combinedResults.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Digite o que procura... (ex: tarefas, mercado, conta, despesa)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[380px] p-2">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Buscando dados adicionais no Ninho...</span>
          </div>
        )}

        {showEmptyState && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhum resultado encontrado para &quot;{query}&quot;.
          </div>
        )}

        {groups.map((groupName) => {
          const groupItems = combinedResults.filter((item) => item.group === groupName);
          if (groupItems.length === 0) return null;

          return (
            <CommandGroup key={groupName} heading={groupName}>
              {groupItems.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelectResult(item)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-accent/60"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon size={16} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {item.badge}
                        </Badge>
                      )}
                      {item.path && <CommandShortcut>Ir</CommandShortcut>}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>

      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Navegar:</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono shadow-sm">
            ↑ ↓
          </kbd>
          <span>Selecionar:</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono shadow-sm">
            ↵
          </kbd>
        </div>
        <div className="flex items-center gap-1">
          <span>Fechar:</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono shadow-sm">
            Esc
          </kbd>
        </div>
      </div>
    </CommandDialog>
  );
}

export default GlobalSearchModal;
