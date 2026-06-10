import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getDueLabel, getPaidAmount, getTransactionStatus, type TransactionStatus } from '@/utils/financialUtils';

interface TransactionRowProps {
  transaction: FinancialTransactionResponse;
  onPay: (t: FinancialTransactionResponse) => void;
  onEdit: (t: FinancialTransactionResponse) => void;
  onDelete: (t: FinancialTransactionResponse) => void;
  onRemovePayment: (t: FinancialTransactionResponse, paymentId: string) => void;
}

function StatusBadge({ status, paidRatio }: { status: TransactionStatus; paidRatio: number }) {
  const styles: Record<TransactionStatus, { label: string; className: string }> = {
    received: { label: 'RECEBIDO', className: 'bg-[var(--chart-2)]/15 text-[var(--chart-2)]' },
    paid: { label: 'PAGA', className: 'bg-[var(--chart-2)]/15 text-[var(--chart-2)]' },
    pending: { label: 'PENDENTE', className: 'bg-muted text-muted-foreground' },
    partial: {
      label: `PARCIAL · ${Math.round(paidRatio * 100)}%`,
      className: 'bg-honey-400/20 text-honey-700 dark:text-honey-400',
    },
    overdue: { label: 'VENCIDA', className: 'bg-destructive/10 text-destructive' },
  };
  const s = styles[status];
  return (
    <span className={`font-ui font-bold tracking-[0.4px] rounded-full px-2 py-0.5 text-[10px] ${s.className}`}>
      {s.label}
    </span>
  );
}

/** Linha de transação: ícone, descrição, status, valor; expande para detalhes/pagamentos. */
export function TransactionRow({ transaction: t, onPay, onEdit, onDelete, onRemovePayment }: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const isIncome = t.transactionType === TransactionType.Income;
  const status = getTransactionStatus(t);
  const paidRatio = Number(t.value) > 0 ? getPaidAmount(t) / Number(t.value) : 0;
  const canPay = !isIncome && !t.isPaid;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}
        className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-muted/50 transition-colors duration-[length:var(--dur-base)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isIncome ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)' : 'color-mix(in srgb, var(--destructive) 10%, transparent)',
            color: isIncome ? 'var(--chart-2)' : 'var(--destructive)',
          }}
        >
          {isIncome ? <ArrowUpRight size={17} strokeWidth={1.8} /> : <ArrowDownRight size={17} strokeWidth={1.8} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-ui text-sm font-semibold text-foreground truncate">{t.description}</p>
          <p className="font-ui text-xs text-muted-foreground truncate">
            {t.categoryName} · {t.responsibleUserName}
            {!t.isPaid && ` · ${getDueLabel(String(t.dueDate))}`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="font-ui text-sm font-bold"
            style={{ color: isIncome ? 'var(--chart-2)' : 'var(--destructive)' }}
          >
            {isIncome ? '+' : '−'} {formatCurrency(Number(t.value))}
          </span>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={status} paidRatio={paidRatio} />
            {canPay && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onPay(t); }}
                className="font-ui text-[10px] font-bold text-primary border border-primary/30 rounded-full px-2 py-0.5 hover:bg-primary/10 transition-colors"
              >
                ✓ Pagar
              </button>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Mais ações"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(t)}>
              <Pencil size={14} className="mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(t)} className="text-destructive focus:text-destructive">
              <Trash2 size={14} className="mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="px-4 pb-4 pt-1 flex flex-col gap-2 font-ui text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>Data: {new Date(String(t.transactionDate)).toLocaleDateString('pt-BR')}</span>
                <span>Vencimento: {new Date(String(t.dueDate)).toLocaleDateString('pt-BR')}</span>
                {t.originName && <span>Origem: {t.originName}</span>}
              </div>
              {t.observation && <p>Obs.: {t.observation}</p>}
              {t.payments.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="font-semibold text-foreground">Pagamentos</span>
                  {t.payments.map(p => (
                    <div key={p.financialTransactionPaymentId} className="flex items-center justify-between gap-2">
                      <span>
                        {new Date(String(p.paymentDate)).toLocaleDateString('pt-BR')} · {p.methodName ?? 'Outro'} · {p.paidByUserFullName}
                      </span>
                      <span className="flex items-center gap-2">
                        <b className="text-foreground">{formatCurrency(Number(p.amount))}</b>
                        <button
                          type="button"
                          onClick={() => onRemovePayment(t, p.financialTransactionPaymentId)}
                          className="text-destructive hover:underline"
                        >
                          Estornar
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
