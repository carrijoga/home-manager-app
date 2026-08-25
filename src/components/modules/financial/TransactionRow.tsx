import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import type { CheckIconHandle } from '@/components/ui/animated-icons/check';
import { CheckIcon } from '@/components/ui/animated-icons/check';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import {
  getDueLabel,
  getPaidAmount,
  getTransactionStatus,
  type TransactionStatus,
} from '@/utils/financialUtils';

/** Formata só a parte de data em horário local — evita off-by-one com sufixo Z/offset. */
function formatLocalDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');
}

interface TransactionRowProps {
  transaction: FinancialTransactionResponse;
  onPay: (t: FinancialTransactionResponse) => void;
  onEdit: (t: FinancialTransactionResponse) => void;
  onDelete: (t: FinancialTransactionResponse) => void;
  onRemovePayment: (t: FinancialTransactionResponse, paymentId: string) => void;
  sourceNameById: Map<string, string>;
}

function StatusBadge({
  status,
  paidRatio,
  isIncome,
}: {
  status: TransactionStatus;
  paidRatio: number;
  isIncome: boolean;
}) {
  const styles: Record<TransactionStatus, { label: string; className: string }> = {
    paid: { label: isIncome ? 'RECEBIDO' : 'PAGA', className: 'bg-chart-2/15 text-chart-2' },
    open: { label: 'EM ABERTO', className: 'bg-muted text-muted-foreground' },
    partiallyPaid: {
      label: `PARCIAL · ${Math.round(paidRatio * 100)}%`,
      className: 'bg-honey-400/20 text-honey-700 dark:text-honey-400',
    },
  };
  const s = styles[status];
  return (
    <span
      className={`font-ui rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] ${s.className}`}
    >
      {s.label}
    </span>
  );
}

/** Linha de transação: ícone, descrição, status, valor; expande para detalhes/pagamentos. */
export function TransactionRow({
  transaction: t,
  onPay,
  onEdit,
  onDelete,
  onRemovePayment,
  sourceNameById,
}: TransactionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const payIconRef = useRef<CheckIconHandle>(null);

  const isIncome = t.transactionType === TransactionType.Income;
  const status = getTransactionStatus(t);
  const paidRatio = Number(t.value) > 0 ? getPaidAmount(t) / Number(t.value) : 0;
  const canPay = !isIncome && t.paymentStatus !== PaymentStatus.Paid;
  // Backend bloqueia edição de transação com pagamentos vinculados.
  const canEdit = t.payments.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        className="duration-[length:var(--dur-base)] flex cursor-pointer items-center gap-3 p-3.5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: isIncome
              ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)'
              : 'color-mix(in srgb, var(--destructive) 10%, transparent)',
            color: isIncome ? 'var(--chart-2)' : 'var(--destructive)',
          }}
        >
          {isIncome ? (
            <ArrowUpRight size={17} strokeWidth={1.8} />
          ) : (
            <ArrowDownRight size={17} strokeWidth={1.8} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-ui truncate text-sm font-semibold text-foreground">{t.description}</p>
          <p className="font-ui truncate text-xs text-muted-foreground">
            {t.categoryName} · {t.responsibleUserName}
            {t.paymentStatus !== PaymentStatus.Paid && t.dueDate && (
              <span className={t.isOverdue ? 'font-semibold text-destructive' : undefined}>
                {' '}
                · {getDueLabel(String(t.dueDate))}
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="font-ui text-sm font-bold"
            style={{ color: isIncome ? 'var(--chart-2)' : 'var(--destructive)' }}
          >
            {isIncome ? '+' : '−'} {formatCurrency(Number(t.value))}
          </span>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={status} paidRatio={paidRatio} isIncome={isIncome} />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Mais ações"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(t)}>
                <Pencil size={14} className="mr-2" /> Editar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(t)}
              className="text-destructive focus:text-destructive"
            >
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
            <div className="font-ui flex flex-col gap-2 px-4 pb-4 pt-1 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>Data: {formatLocalDate(String(t.transactionDate))}</span>
                {t.dueDate && <span>Vencimento: {formatLocalDate(String(t.dueDate))}</span>}
                {t.originName && <span>Origem: {t.originName}</span>}
              </div>
              {t.observation && <p>Obs.: {t.observation}</p>}
              {canPay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPay(t);
                  }}
                  onMouseEnter={() => payIconRef.current?.startAnimation()}
                  onMouseLeave={() => payIconRef.current?.stopAnimation()}
                  className="font-ui duration-[length:var(--dur-base)] flex items-center gap-1.5 self-end rounded-lg border border-chart-2/30 bg-chart-2/10 px-3 py-1.5 text-xs font-bold text-chart-2 transition-colors hover:bg-chart-2/20"
                >
                  <CheckIcon ref={payIconRef} size={14} />
                  Registrar Pagamento
                </button>
              )}
              {t.payments.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  <span className="font-semibold text-foreground">Pagamentos</span>
                  {t.payments.map((p) => (
                    <div
                      key={p.financialTransactionPaymentId}
                      className="flex items-center justify-between gap-2"
                    >
                      <span>
                        {formatLocalDate(String(p.paymentDate))} · {p.methodName ?? 'Outro'}
                        {sourceNameById.get(p.sourceId) &&
                          ` · ${sourceNameById.get(p.sourceId)}`} · {p.paidByUserFullName}
                      </span>
                      <span className="flex items-center gap-2">
                        <b className="text-foreground">{formatCurrency(Number(p.amount))}</b>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => onRemovePayment(t, p.financialTransactionPaymentId)}
                                className="duration-[length:var(--dur-base)] rounded p-0.5 text-destructive/60 transition-colors hover:text-destructive"
                                aria-label="Estornar pagamento"
                              >
                                <RotateCcw size={13} strokeWidth={1.8} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Estornar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
