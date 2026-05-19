import { formatCurrency } from '@utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
  Tag,
} from 'lucide-react';

import type { AppShoppingList } from '@/types';

interface DetailHeaderProps {
  detailData: AppShoppingList | null;
  totalEstimated: number;
  totalSpent: number;
  remaining: number;
  onBack: () => void;
}

export function DetailHeader(props: DetailHeaderProps) {
  const {
    detailData,
    totalEstimated,
    totalSpent,
    remaining,
    onBack,
  } = props;

  return (
    <div className="flex flex-col gap-4">
      {/* Left: title area */}
      <div className="space-y-1">
        {/* Module context pill */}
        <div className="border-border/40 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1">
          <div className="h-2 w-2 rounded-full" style={{ background: '#ffcad9' }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: '#ffcad9' }}
          >
            Lista de Compras
          </span>
        </div>

        {/* Back + list name */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onBack}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Voltar para listas"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {detailData?.name ?? '...'}
          </h1>
        </div>

        {/* Date */}
        {detailData && (
          <p className="flex items-center gap-1.5 pl-9 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <ShoppingCart size={11} />
            {new Date(detailData.monthYear).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </p>
        )}
      </div>

      {/* Right: summary bento cards */}
      {detailData && (
        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
          {/* Estimado */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
            <div
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
              style={{ background: 'rgba(216,226,255,0.1)' }}
            >
              <Tag size={16} style={{ color: '#adc6ff' }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                Estimado
              </p>
              <p className="text-sm font-semibold text-foreground sm:text-lg">
                {totalEstimated > 0 ? formatCurrency(totalEstimated) : '—'}
              </p>
            </div>
          </div>

          {/* Pago até agora */}
          <div
            className="relative flex items-center gap-2 overflow-hidden rounded-2xl border-l-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4"
            style={{
              borderColor: '#78dc77',
              background: 'rgba(120,220,119,0.05)',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(120,220,119,0.06)] to-transparent" />
            <div
              className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card sm:flex"
              style={{ background: 'rgba(148,249,144,0.1)' }}
            >
              <CheckCircle2 size={16} style={{ color: '#78dc77' }} />
            </div>
            <div className="relative min-w-0">
              <p
                className="truncate text-[9px] font-medium uppercase tracking-widest sm:text-[10px]"
                style={{ color: '#78dc77' }}
              >
                Pago
              </p>
              <p className="text-sm font-semibold sm:text-lg" style={{ color: '#78dc77' }}>
                {totalSpent > 0 ? formatCurrency(totalSpent) : '—'}
              </p>
            </div>
          </div>

          {/* Restante */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
            <div
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full sm:flex"
              style={{ background: 'rgba(197,184,255,0.1)' }}
            >
              <ShoppingCart size={16} style={{ color: '#c5b8ff' }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[10px]">
                Restante
              </p>
              <p className="text-sm font-semibold sm:text-lg" style={{ color: '#c5b8ff' }}>
                {totalEstimated > 0 ? formatCurrency(remaining) : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
