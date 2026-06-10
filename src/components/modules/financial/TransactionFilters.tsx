import { Search } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';

export interface TransactionFiltersState {
  type: 'all' | 'expense' | 'income';
  status: 'all' | 'unpaid' | 'overdue';
  search: string;
  categoryId: string | null;
}

export const DEFAULT_FILTERS: TransactionFiltersState = {
  type: 'all',
  status: 'all',
  search: '',
  categoryId: null,
};

interface TransactionFiltersProps {
  value: TransactionFiltersState;
  onChange: (value: TransactionFiltersState) => void;
  categories: CategoryResponse[];
}

const ALL_CATEGORIES = '__all__';

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-ui text-xs font-semibold rounded-full px-3 py-1.5 transition-colors duration-[length:var(--dur-base)] ${
        active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Pills de tipo/status + busca + categoria.
 * "Todas" zera apenas tipo e status — busca e categoria são preservadas de propósito.
 */
export function TransactionFilters({ value, onChange, categories }: TransactionFiltersProps) {
  const isAll = value.type === 'all' && value.status === 'all';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill active={isAll} label="Todas" onClick={() => onChange({ ...value, type: 'all', status: 'all' })} />
        <Pill
          active={value.type === 'expense'}
          label="Despesas"
          onClick={() => onChange({ ...value, type: value.type === 'expense' ? 'all' : 'expense' })}
        />
        <Pill
          active={value.type === 'income'}
          label="Receitas"
          onClick={() => onChange({ ...value, type: value.type === 'income' ? 'all' : 'income' })}
        />
        <Pill
          active={value.status === 'unpaid'}
          label="A pagar"
          onClick={() => onChange({ ...value, status: value.status === 'unpaid' ? 'all' : 'unpaid' })}
        />
        <Pill
          active={value.status === 'overdue'}
          label="Vencidas"
          onClick={() => onChange({ ...value, status: value.status === 'overdue' ? 'all' : 'overdue' })}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={value.search}
            onChange={e => onChange({ ...value, search: e.target.value })}
            placeholder="Buscar transação…"
            aria-label="Buscar transação"
            className="w-full font-ui text-sm bg-card border border-border rounded-full pl-9 pr-4 py-2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          value={value.categoryId ?? ALL_CATEGORIES}
          onValueChange={v => onChange({ ...value, categoryId: v === ALL_CATEGORIES ? null : v })}
        >
          <SelectTrigger className="w-[150px] rounded-full font-ui text-sm" aria-label="Filtrar por categoria">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Todas categorias</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.categoryId} value={c.categoryId}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
