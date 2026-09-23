import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MoreHorizontal,
  Pencil,
  PieChart,
  RotateCcw,
  ShoppingCart,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AnimatedText,
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
import { formatCategorySummary } from '@/lib/categories';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type { FinancialTransactionResponse } from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import {
  getDueLabel,
  getPaidAmount,
  getTransactionStatus,
  type TransactionStatus,
} from '@/utils/financialUtils';

function formatLocalDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR');
}

interface TransactionRowV2Props {
  transaction: FinancialTransactionResponse;
  onPay: (t: FinancialTransactionResponse) => void;
  onEdit: (t: FinancialTransactionResponse) => void;
  onDelete: (t: FinancialTransactionResponse) => void;
  onRemovePayment: (t: FinancialTransactionResponse, paymentId: string) => void;
  sourceNameById: Map<string, string>;
}

function StatusBadge({
  status,
  isOverdue,
  paidRatio,
  isIncome,
  isTransfer,
}: {
  status: TransactionStatus;
  isOverdue: boolean;
  paidRatio: number;
  isIncome: boolean;
  isTransfer?: boolean;
}) {
  if (isTransfer) {
    return (
      <span className="font-ui inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
        <ArrowLeftRight size={10} strokeWidth={2.2} />
        TRANSFERÊNCIA
      </span>
    );
  }

  if (isOverdue && status !== 'paid') {
    return (
      <span className="font-ui inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/15 px-2.5 py-0.5 text-[10px] font-bold text-destructive">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
        VENCIDA
      </span>
    );
  }

  const styles: Record<
    TransactionStatus,
    { label: string; className: string; icon: typeof CheckCircle2 }
  > = {
    paid: {
      label: isIncome ? 'RECEBIDO' : 'PAGA',
      className: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
      icon: CheckCircle2,
    },
    open: {
      label: 'EM ABERTO',
      className: 'bg-muted/80 text-muted-foreground border-border/60',
      icon: Clock,
    },
    partiallyPaid: {
      label: `PARCIAL · ${Math.round(paidRatio * 100)}%`,
      className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold',
      icon: PieChart,
    },
  };
  const s = styles[status];
  const IconComponent = s.icon;

  return (
    <span
      className={`font-ui inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-[0.3px] ${s.className}`}
    >
      <IconComponent size={10} strokeWidth={2.2} />
      <AnimatedText animation="smooth">{s.label}</AnimatedText>
    </span>
  );
}


/**
 * TransactionRowV2 — Linha de transação V2 (Design Premium Meticuloso).
 * Traz baixas rápidas interativas, micro-animações, chips refinados e drawer de detalhes expandido.
 */
export function TransactionRowV2({
  transaction: t,
  onPay,
  onEdit,
  onDelete,
  onRemovePayment,
  sourceNameById,
}: TransactionRowV2Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const payIconRef = useRef<CheckIconHandle>(null);

  const isTransfer = t.transactionType === TransactionType.Transfer || t.transactionType === 3;
  const isIncome = t.transactionType === TransactionType.Income;
  const isAdjustment =
    !isTransfer &&
    (t.transactionType === TransactionType.Adjustment || t.transactionType === 2);
  const categoryLabel =
    formatCategorySummary(t.category) ?? (isTransfer || isAdjustment ? null : 'Sem categoria');
  const status = getTransactionStatus(t);
  const totalValue = Number(t.value) || 0;
  const paidAmount = getPaidAmount(t);
  const paidRatio = totalValue > 0 ? paidAmount / totalValue : 0;
  const canPay = !isTransfer && !isIncome && !isAdjustment && t.paymentStatus !== PaymentStatus.Paid;
  const canEdit = !isTransfer && !isAdjustment && (t.payments ?? []).length === 0;
  const canDelete = !isTransfer;
  const hasAnyAction = canPay || canEdit || canDelete;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border transition-all duration-200 ${
        expanded
          ? 'border-primary/40 bg-card shadow-sm ring-1 ring-primary/20'
          : 'hover:shadow-2xs border-border/80 bg-card/95 hover:border-border hover:bg-card'
      }`}
    >
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
        className="duration-[length:var(--dur-base)] flex cursor-pointer items-center gap-3.5 p-3.5 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {/* Ícone de entrada / saída / transferência com gradiente suave */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
          style={{
            background: isTransfer
              ? 'color-mix(in srgb, var(--primary) 14%, transparent)'
              : isIncome
                ? 'color-mix(in srgb, var(--chart-2) 16%, transparent)'
                : 'color-mix(in srgb, var(--destructive) 14%, transparent)',
            color: isTransfer
              ? 'var(--primary)'
              : isIncome
                ? 'var(--chart-2)'
                : 'var(--destructive)',
          }}
        >
          {isTransfer ? (
            <ArrowLeftRight size={19} strokeWidth={2.2} />
          ) : isIncome ? (
            <ArrowUpRight size={19} strokeWidth={2.2} />
          ) : (
            <ArrowDownRight size={19} strokeWidth={2.2} />
          )}
        </div>

        {/* Descrição + Categoria + Morador + Data de Vencimento */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-ui truncate text-sm font-semibold tracking-tight text-foreground">
              {t.description}
            </p>
            {t.shoppingListId && (
              <span className="font-ui inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <ShoppingCart size={10} /> Lista de compras
              </span>
            )}
            {t.responsibleUserName && (
              <span className="font-ui hidden shrink-0 items-center gap-1 rounded-full border border-border/40 bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:inline-flex">
                <User size={10} className="text-primary/70" /> {t.responsibleUserName}
              </span>
            )}
          </div>

          <div className="font-ui mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {categoryLabel && (
              <span className="flex min-w-0 items-center gap-1">
                {!t.category && <Tag size={11} className="shrink-0 text-muted-foreground/70" />}
                <span className="truncate">{categoryLabel}</span>
              </span>
            )}

            {t.paymentStatus !== PaymentStatus.Paid && t.dueDate && (
              <span
                className={`flex items-center gap-1 ${t.isOverdue ? 'font-semibold text-destructive' : ''}`}
              >
                · <Calendar size={11} className="shrink-0" /> {getDueLabel(String(t.dueDate))}
              </span>
            )}
          </div>

          {/* Barra de progresso visual para pagamento parcial */}
          {status === 'partiallyPaid' && (
            <div className="mt-2 flex max-w-[220px] items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(paidRatio * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="font-ui shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(paidAmount)} / {formatCurrency(totalValue)}
              </span>
            </div>
          )}
        </div>

        {/* Coluna de Valor + Status Badge */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="font-ui text-sm font-bold tracking-tight sm:text-base"
            style={{
              color: isTransfer
                ? 'var(--foreground)'
                : isIncome
                  ? 'var(--chart-2)'
                  : 'var(--destructive)',
            }}
          >
            {isTransfer ? '' : isIncome ? '+ ' : '− '}
            {formatCurrency(totalValue)}
          </span>
          <StatusBadge
            status={status}
            isOverdue={Boolean(t.isOverdue)}
            paidRatio={paidRatio}
            isIncome={isIncome}
            isTransfer={isTransfer}
          />
        </div>

        {/* Grupo de Ações (Baixa Rápida + Menu de Opções) */}
        {hasAnyAction && (
          <div className="ml-1 flex shrink-0 items-center gap-1.5">
            {canPay && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Dar baixa rápida"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPay(t);
                      }}
                      className="font-ui shadow-2xs flex items-center gap-1 rounded-xl border border-chart-2/30 bg-chart-2/10 px-2.5 py-1 text-xs font-bold text-chart-2 transition-all hover:bg-chart-2/20 active:scale-95"
                    >
                      <Check size={13} strokeWidth={2.8} />
                      <span className="hidden text-[11px] sm:inline">Baixar</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-ui text-xs font-semibold">Registrar pagamento</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Mais ações"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal size={17} strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-ui w-44 text-xs">
                {canPay && (
                  <DropdownMenuItem onClick={() => onPay(t)}>
                    <CheckCircle2 size={14} className="mr-2 text-chart-2" /> Dar Baixa / Pagar
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(t)}>
                    <Pencil size={14} className="mr-2 text-muted-foreground" /> Editar Lançamento
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(t)}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" /> Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Drawer de Detalhes Expandidos (Design Refinado) */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="font-ui flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-4 pb-4 pt-2 text-xs text-muted-foreground">
              {/* Grid de Metadados */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/50 bg-card/80 p-3 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <Calendar size={11} className="text-primary/70" /> Lançamento
                  </span>
                  <span className="font-bold text-foreground">
                    {formatLocalDate(String(t.transactionDate))}
                  </span>
                </div>

                {t.dueDate && (
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Clock size={11} className="text-primary/70" /> Vencimento
                    </span>
                    <span className="font-bold text-foreground">
                      {formatLocalDate(String(t.dueDate))}
                    </span>
                  </div>
                )}

                {t.originName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <CreditCard size={11} className="text-primary/70" /> Origem
                    </span>
                    <span className="truncate font-bold text-foreground">{t.originName}</span>
                  </div>
                )}

                {t.responsibleUserName && (
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <User size={11} className="text-primary/70" /> Responsável
                    </span>
                    <span className="truncate font-bold text-foreground">
                      {t.responsibleUserName}
                    </span>
                  </div>
                )}
              </div>

              {/* Vínculo com Lista de Compras */}
              {t.shoppingListId && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <ShoppingCart size={14} className="text-primary" />
                    <span>Gerada automaticamente a partir de uma Lista de Compras</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/shopping?listId=${t.shoppingListId}`);
                    }}
                    className="font-ui text-xs font-bold text-primary transition-opacity hover:opacity-80 hover:underline"
                  >
                    Ver no módulo de compras →
                  </button>
                </div>
              )}

              {/* Observações */}
              {t.observation && (
                <div className="flex items-start gap-1.5 rounded-xl border border-border/40 bg-card/60 p-2.5 text-foreground/90">
                  <FileText size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs italic leading-relaxed">{t.observation}</p>
                </div>
              )}

              {/* Histórico de Pagamentos */}
              {t.payments.length > 0 && (
                <div className="mt-1 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
                    <CheckCircle2 size={12} className="text-chart-2" /> Histórico de Pagamentos
                    Efetivados:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {t.payments.map((p) => {
                      const originName = p.sourceId ? sourceNameById.get(p.sourceId) : undefined;
                      const methodName = p.methodName || 'Outro';
                      return (
                        <div
                          key={p.financialTransactionPaymentId}
                          className="shadow-2xs flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/60 bg-card p-2.5 sm:flex-nowrap"
                        >
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                            <span className="text-sm font-bold text-chart-2">
                              {formatCurrency(Number(p.amount))}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              em {formatLocalDate(String(p.paymentDate))}
                              {originName ? ` · via ${originName}` : ''}
                            </span>
                            <span className="font-ui inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                              <CreditCard size={10} className="text-muted-foreground/70" />
                              {methodName}
                            </span>
                            {p.paidByUserFullName && (
                              <span className="font-ui inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                <User size={10} className="text-primary/70" />
                                {p.paidByUserFullName}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemovePayment(t, p.financialTransactionPaymentId)}
                            className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <RotateCcw size={12} /> Estornar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botão de Pagamento Completo */}
              {canPay && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPay(t);
                  }}
                  onMouseEnter={() => payIconRef.current?.startAnimation()}
                  onMouseLeave={() => payIconRef.current?.stopAnimation()}
                  className="font-ui duration-[length:var(--dur-base)] shadow-2xs mt-1 flex items-center gap-1.5 self-end rounded-xl border border-chart-2/40 bg-chart-2/15 px-4 py-2 text-xs font-bold text-chart-2 transition-all hover:bg-chart-2/25 active:scale-95"
                >
                  <CheckIcon ref={payIconRef} size={14} />
                  Registrar Novo Pagamento
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
