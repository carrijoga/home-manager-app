import { Download, RotateCcw, Search, Tag, User, X } from 'lucide-react';
import { useMemo } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import type { CategoryResponse } from '@/schemas/category';
import { TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import type { NestMember } from '@/schemas/nest';
import { calculateFilterCounts } from '@/utils/financialUtils';

export interface TransactionFiltersV2State {
  type: 'all' | 'expense' | 'income';
  status: 'all' | 'unpaid' | 'overdue';
  search: string;
  categoryId: string | null;
  responsibleUserId: string | null;
}

export const DEFAULT_FILTERS_V2: TransactionFiltersV2State = {
  type: 'all',
  status: 'all',
  search: '',
  categoryId: null,
  responsibleUserId: null,
};

interface TransactionFiltersV2Props {
  value: TransactionFiltersV2State;
  onChange: (value: TransactionFiltersV2State) => void;
  categories: CategoryResponse[];
  members: NestMember[];
  monthTransactions: FinancialTransactionResponse[];
  filteredTransactions: FinancialTransactionResponse[];
  monthLabel: string;
}

const ALL_CATEGORIES = '__all__';
const ALL_MEMBERS = '__all__';

function Pill({
  active,
  label,
  count,
  variant = 'default',
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  variant?: 'default' | 'destructive' | 'amber';
  onClick: () => void;
}) {
  const badgeColors = {
    default: active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
    destructive: active ? 'bg-white/20 text-white' : 'bg-destructive/15 text-destructive',
    amber: active ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`font-ui inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
        active
          ? variant === 'destructive'
            ? 'bg-destructive text-destructive-foreground shadow-xs ring-2 ring-destructive/30'
            : variant === 'amber'
              ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30'
              : 'bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/30 hover:brightness-105'
          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${badgeColors[variant]}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Exporta os lançamentos atuais (já filtrados) para arquivo CSV no navegador.
 */
function exportToCSV(transactions: FinancialTransactionResponse[], monthLabel: string) {
  if (transactions.length === 0) return;

  const headers = [
    'Data',
    'Tipo',
    'Descrição',
    'Categoria',
    'Responsável',
    'Valor (R$)',
    'Status',
    'Vencimento',
    'Origem',
    'Observação',
  ];
  const rows = transactions.map((t) => [
    `"${t.transactionDate.slice(0, 10)}"`,
    `"${t.transactionType === TransactionType.Income ? 'Receita' : 'Despesa'}"`,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.categoryName || ''}"`,
    `"${t.responsibleUserName || ''}"`,
    `"${Number(t.value).toFixed(2).replace('.', ',')}"`,
    `"${t.paymentStatus === 2 ? 'Pago' : t.paymentStatus === 1 ? 'Parcial' : 'Em Aberto'}"`,
    `"${t.dueDate ? t.dueDate.slice(0, 10) : ''}"`,
    `"${t.originName || ''}"`,
    `"${(t.observation || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `extrato_financeiro_${monthLabel.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function TransactionFiltersV2({
  value,
  onChange,
  categories,
  members,
  monthTransactions,
  filteredTransactions,
  monthLabel,
}: TransactionFiltersV2Props) {
  const counts = useMemo(() => calculateFilterCounts(monthTransactions), [monthTransactions]);

  const activeCount =
    (value.type !== 'all' ? 1 : 0) +
    (value.status !== 'all' ? 1 : 0) +
    (value.search.trim() ? 1 : 0) +
    (value.categoryId !== null ? 1 : 0) +
    (value.responsibleUserId !== null ? 1 : 0);

  const isAll = value.type === 'all' && value.status === 'all';

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-card p-4.5 shadow-xs">
      {/* Linha 1: Pills de Tipo/Status + Limpar + Exportar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill
            active={isAll}
            label="Todas"
            count={counts.total}
            onClick={() => onChange({ ...value, type: 'all', status: 'all' })}
          />
          <Pill
            active={value.type === 'expense'}
            label="Despesas"
            count={counts.expense}
            onClick={() =>
              onChange({ ...value, type: value.type === 'expense' ? 'all' : 'expense' })
            }
          />
          <Pill
            active={value.type === 'income'}
            label="Receitas"
            count={counts.income}
            onClick={() => onChange({ ...value, type: value.type === 'income' ? 'all' : 'income' })}
          />
          <Pill
            active={value.status === 'unpaid'}
            label="A pagar"
            count={counts.unpaid}
            variant="amber"
            onClick={() =>
              onChange({ ...value, status: value.status === 'unpaid' ? 'all' : 'unpaid' })
            }
          />
          {counts.overdue > 0 && (
            <Pill
              active={value.status === 'overdue'}
              label="Vencidas"
              count={counts.overdue}
              variant="destructive"
              onClick={() =>
                onChange({ ...value, status: value.status === 'overdue' ? 'all' : 'overdue' })
              }
            />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange(DEFAULT_FILTERS_V2)}
              className="font-ui flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive/20 active:scale-95"
            >
              <RotateCcw size={12} /> Limpar ({activeCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => exportToCSV(filteredTransactions, monthLabel)}
            title="Exportar lançamentos para planilha CSV"
            className="font-ui flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/80 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
          >
            <Download size={13} className="text-primary" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Linha 2: Busca + Dropdowns de Categoria e Morador */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="relative">
          <Search
            size={15}
            strokeWidth={2}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Buscar por descrição…"
            aria-label="Buscar por descrição"
            className="font-ui w-full rounded-2xl border border-border/80 bg-muted/30 py-2.5 pl-9 pr-8 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          {value.search && (
            <button
              type="button"
              onClick={() => onChange({ ...value, search: '' })}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <Select
          value={value.categoryId ?? ALL_CATEGORIES}
          onValueChange={(v) => onChange({ ...value, categoryId: v === ALL_CATEGORIES ? null : v })}
        >
          <SelectTrigger className="font-ui h-auto w-full rounded-2xl border-border/80 bg-muted/30 py-2.5 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Tag size={13} className="shrink-0 text-primary/70" />
              <SelectValue placeholder="Todas as categorias" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.categoryId} value={c.categoryId}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {members.length > 0 && (
          <Select
            value={value.responsibleUserId ?? ALL_MEMBERS}
            onValueChange={(v) =>
              onChange({ ...value, responsibleUserId: v === ALL_MEMBERS ? null : v })
            }
          >
            <SelectTrigger className="font-ui h-auto w-full rounded-2xl border-border/80 bg-muted/30 py-2.5 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <User size={13} className="shrink-0 text-primary/70" />
                <SelectValue placeholder="Todos os moradores" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MEMBERS}>Todos os moradores</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

