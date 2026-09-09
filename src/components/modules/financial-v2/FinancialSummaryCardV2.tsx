import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { PaymentStatus, TransactionType } from '@/schemas/enums';
import type {
  FinancialTransactionMonthSummary,
  FinancialTransactionResponse,
} from '@/schemas/financial';
import { formatCurrency } from '@/utils/dashboardMetrics';
import { getEffectiveAmount } from '@/utils/financialUtils';

interface FinancialSummaryCardV2Props {
  currentMonth: FinancialTransactionMonthSummary;
  previousMonth: FinancialTransactionMonthSummary;
  transactions: FinancialTransactionResponse[];
}

/**
 * FinancialSummaryCardV2 — Card de Resumo de Caixa e Saúde Financeira V2.
 * Apresenta Saldo Efetivado vs Saldo Previsto, taxa de liquidação de despesas,
 * análise de tendência frente ao mês anterior e detalhamento claro.
 */
export function FinancialSummaryCardV2({
  currentMonth,
  previousMonth,
  transactions,
}: FinancialSummaryCardV2Props) {
  // Cálculos de valores efetivados (já pagos / recebidos)
  const paidIncome = transactions
    .filter((t) => t.transactionType === TransactionType.Income)
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);

  const paidExpense = transactions
    .filter((t) => t.transactionType === TransactionType.Expense)
    .reduce((sum, t) => sum + getEffectiveAmount(t), 0);

  const overdueExpense = transactions
    .filter(
      (t) =>
        t.transactionType === TransactionType.Expense &&
        t.isOverdue &&
        t.paymentStatus !== PaymentStatus.Paid
    )
    .reduce((sum, t) => sum + (Number(t.value) - getEffectiveAmount(t)), 0);

  const realBalance = paidIncome - paidExpense;
  const projectedBalance = Number(currentMonth.balance);
  const totalExpense = Number(currentMonth.totalExpenses);
  const totalIncome = Number(currentMonth.totalIncome);
  const pendingExpense = Math.max(0, totalExpense - paidExpense);
  const paidExpenseRatio = totalExpense > 0 ? Math.min(1, paidExpense / totalExpense) : 0;
  const paidExpensePercent = Math.round(paidExpenseRatio * 100);

  // Variação frente ao mês anterior (despesas)
  const prevExpense = Number(previousMonth.totalExpenses);
  const deltaExpense = totalExpense - prevExpense;
  const deltaPercent =
    prevExpense > 0 ? Math.round((deltaExpense / prevExpense) * 100) : null;

  return (
    <div className="flex flex-col gap-4.5 rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={20} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Resumo de Caixa
            </h3>
            <p className="font-ui text-xs text-muted-foreground">Efetivado vs. Previsto no Mês</p>
          </div>
        </div>

        {deltaPercent !== null && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`font-ui flex cursor-help items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                    deltaExpense > 0
                      ? 'border-destructive/25 bg-destructive/10 text-destructive'
                      : 'border-chart-2/25 bg-chart-2/10 text-chart-2'
                  }`}
                >
                  {deltaExpense > 0 ? (
                    <TrendingUp size={13} strokeWidth={2.5} />
                  ) : (
                    <TrendingDown size={13} strokeWidth={2.5} />
                  )}
                  <span>
                    {deltaExpense >= 0 ? '+' : ''}
                    {deltaPercent}% vs ant.
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>
                  Comparação de despesas: {formatCurrency(totalExpense)} neste mês vs.{' '}
                  {formatCurrency(prevExpense)} no mês anterior.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Grid de Hero KPIs: Saldo Real vs Previsto */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5 sm:p-4">
        {/* Saldo Real */}
        <div className="flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-ui flex cursor-help items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                  <CheckCircle2 size={13} className="text-chart-2" />
                  Saldo em Caixa
                  <HelpCircle size={10} className="text-muted-foreground/60" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                <p>Receitas já recebidas menos despesas já pagas efetivamente até agora.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span
            className="font-ui text-lg font-extrabold tracking-tight sm:text-xl"
            style={{ color: realBalance >= 0 ? 'var(--chart-2)' : 'var(--destructive)' }}
          >
            {formatCurrency(realBalance)}
          </span>
          <span className="font-ui text-[10px] text-muted-foreground">
            {paidIncome >= paidExpense ? 'Superávit realizado' : 'Déficit no caixa'}
          </span>
        </div>

        {/* Saldo Previsto */}
        <div className="flex flex-col gap-1 border-l border-border/60 pl-3.5 sm:pl-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-ui flex cursor-help items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                  <Clock size={13} className="text-primary" />
                  Saldo Previsto
                  <HelpCircle size={10} className="text-muted-foreground/60" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">
                <p>
                  Projeção final do mês considerando 100% das receitas e despesas cadastradas.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span
            className="font-ui text-lg font-extrabold tracking-tight sm:text-xl"
            style={{ color: projectedBalance >= 0 ? 'var(--foreground)' : 'var(--destructive)' }}
          >
            {formatCurrency(projectedBalance)}
          </span>
          <span className="font-ui text-[10px] text-muted-foreground">
            {projectedBalance >= 0 ? 'Projeção positiva' : 'Projeção negativa'}
          </span>
        </div>
      </div>

      {/* Barra de Progresso de Quitação de Despesas */}
      <div className="font-ui flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/20 p-3 text-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-chart-2" />
            Despesas Quitadas no Mês
          </span>
          <span className="font-bold text-foreground">
            {paidExpensePercent}% ({formatCurrency(paidExpense)})
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-chart-2 transition-all duration-600 ease-out"
            style={{ width: `${paidExpensePercent}%` }}
          />
        </div>

        {overdueExpense > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-destructive">
            <AlertCircle size={11} />
            <span>Atenção: {formatCurrency(overdueExpense)} em contas vencidas</span>
          </div>
        )}
      </div>

      {/* Detalhamento de Fluxo (Receitas e Despesas) */}
      <div className="font-ui flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-muted/40">
          <span className="flex items-center gap-2 font-medium text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-chart-2/15 text-chart-2">
              <ArrowUpRight size={13} strokeWidth={2.5} />
            </div>
            Total de Receitas
          </span>
          <div className="text-right">
            <span className="font-bold text-chart-2">{formatCurrency(totalIncome)}</span>
            {paidIncome < totalIncome && (
              <span className="block text-[10px] text-muted-foreground">
                ({formatCurrency(paidIncome)} recebido)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl px-2.5 py-1.5 transition-colors hover:bg-muted/40">
          <span className="flex items-center gap-2 font-medium text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-destructive/15 text-destructive">
              <ArrowDownRight size={13} strokeWidth={2.5} />
            </div>
            Total de Despesas
          </span>
          <div className="text-right">
            <span className="font-bold text-destructive">{formatCurrency(totalExpense)}</span>
            {pendingExpense > 0 && (
              <span className="block text-[10px] text-muted-foreground">
                ({formatCurrency(pendingExpense)} restante)
              </span>
            )}
          </div>
        </div>

        {pendingExpense > 0 && (
          <div className="mt-1 flex items-center justify-between border-t border-dashed border-border/80 px-2.5 pt-2 text-[11px] text-muted-foreground">
            <span className="font-medium">Ainda a liquidar neste mês</span>
            <span className="font-bold text-foreground">{formatCurrency(pendingExpense)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

