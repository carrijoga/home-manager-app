import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { NotificationModule } from '@/types';

export type NotificationStatusFilter = 'all' | 'unread' | 'actions' | 'files';

interface NotificationFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: NotificationStatusFilter;
  onStatusFilterChange: (status: NotificationStatusFilter) => void;
  moduleFilter: 'all' | NotificationModule;
  onModuleFilterChange: (mod: 'all' | NotificationModule) => void;
  counts: {
    total: number;
    unread: number;
    actions: number;
    files: number;
    byModule: Record<NotificationModule, number>;
  };
}

const MODULE_OPTIONS: { id: 'all' | NotificationModule; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '' },
  { id: 'financial', label: 'Financeiro', icon: '💳' },
  { id: 'shopping', label: 'Compras', icon: '🛒' },
  { id: 'tasks', label: 'Tarefas', icon: '✅' },
  { id: 'calendar', label: 'Calendário', icon: '📅' },
  { id: 'system', label: 'Mural & Sistema', icon: '📢' },
];

export function NotificationFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  moduleFilter,
  onModuleFilterChange,
  counts,
}: NotificationFilterBarProps) {
  const statusOptions: { id: NotificationStatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todas', count: counts.total },
    { id: 'unread', label: 'Não lidas', count: counts.unread },
    { id: 'actions', label: 'Com Ações', count: counts.actions },
    { id: 'files', label: 'Com Arquivos', count: counts.files },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* ── NÍVEL 1: BUSCA + SEGMENTED CONTROL DE STATUS ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrar por título, mensagem ou autor..."
            className="h-10 rounded-2xl border-border/70 bg-card pl-10 pr-8 text-xs sm:text-sm shadow-subtle focus-visible:ring-primary/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Segmented Control de Status */}
        <div className="scrollbar-hide flex gap-1 rounded-2xl bg-muted/50 p-1 overflow-x-auto shrink-0 border border-border/40">
          {statusOptions.map((opt) => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusFilterChange(opt.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-card text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{opt.label}</span>
                {opt.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── NÍVEL 2: PÍLULAS DESLIZANTES POR MÓDULO ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
          Módulo:
        </span>
        {MODULE_OPTIONS.map((opt) => {
          const isSelected = moduleFilter === opt.id;
          const count = opt.id === 'all' ? counts.total : counts.byModule[opt.id] ?? 0;

          // Se a contagem for zero e não for 'all' nem o selecionado, pode ocultar para manter limpo
          if (opt.id !== 'all' && count === 0 && !isSelected) {
            return null;
          }

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onModuleFilterChange(opt.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95',
                isSelected
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'border border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
