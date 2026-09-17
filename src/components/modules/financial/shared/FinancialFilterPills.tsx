import { cn } from '@/lib/utils';

export interface FilterPillItem {
  id: string;
  label: string;
  count?: number;
}

interface FinancialFilterPillsProps {
  items: FilterPillItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FinancialFilterPills({
  items,
  selectedId,
  onSelect,
}: FinancialFilterPillsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer',
              isSelected
                ? 'bg-primary text-primary-foreground font-bold'
                : 'border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
            )}
          >
            <span>{item.label}</span>
            {item.count != null && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
