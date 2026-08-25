import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Wallet,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type {
  FinancialTransactionMonthSummary,
  FinancialTransactionResponse,
} from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getPaidAmount } from '@/utils/financialUtils';

interface FinancialSummaryCardV2Props {
  currentMonth: FinancialTransactionMonthSummary;
  previousMonth: FinancialTransactionMonthSummary;
  transactions: FinancialTransactionResponse[];
}

function getEffectiveAmount(t: FinancialTransactionResponse): number {
  if (t.paymentStatus === PaymentStatus.Paid) {
    return Math.max(getPaidAmount(t), Number(t.value) || 0);
  }
  return getPaidAmount(t);
}

/**
 * FinancialSummaryCardV2 — Card de Resumo de Caixa V2.
 * Exibe Saldo Real (Pago) vs Saldo Previsto (Fluxo Total),
 * com indicadores visuais de progresso de despesas quitadas.
 */
export function FinancialSummaryCardV2({
  currentMonth,
  previousMonth,
  transactions,
}: FinancialSummaryCardV2Props) {
  // Cálculo do Saldo Real vs Previsto com base nas transações do mês
  const paidIncome = transactions
    .filter((t) => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);

  const paidExpense = transactions
    .filter((t) => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);

  const realBalance = paidIncome - paidExpense;
  const projectedBalance = Number(currentMonth.balance);

  const totalExpense = Number(currentMonth.totalExpenses);
  const pendingExpense = totalExpense - paidExpense;
  const paidExpenseRatio = totalExpense > 0 ? paidExpense / totalExpense : 0;

  const delta = Number(currentMonth.totalExpenses) - Number(previousMonth.totalExpenses);
  const deltaPercent =
    Number(previousMonth.totalExpenses) > 0
      ? Math.round((delta / Number(previousMonth.totalExpenses)) * 100)
      : null;

  return (
    <div className="shadow-xs flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9.5 w-9.5 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={19} strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Resumo de Caixa
            </h3>
            <p className="font-ui text-xs text-muted-foreground">Efetivado vs. Previsto</p>
          </div>
        </div>

        {deltaPercent !== null && (
          <span
            className={`font-ui rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              delta > 0
                ? 'border-destructive/20 bg-destructive/10 text-destructive'
                : 'border-chart-2/20 bg-chart-2/10 text-chart-2'
            }`}
          >
            {delta >= 0 ? '+' : ''}
            {deltaPercent}% vs ant.
          </span>
        )}
      </div>

      {/* Hero KPIs: Saldo Real vs Previsto */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
        <div className="flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-ui flex cursor-help items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <CheckCircle2 size={12} className="text-chart-2" /> Saldo Real{' '}
                  <HelpCircle size={10} className="text-muted-foreground/70" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                <p>Total de receitas recebidas menos despesas já pagas no mês.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span
            className="font-ui text-base font-bold tracking-tight sm:text-lg"
            style={{ color: realBalance >= 0 ? 'var(--chart-2)' : 'var(--destructive)' }}
          >
            {formatCurrency(realBalance)}
          </span>
        </div>

        <div className="flex flex-col gap-1 border-l border-border/60 pl-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-ui flex cursor-help items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Clock size={12} className="text-primary" /> Saldo Previsto{' '}
                  <HelpCircle size={10} className="text-muted-foreground/70" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                <p>Projeção final do mês se todas as despesas e receitas forem quitadas.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span
            className="font-ui text-base font-bold tracking-tight sm:text-lg"
            style={{ color: projectedBalance >= 0 ? 'var(--foreground)' : 'var(--destructive)' }}
          >
            {formatCurrency(projectedBalance)}
          </span>
        </div>
      </div>

      {/* Barra de progresso de quitação de despesas */}
      <div className="font-ui flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-muted/20 p-3 text-xs">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>Despesas Quitadas</span>
          <span className="font-bold text-foreground">{Math.round(paidExpenseRatio * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-chart-2 transition-all duration-500"
            style={{ width: `${Math.round(paidExpenseRatio * 100)}%` }}
          />
        </div>
      </div>

      {/* Detalhamento Receitas e Despesas */}
      <div className="font-ui flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/30">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <ArrowUpRight size={15} className="text-chart-2" /> Receitas do mês
          </span>
          <span className="text-sm font-bold text-chart-2">
            {formatCurrency(Number(currentMonth.totalIncome))}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/30">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <ArrowDownRight size={15} className="text-destructive" /> Despesas do mês
          </span>
          <span className="text-sm font-bold text-destructive">
            {formatCurrency(Number(currentMonth.totalExpenses))}
          </span>
        </div>

        {pendingExpense > 0 && (
          <div className="flex items-center justify-between border-t border-dashed border-border/80 px-2 pt-2 text-muted-foreground">
            <span>Ainda a pagar neste mês</span>
            <span className="font-semibold text-foreground">{formatCurrency(pendingExpense)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
