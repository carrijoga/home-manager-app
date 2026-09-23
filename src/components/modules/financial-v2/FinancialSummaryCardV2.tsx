import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import {
  AnimatedCurrency,
  AnimatedPercent,
} from '@/components/common/AnimatedNumber';
import {
  SpringProgress,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
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
 * FinancialSummaryCardV2 — Card de Resumo de Liquidez e Inteligência Financeira V2.
 * Focado na taxa de quitação de despesas, contas vencidas, contas a liquidar e
 * comparativo com o mês anterior, sem redundância com os KPIs de topo.
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

  const overdueExpenses = transactions.filter(
    (t) =>
      t.transactionType === TransactionType.Expense &&
      t.isOverdue &&
      t.paymentStatus !== PaymentStatus.Paid
  );

  const overdueExpense = overdueExpenses.reduce(
    (sum, t) => sum + (Number(t.value) - getEffectiveAmount(t)),
    0
  );
  const overdueCount = overdueExpenses.length;

  const totalExpense = Number(currentMonth.totalExpenses);
  const totalIncome = Number(currentMonth.totalIncome);
  const pendingExpense = Math.max(0, totalExpense - paidExpense);
  const pendingIncome = Math.max(0, totalIncome - paidIncome);
  const paidExpenseRatio = totalExpense > 0 ? Math.min(1, paidExpense / totalExpense) : 0;
  const paidExpensePercent = Math.round(paidExpenseRatio * 100);

  // Variação frente ao mês anterior (despesas)
  const prevExpense = Number(previousMonth.totalExpenses);
  const deltaExpense = totalExpense - prevExpense;
  const deltaPercent =
    prevExpense > 0 ? Math.round((deltaExpense / prevExpense) * 100) : null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet size={20} strokeWidth={2.2} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold leading-tight text-foreground">
              Liquidez e Quitação
            </h3>
            <p className="font-ui text-xs text-muted-foreground">Compromissos e pendências do mês</p>
          </div>
        </div>

        {deltaPercent !== null && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`font-ui flex cursor-help items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
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
                    <AnimatedPercent value={Number(deltaPercent)} showSign /> vs ant.
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                <p>
                  {deltaExpense > 0 ? 'Aumento' : 'Redução'} de {formatCurrency(Math.abs(deltaExpense))} nas despesas previstas em relação ao mês anterior ({formatCurrency(prevExpense)}).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Destaque: Taxa e Barra de Quitação de Despesas */}
      <div className="flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-ui text-xs font-semibold text-muted-foreground">
            Despesas Quitadas no Mês
          </span>
          <AnimatedPercent
            value={paidExpensePercent}
            className="font-ui text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
          />
        </div>

        <SpringProgress
          value={paidExpensePercent}
          className="h-3 bg-muted/80"
          indicatorClassName="bg-chart-2"
        />

        <div className="flex items-center justify-between font-ui text-[11px] text-muted-foreground">
          <span><AnimatedCurrency value={paidExpense} /> quitados</span>
          <span>de <AnimatedCurrency value={totalExpense} /> total</span>
        </div>

        {paidExpensePercent === 100 && totalExpense > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-semibold text-chart-2">
            <CheckCircle2 size={13} />
            <span>Todos os compromissos do mês estão 100% quitados!</span>
          </div>
        )}
      </div>

      {/* Alerta Visual em Caso de Contas Vencidas */}
      {overdueExpense > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive transition-all">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-destructive/20 text-destructive">
            <AlertCircle size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-ui text-xs font-bold text-destructive">
              Atenção: <AnimatedCurrency value={overdueExpense} /> em atraso
            </span>
            <span className="font-ui text-[11px] text-destructive/90">
              {overdueCount === 1
                ? '1 conta vencida aguardando pagamento.'
                : `${overdueCount} contas vencidas aguardando pagamento.`}
            </span>
          </div>
        </div>
      )}

      {/* Detalhamento de Contas a Liquidar no Mês */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3.5">
        <div className="flex items-center justify-between">
          <span className="font-ui text-xs font-semibold text-muted-foreground">
            Ainda a liquidar neste mês
          </span>
          <AnimatedCurrency
            value={pendingExpense}
            className="font-ui text-base font-extrabold text-foreground tabular-nums"
          />
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2 font-ui text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Total de despesas previstas</span>
            <AnimatedCurrency value={totalExpense} className="font-medium text-foreground" />
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Já pago no período</span>
            <span className="font-medium text-chart-2">− <AnimatedCurrency value={paidExpense} /></span>
          </div>
          {pendingIncome > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Receitas ainda a receber</span>
              <span className="font-medium text-chart-2">+<AnimatedCurrency value={pendingIncome} /></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

