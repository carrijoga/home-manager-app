import { Search } from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';

import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { cn } from '@/lib/utils';

export interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

/**
 * Componente de busca global com atalho de teclado (Ctrl/Cmd + K)
 */
export const GlobalSearch: FC<GlobalSearchProps> = ({
  placeholder = 'Buscar no Ninho… ⌘K',
  className,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex h-10 w-full max-w-md items-center justify-between rounded-full border border-border bg-card px-4 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-accent/40',
          className
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Search size={16} className="shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-normal text-muted-foreground">
            {placeholder}
          </span>
        </div>

        <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </button>

      <GlobalSearchModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default GlobalSearch;
